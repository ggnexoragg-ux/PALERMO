const CACHE_NAME = 'palermo-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('palermo-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Always prefer the live site for navigation and game requests. Do not cache
  // dynamic gameplay/API responses, so updates and multiplayer remain current.
  if (request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response('Palermo needs an internet connection. Please reconnect and try again.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }));
  }
});
