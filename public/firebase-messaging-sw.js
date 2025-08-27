
// Import the Firebase app and messaging services
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// IMPORTANT: This file needs to be in the public folder.

// Your web app's Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyAogMOncvmZLqQ1qom0d3RDihdqOB9XRiY",
  authDomain: "studyscript.firebaseapp.com",
  projectId: "studyscript",
  storageBucket: "studyscript.appspot.com",
  messagingSenderId: "891979418045",
  appId: "1:891979418045:web:bd3903f3dfd23dc54dead4",
  measurementId: "G-7WJ302P118"
};


// Initialize the Firebase app in the service worker
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// This handler will be called when the app is in the background or
// closed and a push notification is received.
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize the notification here
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'Something new happened!',
    icon: '/icon-192x192.png',
    badge: '/logo-icon.svg',
    data: {
      url: payload.fcmOptions?.link || '/' // Use link from payload or default to home
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// This handler is called when a user clicks on the notification.
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.', event);

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: "window",
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// This is a placeholder for any logic you might want to run when the push subscription changes.
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log("Push subscription changed: ", event);
    // Here you might want to re-send the new subscription to your server.
});
