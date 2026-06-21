// This service worker exists only to unregister any previously-installed
// service worker and clear stale caches that were causing a blank page.
// Once all clients have picked this up, this file (and the <link>/registration
// referencing it, if any) can be safely deleted.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete all caches this service worker (or its predecessor) created
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister self so the browser stops using any service worker here
      await self.registration.unregister();

      // Force all open tabs controlled by this worker to reload with a
      // fresh, network-only version of the page
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
