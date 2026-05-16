
// Unified Service Worker for PWA and FCM
importScripts('https://www.gstatic.com/firebasejs/10.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.1/firebase-messaging-compat.js');

// 1. Load PWA Caching logic from next-pwa generated worker
importScripts('/sw.js');

// 2. Initialize Firebase in the Service Worker
// NOTE: Replace these placeholders with your actual project config from the Firebase Console
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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.data.title || "StudyScript Update";
  const notificationOptions = {
    body: payload.data.body || "You have a new update.",
    icon: '/icons/icon-192x192.png',
    data: { link: payload.data.link || '/' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data.link || '/';
  event.waitUntil(
    clients.openWindow(link)
  );
});
