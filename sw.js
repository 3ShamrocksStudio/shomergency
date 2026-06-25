// SH✡MER Service Worker v2
// Offline support + Push notifications for emergency alerts
// By 3Shamrocks.Studio
//
// NOTE: github.io serves every project of an org from ONE shared origin
// (https://<org>.github.io). A service worker or CacheStorage left behind by
// another project on that origin can hijack navigations. This SW therefore
// (a) uses network-first for navigations so a stale shell can never trap the
// user, and (b) deletes every cache it does not own on activate.

const CACHE_NAME = 'shomer-v53-cache';
const SW_VERSION = 'v53';
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
  // NOTE: deliberately NO skipWaiting() here. On a first-ever install (no active
  // worker) the SW activates immediately anyway; on an UPDATE it must WAIT so it
  // can't take over mid-session and trigger a controllerchange reload that kills
  // the in-progress Firebase sign-in / RTDB socket. The new worker applies on the
  // next cold launch. (A user-initiated force-update still works via the message
  // handler + the page's "Force-update to latest" button.)
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

  // CRITICAL: only ever handle SAME-ORIGIN requests. Cross-origin requests
  // (Firebase RTDB long-poll + auth on firebaseio.com / googleapis.com / gstatic,
  // map tiles, OSRM, fonts) must go straight to the network, untouched by the SW.
  // Intercepting Firebase's HTTP fallback transport breaks the realtime connection
  // on mobile networks that block WebSockets — the app then hangs on "connecting".
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  // ESCAPE HATCH: never touch the reset page or any ?nosw / ?fresh request. Let
  // them go straight to the network so this SW can never trap a user who is
  // trying to force the latest build. (reset.html is also never cached.)
  if (/(^|\/)(reset|rtdb-test)\.html$/.test(url.pathname) || /[?&](nosw|fresh)\b/i.test(url.search)) {
    return; // no respondWith → default browser network handling
  }

  // Navigation requests: network-first, fall back to cached app shell.
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

  // Same-origin assets: cache-first, then network (offline-friendly).
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});

// Allow the page to tell the SW to activate immediately after an update,
// and to ASK which version is actually controlling the page (so the diagnostic
// panel can show "are we on the latest build, or a stale cached SW?").
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data === 'version' && event.ports && event.ports[0]) {
    event.ports[0].postMessage(SW_VERSION);
  }
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
