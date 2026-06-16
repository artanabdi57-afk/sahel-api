const path = require("path");
const { createWindowsInstaller } = require("electron-winstaller");

const rootDir = path.join(__dirname, "..");
const appDirectory = path.join(rootDir, "release", "Sahel-win32-x64");
const outputDirectory = path.join(rootDir, "release", "installer");
const iconPath = path.join(rootDir, "assets", "icon.ico");

createWindowsInstaller({
  appDirectory,
  outputDirectory,
  authors: "Sahel",
  exe: "Sahel.exe",
  setupExe: "SahelSetup.exe",
  iconUrl: iconPath,
  setupIcon: iconPath,
  noMsi: true
})
  .then(() => {
    console.log(`Installer created: ${path.join(outputDirectory, "SahelSetup.exe")}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
