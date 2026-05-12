
/* 
  StudyScript FCM Service Worker
  Kripya neeche diye gaye config mein apni ORIGINAL KEYS paste karein.
*/

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Payload data se values nikalna
  const notificationTitle = payload.data.title || "StudyScript Update";
  const notificationOptions = {
    body: payload.data.body || "Aapke liye ek naya sandesh hai.",
    icon: payload.data.icon || '/icons/icon-192x192.png',
    data: {
      link: payload.data.link || '/'
    }
  };

  // Notification dikhana
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handle karna
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.');
  
  event.notification.close();

  // Link read karna
  const targetUrl = event.notification.data.link || '/';

  // Browser tab open ya focus karna
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if window is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
