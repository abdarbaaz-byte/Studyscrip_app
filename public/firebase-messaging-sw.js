// 1. PWA Service Worker ko import karein (Jo next-pwa banata hai)
// Iske bina "Install App" ka option nahi aayega
importScripts('/sw.js');

// 2. Firebase SDKs import karein (compat version for worker support)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 3. Firebase Initialize karein
// KRIPYA YAHAN APNI ORIGINAL KEYS WAPAS PASTE KAREIN
const firebaseConfig = {
  apiKey: "AIzaSyAogMOncvmZLqQ1qom0d3RDihdqOB9XRiY",
  authDomain: "studyscript.firebaseapp.com",
  projectId: "studyscript",
  storageBucket: "studyscript.firebasestorage.app",
  messagingSenderId: "891979418045",
  appId: "1:891979418045:web:047bfd8a00e148c14dead4",
  measurementId: "G-6NP8685E6D"
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
