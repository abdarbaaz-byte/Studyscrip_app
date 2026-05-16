'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionState | null>(null);

  useEffect(() => {
    const initializeFCM = async () => {
      // 1. Browser support check
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
        console.log("FCM: Browser not supported or messaging not initialized.");
        return;
      }

      try {
        // 2. Request Notification Permission
        const permission = await Notification.requestPermission();
        setNotificationPermissionStatus(permission);
        
        if (permission !== 'granted') {
          console.log("FCM: Permission not granted.");
          return;
        }

        // 3. Register our Unified Service Worker manually
        // We need this registration object to pass to getToken
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // 4. Wait for the Service Worker to be fully ready
        await navigator.serviceWorker.ready;
        console.log("FCM: Service Worker is Ready.");

        // 5. Generate FCM Token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('FCM: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing in env.');
          return;
        }
        
        // Pass the registration object to getToken to avoid 'failed-service-worker-registration'
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          console.log("FCM: Token generated:", currentToken);
          setToken(currentToken);

          // 6. Save/Update token in Firestore 'fcmTokens' collection
          const tokenDocRef = doc(db, 'fcmTokens', currentToken);
          await setDoc(tokenDocRef, {
            token: currentToken,
            lastUpdated: serverTimestamp(),
            platform: 'web',
          }, { merge: true });
          
          console.log("FCM: Token saved to Firestore successfully.");
        } else {
          console.warn("FCM: No token received from Firebase.");
        }
      } catch (error) {
        console.error("FCM: Error during initialization:", error);
      }
    };

    initializeFCM();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
