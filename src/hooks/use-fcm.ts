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
        console.log('FCM: Service workers not supported.');
        return;
      }

      if (!messaging) {
        console.log('FCM: Messaging not initialized.');
        return;
      }

      try {
        const status = await Notification.requestPermission();
        setNotificationPermissionStatus(status);

        if (status === 'granted') {
          console.log('FCM: Permission granted. Registering Unified SW...');
          
          // Register the Unified Service Worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          
          // Wait for the Service Worker to be fully ready
          await navigator.serviceWorker.ready;
          console.log('FCM: Service Worker is ready.');

          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            console.error('FCM: VAPID Key missing.');
            return;
          }

          const currentToken = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration,
          });

          if (currentToken) {
            console.log('FCM: Token generated:', currentToken);
            setToken(currentToken);

            // Save token to Firestore (this creates the collection if it was deleted)
            const tokenDocRef = doc(db, 'fcmTokens', currentToken);
            await setDoc(tokenDocRef, { 
              token: currentToken, 
              lastUpdated: serverTimestamp(),
              platform: 'web'
            }, { merge: true });
            
            console.log('FCM: Token saved to Firestore.');
          }
        }
      } catch (error) {
        console.error('FCM: Error during initialization:', error);
      }
    };

    retrieveToken();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
