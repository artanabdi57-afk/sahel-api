const { app, BrowserWindow, dialog, shell } = require("electron");
const { fork, spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const isDev = !app.isPackaged;
let staticServer;
let apiProcess;

function appendLog(message) {
  try {
    const logPath = path.join(app.getPath("userData"), "sahel-desktop.log");
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logPath, line);
  } catch {
    // Logging should never stop the app from starting.
  }
}

function runSquirrelCommand(args) {
  const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
  const child = spawn(updateExe, args, { detached: true });
  child.on("close", () => app.quit());
}

function handleSquirrelEvent() {
  if (process.platform !== "win32") return false;

  const event = process.argv[1];
  const exeName = path.basename(process.execPath);

  if (event === "--squirrel-install" || event === "--squirrel-updated") {
    runSquirrelCommand(["--createShortcut", exeName]);
    return true;
  }

  if (event === "--squirrel-uninstall") {
    runSquirrelCommand(["--removeShortcut", exeName]);
    return true;
  }

  if (event === "--squirrel-obsolete") {
    app.quit();
    return true;
  }

  return false;
}

function getAppIconPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "sahel-icon.ico");
  }

  return path.join(__dirname, "..", "assets", "sahel-icon.ico");
}

function getBundledApiDir() {
  if (isDev) {
    return path.join(__dirname, "..", "..");
  }

  return path.join(process.resourcesPath, "desktop-api");
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};

  return fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return values;
      const separatorIndex = trimmedLine.indexOf("=");
      if (separatorIndex === -1) return values;

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();
      values[key] = value;
      return values;
    }, {});
}

function ensureRuntimeEnv(apiDir) {
  const userEnvPath = path.join(app.getPath("userData"), ".env");
  const projectEnvPath = path.join(apiDir, ".env");

  if (!fs.existsSync(userEnvPath) && fs.existsSync(projectEnvPath)) {
    fs.copyFileSync(projectEnvPath, userEnvPath);
  }

  return {
    ...process.env,
    ...loadEnvFile(projectEnvPath),
    ...loadEnvFile(userEnvPath),
    PORT: "0",
    SAHEL_DESKTOP_API: "1"
  };
}

function waitForApiPort(childProcess) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Sahel API took too long to start. Check sahel-desktop.log.")), 30000);

    childProcess.on("message", (message) => {
      if (message?.type === "sahel-api-ready") {
        appendLog(`API ready on port ${message.port}`);
        clearTimeout(timeout);
        resolve(message.port);
      }
    });

    childProcess.on("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Sahel API stopped before it was ready. Exit code: ${code}. Check sahel-desktop.log.`));
    });
  });
}

async function startBundledApi() {
  const apiDir = getBundledApiDir();
  const bundledServerPath = path.join(apiDir, "server.bundle.cjs");
  const serverPath = fs.existsSync(bundledServerPath) ? bundledServerPath : path.join(apiDir, "src", "server.js");
  const logPath = path.join(app.getPath("userData"), "sahel-api.log");
  const logStream = fs.createWriteStream(logPath, { flags: "a" });

  appendLog(`Starting API from ${serverPath}`);
  apiProcess = fork(serverPath, {
    cwd: apiDir,
    env: {
      ...ensureRuntimeEnv(apiDir),
      ELECTRON_RUN_AS_NODE: "1"
    },
    execPath: process.execPath,
    stdio: ["ignore", "pipe", "pipe", "ipc"]
  });

  apiProcess.stdout?.pipe(logStream);
  apiProcess.stderr?.pipe(logStream);

  const port = await waitForApiPort(apiProcess);
  return `http://127.0.0.1:${port}/api`;
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon"
  };

  return types[extension] || "application/octet-stream";
}

function startStaticServer() {
  const distDir = path.join(__dirname, "..", "dist");

  staticServer = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const cleanPath = decodeURIComponent(requestUrl.pathname);
    const requestedFile = path.normalize(path.join(distDir, cleanPath));
    const isInsideDist = requestedFile.startsWith(distDir);
    const filePath =
      isInsideDist && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()
        ? requestedFile
        : path.join(distDir, "index.html");

    response.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve) => {
    staticServer.listen(0, "127.0.0.1", () => {
      const { port } = staticServer.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 390,
    minHeight: 700,
    backgroundColor: "#f8fbff",
    title: "Sahel",
    icon: getAppIconPath(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.removeMenu();
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  try {
    const apiBaseUrl = isDev ? "http://localhost:3000/api" : await startBundledApi();
    const startUrl = isDev ? "http://localhost:5173" : `${await startStaticServer()}?apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`;
    await mainWindow.loadURL(startUrl);
  } catch (error) {
    appendLog(error.stack || error.message);
    dialog.showErrorBox("Sahel could not start", `${error.message}\n\nLog folder:\n${app.getPath("userData")}`);
    await mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`
        <body style="font-family:Arial,sans-serif;background:#f8fbff;color:#0f172a;padding:40px">
          <h1>Sahel could not start</h1>
          <p>${error.message}</p>
          <p>Log folder: ${app.getPath("userData")}</p>
        </body>
      `)}`
    );
  }
}

if (!handleSquirrelEvent()) {
  app.whenReady().then(createWindow);
}

app.on("window-all-closed", () => {
  if (staticServer) staticServer.close();
  if (apiProcess) apiProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
