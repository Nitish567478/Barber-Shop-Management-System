// Service Worker for BarberShop PWA
const CACHE_NAME = 'barbershop-pwa-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://i.ibb.co/0yYptF9d/website-logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Safely parse URL and only handle http and https requests
  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // Chrome extensions (chrome-extension://), blob:, data:, etc. MUST be ignored
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Never cache backend API requests
  if (url.pathname.startsWith('/api') || url.pathname.includes('/api/')) {
    return;
  }

  // For HTML navigation requests, ALWAYS use Network-First to never serve stale app code
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            }).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets, use Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse).catch(() => {});
            }).catch(() => {});
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache).catch(() => {});
        }).catch(() => {});

        return networkResponse;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
