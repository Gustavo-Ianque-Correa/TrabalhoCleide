const CACHE_NAME = 'bazaarplus-cache-v1';
const urlsToCache = [
  'index.html',
  'loja.html',
  'produto.html',
  'auth.html',
  'style.css',
  'app.js',
  'loja.js',
  'produto.js',
  'auth.js',
  'BazaarPlus_logo_website.png'
];
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
}); 