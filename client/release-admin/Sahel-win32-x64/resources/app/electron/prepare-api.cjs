const fs = require("fs");
const path = require("path");

const clientDir = path.join(__dirname, "..");
const projectDir = path.join(clientDir, "..");
const outputDir = path.join(clientDir, "desktop-api");

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      if (["node_modules", ".git", "client"].includes(entry.name)) continue;
      copyDir(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

copyDir(path.join(projectDir, "src"), path.join(outputDir, "src"));
fs.copyFileSync(path.join(projectDir, "package.json"), path.join(outputDir, "package.json"));
fs.copyFileSync(path.join(projectDir, "package-lock.json"), path.join(outputDir, "package-lock.json"));

if (fs.existsSync(path.join(projectDir, ".env"))) {
  fs.copyFileSync(path.join(projectDir, ".env"), path.join(outputDir, ".env"));
}

fs.cpSync(path.join(projectDir, "node_modules"), path.join(outputDir, "node_modules"), {
  recursive: true,
  filter(source) {
    return !source.includes(`${path.sep}.cache${path.sep}`);
  }
});

console.log(`Prepared bundled API in ${outputDir}`);
