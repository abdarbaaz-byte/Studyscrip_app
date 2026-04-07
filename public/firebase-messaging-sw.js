// This script is required for Firebase Cloud Messaging to receive 
// background notifications on the web.

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// These values are injected or should be hardcoded if needed, 
// but FCM can often initialize with minimal config in the SW.
firebase.initializeApp({
  apiKey: true, // Placeholder, browser handles auth via VAPID
  projectId: "studyscript-001", // Replace with your actual project ID if delivery fails
  messagingSenderId: "782631529406", // Replace with your actual Sender ID
  appId: "1:782631529406:web:..." // Replace with your actual App ID
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
        url: payload.data ? payload.data.link : '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open the app link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
