// NEB Exam Service Worker
const CACHE = 'nebexam-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) =>
  e.waitUntil(self.clients.claim())
);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.startsWith('chrome-extension')) return;

  // Cache static assets; network-first for everything else
  const isStatic =
    req.url.includes('/_next/static/') || req.url.includes('/assets/');

  if (isStatic) {
    e.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
            return res;
          })
      )
    );
  } else {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  }
});
