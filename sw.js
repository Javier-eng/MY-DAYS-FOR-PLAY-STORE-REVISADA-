const CACHE_NAME = 'my-days-v1';
 
// Files to cache for offline use
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest-es.json',
  '/manifest-en.json',
  'https://cdn.tailwindcss.com'
];
 
// Install Event: Saves assets in cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});
 
// Activate Event: Cleans up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});
 
// Fetch Event: Network first, then fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
