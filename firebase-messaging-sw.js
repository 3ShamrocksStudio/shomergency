/* SH✡MER — FCM background message handler (Spark plan).
   Shows push notifications while the app is backgrounded. (Fully-closed delivery and a server
   sender still need Cloud Functions / Blaze — see FIREBASE-SETUP.md.) */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAfevYysNLWMtXluY5lZSM_VY0eyDwZ6KQ',
  authDomain: 'shomergency.firebaseapp.com',
  projectId: 'shomergency',
  messagingSenderId: '745767303099',
  appId: '1:745767303099:web:6c9605fbba940430b7769e'
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  const n = (payload && payload.notification) || {};
  self.registration.showNotification(n.title || 'SH✡MER', {
    body: n.body || '',
    icon: 'logo-192.png',
    badge: 'logo-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: (payload && payload.data && payload.data.tag) || 'shomer-fcm'
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('shomer.html'));
});
