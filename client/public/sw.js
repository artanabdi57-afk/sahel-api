const CACHE = "sahel-shell-v4";
const APP_SHELL = ["/welcome", "/site.webmanifest", "/sahel-icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.includes("/auth/")) return;

  // Never serve stale HTML for navigations. This prevents Chrome/Edge from
  // getting an old app shell after a new deployment.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/welcome")));
    return;
  }

  // Static assets can safely use cache-first because Vite fingerprints them.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response && response.ok && (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".svg") || url.pathname.endsWith(".woff2"))) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
