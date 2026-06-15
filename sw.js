// SH✡MER Service Worker v1.0
// Offline support + Push notifications for emergency alerts
// By 3Shamrocks.Studio

const CACHE_NAME = 'shomer-v12-cache-v1';
const urlsToCache = [
  './',
  'shomer.html',
  'manifest.json',
  'logo-192.png',
  'logo-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
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

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'call-100') {
    clients.openWindow('tel:100');
  } else {
    clients.openWindow('shomer.html');
  }
});
