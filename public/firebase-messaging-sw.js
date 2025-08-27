
// This file needs to be present in the public folder.
// It's used by Firebase Messaging to handle background notifications.

// Import the Firebase app and messaging services
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
// Pass in the configuration object directly from your app's config
const firebaseConfig = {
  apiKey: "AIzaSyAogMOncvmZLqQ1qom0d3RDihdqOB9XRiY",
  authDomain: "studyscript.firebaseapp.com",
  projectId: "studyscript",
  storageBucket: "studyscript.appspot.com",
  messagingSenderId: "891979418045",
  appId: "1:891979418045:web:bd3903f3dfd23dc54dead4",
  measurementId: "G-7WJ302P118"
};


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// If you want to handle background notifications, you can do so here
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// This is the new part that handles the notification click
self.addEventListener('notificationclick', function(event) {
  // Close the notification pop-up
  event.notification.close();

  // The URL to open when the notification is clicked.
  // For now, it's the home page. In the future, it could be dynamic.
  const urlToOpen = '/';

  // Check if there's an an open tab for this app. If so, focus it.
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function(windowClients) {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      return matchingClient.focus();
    } else {
      // If no tab is open, open a new one
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});
