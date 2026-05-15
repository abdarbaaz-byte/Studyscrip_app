// 1. PWA Service Worker ko import karein (Jo next-pwa banata hai)
// Iske bina "Install App" ka option nahi aayega
importScripts('/sw.js');

// 2. Firebase SDKs import karein (compat version for worker support)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 3. Firebase Initialize karein
// KRIPYA YAHAN APNI ORIGINAL KEYS WAPAS PASTE KAREIN
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 4. Background Notification Handler (Data-only payload ke liye)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  if (!payload.data) return;

  const notificationTitle = payload.data.title || "StudyScript Update";
  const notificationOptions = {
    body: payload.data.body || "You have a new message",
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      link: payload.data.link || '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 5. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check agar app pehle se khuli hai toh wahi tab use karein
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Agar nahi khuli toh naya tab/window kholein
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
