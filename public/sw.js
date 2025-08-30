// This file is intentionally left blank.
// next-pwa will generate the service worker and inject it here.
// We will add the Firebase Messaging import script here.

if (typeof self !== 'undefined') {
    // Allows the web app to trigger skipWaiting via
    // registration.waiting.postMessage({type: 'SKIP_WAITING'})
    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
            self.skipWaiting();
        }
    });
    
    // Import the Firebase messaging script
    try {
        importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
        importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');
    
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAogMOncvmZLqQ1qom0d3RDihdqOB9XRiY",
            authDomain: "studyscript.firebaseapp.com",
            projectId: "studyscript",
            storageBucket: "studyscript.appspot.com",
            messagingSenderId: "891979418045",
            appId: "1:891979418045:web:bd3903f3dfd23dc54dead4",
            measurementId: "G-7WJ302P118"
        };
    
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    
        const messaging = firebase.messaging();
        
        messaging.onBackgroundMessage((payload) => {
          console.log(
            '[firebase-messaging-sw.js] Received background message ',
            payload
          );
          // Customize notification here
          const notificationTitle = payload.notification.title;
          const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.image || '/logo-192.png'
          };
    
          self.registration.showNotification(notificationTitle, notificationOptions);
        });

    } catch (e) {
        console.error('Firebase messaging script import failed: ', e);
    }
}
