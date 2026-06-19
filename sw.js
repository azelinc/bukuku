const CACHE_NAME = 'af-hub-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/school.html',
  '/schoolhigh.html',
  '/sifir.html',
  '/tuition-quiz.html',
  '/train-engine.html',
  '/games.html',
  '/game-memory-match.html',
  '/game-dragon-dash.html',
  '/storybook.html',
  '/book-dragon.html',
  '/book-space.html',
  '/book-squirrel.html',
  '/buku-solar.html',
  '/buku-tenaga-air.html',
  '/mathhigh.html',
  '/pc.css',
  '/mobile.css',
  '/manifest.json',
  '/math.json',
  '/eng.json',
  '/sci.json',
  '/rbt.json'
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

// Clean old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
});
