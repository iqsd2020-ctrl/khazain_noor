/* خزائن النور Service Worker */
const VERSION = 'v1.2.2';
const SHELL_CACHE = `khazain-shell-${VERSION}`;
const RUNTIME_CACHE = `khazain-runtime-${VERSION}`;

// App shell (relative to sw.js location)
const APP_SHELL = [
  './',
  'index.html',
  'style.css',
  'manifest.json',
  'js/db.js',
  'js/days.js',
  'js/audio.js',
  'js/quran.js',
  'js/occasions.js',
  'js/main.js',
  'js/play.js',
  'js/actions.js',
  'js/start.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-192-maskable.png',
  'icons/icon-512-maskable.png',
  'json/duas.json',
  'json/monajat.json',
  'json/ziyarat.json',
  'json/baqiyat.json',
  'json/days.json',
  'json/months.json',
  'json/nahj_balagha.json',
  'json/aqaid_imamiah.json',
  'json/rights.json',
  'json/monasbat.json',
  'json/a3mal_days.json',
  'json/friday_duas_audio.json',
  'json/القران الكريم.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![SHELL_CACHE, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Helper: cache as runtime if successful
async function cachePut(request, response) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response);
  } catch (_) {}
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Google Fonts (cross-origin): stale-while-revalidate
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const fetchPromise = fetch(req)
        .then((res) => {
          // opaque responses are ok to cache
          cachePut(req, res.clone());
          return res;
        })
        .catch(() => cached || Response.error());
      return cached || fetchPromise;
    })());
    return;
  }

  // Only handle same-origin for the rest
  if (url.origin !== self.location.origin) return;

  // SPA-ish navigation: serve cached index.html when offline
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const indexReq = new Request('index.html');
      const cached = await caches.match(indexReq);
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) cachePut(indexReq, fresh.clone());
        return fresh;
      } catch (_) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Cache-first for app shell & static assets, runtime fallback to network
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res && res.ok) {
        // Cache JSON/TXT/scripts/styles/fonts/images for offline
        const path = url.pathname;
        const isGoogleFonts = (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com');
        const shouldCache =
          isGoogleFonts ||
          path.includes('/js/') ||
          path.includes('/json/') ||
          path.includes('/txt/') ||
          path.includes('/icons/') ||
          path.endsWith('.css') ||
          path.endsWith('.html') ||
          path.endsWith('.png') ||
          path.endsWith('.jpg') ||
          path.endsWith('.jpeg') ||
          path.endsWith('.svg') ||
          path.endsWith('.webp') ||
          path.endsWith('.ttf') ||
          path.endsWith('.woff') ||
          path.endsWith('.woff2');
        if (shouldCache) cachePut(req, res.clone());
      }
      return res;
    } catch (_) {
      // Offline fallback
      return cached || Response.error();
    }
  })());
});

// Allow the page to trigger immediate activation
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
