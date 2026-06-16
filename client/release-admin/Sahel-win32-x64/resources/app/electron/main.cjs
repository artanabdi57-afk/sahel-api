const { app, BrowserWindow, shell } = require("electron");
const { fork } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const isDev = !app.isPackaged;
let staticServer;
let apiProcess;

function getAppIconPath() {
  return path.join(__dirname, "..", "assets", "icon.ico");
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
    const timeout = setTimeout(() => reject(new Error("Sahel API took too long to start.")), 20000);

    childProcess.on("message", (message) => {
      if (message?.type === "sahel-api-ready") {
        clearTimeout(timeout);
        resolve(message.port);
      }
    });

    childProcess.on("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Sahel API stopped before it was ready. Exit code: ${code}`));
    });
  });
}

async function startBundledApi() {
  const apiDir = getBundledApiDir();
  const serverPath = path.join(apiDir, "src", "server.js");

  apiProcess = fork(serverPath, {
    cwd: apiDir,
    env: ensureRuntimeEnv(apiDir),
    stdio: ["ignore", "ignore", "ignore", "ipc"]
  });

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
  const apiBaseUrl = isDev ? "http://localhost:3000/api" : await startBundledApi();

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

  const startUrl = isDev ? "http://localhost:5173" : `${await startStaticServer()}?apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`;
  await mainWindow.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (staticServer) staticServer.close();
  if (apiProcess) apiProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
