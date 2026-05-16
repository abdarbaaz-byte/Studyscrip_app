
'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCM = async () => {
      // 1. Check for browser support
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
        console.log("FCM: Push messaging is not supported in this browser.");
        return;
      }

      try {
        console.log("FCM: Initializing...");
        
        // 2. Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log("FCM: Notification permission denied.");
          return;
        }

        // 3. Register Unified Service Worker manually
        // This prevents conflicts between PWA worker and Firebase worker
        console.log("FCM: Registering service worker...");
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // 4. Wait for SW to be ready
        await navigator.serviceWorker.ready;
        console.log("FCM: Service Worker Ready.");

        // 5. Get Token with explicit registration
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          console.log("FCM: Token generated:", currentToken);
          setToken(currentToken);

          // 6. Save token to Firestore
          const tokenDocRef = doc(db, 'fcmTokens', currentToken);
          await setDoc(tokenDocRef, {
            token: currentToken,
            lastSeen: serverTimestamp(),
            platform: 'web'
          }, { merge: true });
          
          console.log("FCM: Token saved to Firestore successfully.");
        } else {
          console.log("FCM: No registration token available.");
        }
      } catch (error) {
        console.error("FCM: Error during initialization:", error);
      }
    };

    initializeFCM();
  }, []);

  return { token };
};

export default useFcmToken;
