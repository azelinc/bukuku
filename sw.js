const CACHE_NAME = 'af-hub-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/school.html',
  '/pc.css',
  '/mobile.css',
  '/math.json',
  '/eng.json',
  '/sci.json'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch Assets from Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
