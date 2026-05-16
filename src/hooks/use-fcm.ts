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
      // 1. Check for browser support
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
        console.log("FCM: Push messaging is not supported in this browser.");
        return;
      }

      try {
        console.log("FCM: Initializing Registration...");
        
        // 2. Request Notification Permission
        const permission = await Notification.requestPermission();
        setNotificationPermissionStatus(permission);
        if (permission !== 'granted') {
          console.warn("FCM: Notification permission denied by user.");
          return;
        }

        // 3. Register our UNIFIED Service Worker manually
        console.log("FCM: Registering Unified Service Worker...");
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // 4. Wait for the Service Worker to be fully ready
        await navigator.serviceWorker.ready;
        console.log("FCM: Service Worker is Ready.");

        // 5. Generate FCM Token
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
          console.log("FCM: Token generated successfully:", currentToken);
          setToken(currentToken);

          // 6. Save/Update token in Firestore
          const tokenDocRef = doc(db, 'fcmTokens', currentToken);
          await setDoc(tokenDocRef, {
            token: currentToken,
            lastUpdated: serverTimestamp(),
            platform: 'web',
          }, { merge: true });
          
          console.log("FCM: Token saved to Firestore 'fcmTokens' collection.");
        } else {
          console.warn("FCM: No registration token available. Check VAPID key or browser support.");
        }
      } catch (error) {
        console.error("FCM: Critical error during initialization:", error);
      }
    };

    initializeFCM();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
