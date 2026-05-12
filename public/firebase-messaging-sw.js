
// Kripya apni original Firebase keys yahan restore karein
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAogMOncvmZLqQ1qom0d3RDihdqOB9XRiY",
  authDomain: "studyscript.firebaseapp.com",
  projectId: "studyscript",
  storageBucket: "studyscript.firebasestorage.app",
  messagingSenderId: "891979418045",
  appId: "1:891979418045:web:047bfd8a00e148c14dead4"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages (Data-only payload)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.data.title || "StudyScript Update";
  const notificationOptions = {
    body: payload.data.body || "New content available!",
    icon: payload.data.icon || '/icons/icon-192x192.png',
    data: {
      link: payload.data.link || '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if the link is an external URL (YouTube etc)
      if (urlToOpen.startsWith('http')) {
        return clients.openWindow(urlToOpen);
      }
      
      // For internal links, try to focus an existing window or open new
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
