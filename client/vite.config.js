import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import prerender from "@prerenderer/rollup-plugin";

// Prerendering only runs when TARGET=web is set — desktop (Electron)
// and mobile (Capacitor) builds never trigger this, so they're unaffected.
const isWebBuild = process.env.TARGET === "web";

export default defineConfig({
  plugins: [
    react(),
    ...(isWebBuild
      ? [
          prerender({
            // Add any other public/marketing route here later
            // (blog posts, pricing, etc.) — this array is the only
            // place you need to touch to prerender a new page.
            routes: ["/welcome"],
            renderer: "@prerenderer/renderer-puppeteer",
            rendererOptions: {
              renderAfterDocumentEvent: "custom-render-trigger",
            },
          }),
        ]
      : []),
  ],
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
