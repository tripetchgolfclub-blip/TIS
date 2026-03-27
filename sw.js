const CACHE_NAME = 'tis-golf-v2';

const ASSETS = [
  '/TIS/home.html',
  '/TIS/manifest.json',
  '/TIS/icon-192.png',
  '/TIS/icon-512.png'
];

// Install — cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET and cross-origin
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => {
        return caches.match(e.request).then(res => {
          // ถ้าไม่มีใน cache → fallback ไป home.html
          return res || caches.match('/TIS/home.html');
        });
      })
  );
});
