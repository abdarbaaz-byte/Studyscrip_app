
/*
 * UNIFIED SERVICE WORKER
 * Handles both PWA Caching and Firebase Cloud Messaging
 */

// 1. Import Firebase SDK for Service Workers
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 2. Initialize Firebase in the Service Worker
// REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. Optional: Import PWA Service Worker (next-pwa generated)
// We wrap this in try-catch because sw.js might not exist in development
try {
  importScripts('/sw.js');
  console.log("FCM SW: PWA sw.js imported successfully.");
} catch (e) {
  console.warn("FCM SW: sw.js (PWA) not found. This is normal in development mode.");
}

// 4. Handle Background Notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.data?.title || payload.notification?.title || 'StudyScript Update';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || 'Check the app for details.',
    icon: '/icons/icon-192x192.png',
    data: {
        link: payload.data?.link || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 5. Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.navigate(link).then(c => c?.focus());
      }
      return clients.openWindow(link);
    })
  );
});
