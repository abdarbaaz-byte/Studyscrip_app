
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// [PASTE YOUR ORIGINAL FIREBASE CONFIG KEYS HERE]
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
