/*
 * Service Worker for Khazaen al‑Nur
 *
 * This service worker implements basic offline caching for the application.
 * It pre‑caches essential assets such as the main HTML file, CSS, key
 * JavaScript modules, the manifest and icons. For other resources it
 * employs a cache‑first strategy where cached resources are served if
 * available and network responses are cached on the fly. When offline
 * and navigation requests fail, it falls back to the cached index.html.
 */

const CACHE_NAME = 'khazaen-cache-v1';

// List of files to pre‑cache. These should include the core assets
// necessary for the app shell to load when offline. Additional assets
// (such as dynamic content) will be cached at runtime.
const urlsToCache = [
  './',
  'index.html',
  'css/style.css',
  'js/navigation/navigation.js',
  'js/theme/theme.js',
  'js/settings/settings.js',
  'js/sidebar/sidebar.js',
  'js/favorites/favorites.js',
  'js/search/searchData.js',
  'js/search/search.js',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Install event: pre‑cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

// Fetch event: respond with cached resources when available
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then(networkResponse => {
          // Only cache requests to our origin. This avoids caching third‑party
          // resources such as fonts or analytics scripts that may block the
          // service worker if they are not CORS‑enabled.
          if (event.request.url.startsWith(self.location.origin)) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If the request is a navigation to a page and fails, return the
          // offline fallback (index.html).
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
    })
  );
});