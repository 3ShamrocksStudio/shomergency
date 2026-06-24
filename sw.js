// SH✡MER Service Worker v2
// Offline support + Push notifications for emergency alerts
// By 3Shamrocks.Studio
//
// NOTE: github.io serves every project of an org from ONE shared origin
// (https://<org>.github.io). A service worker or CacheStorage left behind by
// another project on that origin can hijack navigations. This SW therefore
// (a) uses network-first for navigations so a stale shell can never trap the
// user, and (b) deletes every cache it does not own on activate.

const CACHE_NAME = 'shomer-v40-cache';
const urlsToCache = [
  './',
  'index.html',
  'shomer.html',
  'manifest.json',
  'logo-192.png',
  'logo-512.png',
  'sos-icon-96.png',
  'report-icon-96.png',
  '3shamrocks.png',
  'SHOMER_logo_big.png',
  'SHOMER-bg.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Purge ALL other caches on this (shared) origin — including any left by
    // sibling org projects — so nothing stale or foreign can be served.
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navigation requests: network-first, fall back to cached app shell.
  // This guarantees a fresh page load and prevents a stale cache from
  // pinning the user to an old (or wrong) version of the app.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('shomer.html')))
    );
    return;
  }

  // Other assets: cache-first, then network (offline-friendly).
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});

// Allow the page to tell the SW to activate immediately after an update.
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// Push notification handler (for SOS / emergency alerts)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🚨 SH✡MER Emergency Alert';
  const options = {
    body: data.body || 'Immediate help needed nearby. Tap to open map.',
    icon: 'logo-192.png',
    badge: 'logo-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'shomer-emergency',
    requireInteraction: true,
    actions: [
      { action: 'open-map', title: 'Open Map' },
      { action: 'call-100', title: 'Call 100' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'call-100') {
    clients.openWindow('tel:100');
  } else {
    clients.openWindow('shomer.html');
  }
});
