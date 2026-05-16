
'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCM = async () => {
      // 1. Browser support check
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
        console.log("FCM: Browser not supported or messaging not available.");
        return;
      }

      try {
        // 2. Request Notification Permission
        console.log("FCM: Requesting notification permission...");
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
          console.log("FCM: Permission denied by user.");
          return;
        }

        // 3. Manually register our Unified Service Worker
        console.log("FCM: Registering unified service worker...");
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // 4. Wait for the Service Worker to be fully READY and ACTIVE
        await navigator.serviceWorker.ready;
        console.log("FCM: Service Worker is READY.");

        // 5. Generate FCM Token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('FCM: VAPID Key is missing in environment variables.');
          return;
        }
        
        console.log("FCM: Fetching token from Firebase...");
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration, // CRITICAL: Tell Firebase which worker to use
        });

        if (currentToken) {
          console.log("FCM: Token generated:", currentToken);
          setToken(currentToken);

          // 6. Save/Update token in Firestore
          const tokenDocRef = doc(db, 'fcmTokens', currentToken);
          await setDoc(tokenDocRef, {
            token: currentToken,
            lastUpdated: serverTimestamp(),
            platform: 'web',
            createdAt: serverTimestamp(),
          }, { merge: true });
          
          console.log("FCM: Token saved to Firestore 'fcmTokens' collection.");
        } else {
          console.warn("FCM: No token received. Check browser console for network errors.");
        }
      } catch (error) {
        console.error("FCM: Initialization failed:", error);
      }
    };

    initializeFCM();
  }, []);

  return { token };
};

export default useFcmToken;
