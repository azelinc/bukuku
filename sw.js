const CACHE_NAME = 'af-hub-v15';

// Only cache JSON question banks and static assets, NOT HTML pages
// HTML pages must always load fresh from network to reflect latest code
const ASSETS = [
  '/topic-counts.json',
  '/pc.css',
  '/mobile.css',
  '/manifest.json',
  '/math.json',
  '/eng.json',
  '/sci.json',
  '/rbt.json',
  '/math4-tb.json',
  '/math4-bm.json',
  '/sci4-bm.json',
  '/math5-tb.json',
  '/eng4-tb.json',
  '/eng5-tb.json',
  '/eng6-tb.json',
  '/bm4-tb.json',
  '/bm5-tb.json',
  '/bm6-tb.json',
  '/pi4-tb.json',
  '/pi5-tb.json',
  '/pi6-tb.json'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch: network-first for HTML, cache-first for everything else
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isHtml = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/');
  if (isHtml) {
    // HTML pages: always try network first, never cache them
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    // Static assets: cache-first, update in background
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return resp;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});

// Clean old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
});
