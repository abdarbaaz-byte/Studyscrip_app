// This script is executed in the background by the browser.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 1. AAPKI ORIGINAL FIREBASE CONFIGURATION (Safe)
firebase.initializeApp({
  apiKey: "AIzaSyAogMOncvmZLqQ1qom0d3RDihdqOB9XRiY", 
  projectId: "studyscript", 
  messagingSenderId: "891979418045", 
  appId: "1:891979418045:web:047bfd8a00e148c14dead4" 
});

const messaging = firebase.messaging();

// 2. NOTIFICATION RECEIVE HONE KA LOGIC
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'StudyScript';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    
    // Popup laane aur 3 second baad tray mein bhejne ka setup
    requireInteraction: false, 
    vibrate: [200, 100, 200], 
    
    // Double notification ko ek mein merge karne ka setup
    tag: 'studyscript-msg',
    renotify: true,
    
    // Link read karna
    data: {
      url: payload.data && payload.data.url ? payload.data.url : '/' 
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 3. NOTIFICATION PAR CLICK KARNE KA LOGIC (DEEP LINKING)
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); 
  
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      
      // Agar Instagram/YouTube ka link hai
      if (targetUrl.startsWith('http')) {
        return clients.openWindow(targetUrl);
      }

      // Agar App ka internal page hai (jaise /quizzes)
      const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(fullTargetUrl);
          }
        }
      }
      
      // Agar app band hai toh naya kholo
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});
