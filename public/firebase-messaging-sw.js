
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// [PASTE YOUR ORIGINAL FIREBASE CONFIG KEYS HERE]
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

/**
 * Handles background messages. 
 * Using 'data-only' payload ensures the browser doesn't show 
 * a default notification, allowing us to control visuals and duplication.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.data.title || "StudyScript Update";
  const notificationOptions = {
    body: payload.data.body || payload.data.description || "You have a new message",
    icon: payload.data.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: {
      link: payload.data.link || "/"
    },
    // Tag prevents duplicate notifications for the same event
    tag: payload.data.link || 'general-notification', 
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handles clicks on the notification tray.
 * Opens the URL provided in the payload data.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open with the URL, focus it
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
