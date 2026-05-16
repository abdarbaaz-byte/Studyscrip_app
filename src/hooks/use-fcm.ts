'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionState | null>(null);

  useEffect(() => {
    const retrieveToken = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('Service workers are not supported in this environment.');
        return;
      }

      if (!messaging) {
        console.log('Firebase Messaging is not initialized (likely server-side or unsupported browser).');
        return;
      }

      try {
        console.log('FCM: Starting token retrieval process...');
        
        // 1. Check/Request Permission
        const status = await Notification.requestPermission();
        setNotificationPermissionStatus(status);
        console.log('FCM: Notification permission status:', status);

        if (status === 'granted') {
          // 2. Register Unified Service Worker
          console.log('FCM: Registering Service Worker...');
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          
          // 3. Wait for Service Worker to be fully ready
          await navigator.serviceWorker.ready;
          console.log('FCM: Service Worker is ready.');

          // 4. Get FCM Token
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            console.error('FCM: VAPID Key is missing in environment variables!');
            return;
          }

          console.log('FCM: Requesting token from Firebase...');
          const currentToken = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration,
          });

          if (currentToken) {
            console.log('FCM: Token generated successfully:', currentToken);
            setToken(currentToken);

            // 5. Save/Update token in Firestore
            console.log('FCM: Saving token to Firestore...');
            const tokenDocRef = doc(db, 'fcmTokens', currentToken);
            await setDoc(tokenDocRef, { 
              token: currentToken, 
              lastUpdated: serverTimestamp(),
              platform: 'web'
            }, { merge: true });
            
            console.log('FCM: Token successfully stored in Firestore.');
          } else {
            console.warn('FCM: No registration token available. User might need to re-grant permission.');
          }
        } else {
          console.warn('FCM: Notification permission was denied.');
        }
      } catch (error) {
        console.error('FCM: Error occurred during token retrieval:', error);
      }
    };

    retrieveToken();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
