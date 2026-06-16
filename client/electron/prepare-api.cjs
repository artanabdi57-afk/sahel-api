const fs = require("fs");
const path = require("path");

const clientDir = path.join(__dirname, "..");
const projectDir = path.join(clientDir, "..");
const outputDir = path.join(clientDir, "desktop-api");
const esbuild = require("esbuild");

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

esbuild.buildSync({
  entryPoints: [path.join(projectDir, "src", "server.js")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: path.join(outputDir, "server.bundle.cjs"),
  define: {
    "process.env.SAHEL_DESKTOP_BUNDLE": "\"1\""
  }
});

if (fs.existsSync(path.join(projectDir, ".env"))) {
  fs.copyFileSync(path.join(projectDir, ".env"), path.join(outputDir, ".env"));
}

console.log(`Prepared bundled API in ${outputDir}`);
