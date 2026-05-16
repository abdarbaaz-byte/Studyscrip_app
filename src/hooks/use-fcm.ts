
'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCM = async () => {
      // 1. Basic checks
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
        console.log("FCM: Browser not supported or Messaging not available.");
        return;
      }

      try {
        console.log("FCM: 1. Initializing process...");

        // 2. Request Permission
        const permission = await Notification.requestPermission();
        console.log("FCM: 2. Permission status:", permission);
        
        if (permission !== 'granted') {
          console.warn("FCM: Notifications not allowed by user.");
          return;
        }

        // 3. Register our Unified Service Worker
        console.log("FCM: 3. Registering /firebase-messaging-sw.js...");
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // 4. Wait for it to be fully READY and ACTIVE
        // Sometimes .ready resolves but state is still 'installing'
        console.log("FCM: 4. Waiting for Service Worker to be READY...");
        await navigator.serviceWorker.ready;
        
        // Ensure the worker is active before asking for token
        if (registration.installing) {
            console.log("FCM: SW is installing, waiting...");
            await new Promise((resolve) => {
                registration.installing?.addEventListener('statechange', (e: any) => {
                    if (e.target.state === 'activated') resolve(null);
                });
            });
        }
        console.log("FCM: 5. Service Worker is ACTIVE.");

        // 5. Get Token with Explicit Registration
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('FCM: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.');
          return;
        }

        console.log("FCM: 6. Fetching token from Firebase SDK...");
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          console.log("FCM: 7. Token generated successfully:", currentToken);
          setToken(currentToken);

          // 6. Save to Firestore
          console.log("FCM: 8. Saving token to Firestore collection 'fcmTokens'...");
          const tokenDocRef = doc(db, 'fcmTokens', currentToken);
          await setDoc(tokenDocRef, {
            token: currentToken,
            lastUpdated: serverTimestamp(),
            platform: 'web',
            createdAt: serverTimestamp(),
          }, { merge: true });
          
          console.log("FCM: 9. TOKEN SAVED SUCCESSFULLY.");
        } else {
          console.warn("FCM: No token received. Check if VAPID key is correct in Firebase Console.");
        }
      } catch (error) {
        console.error("FCM ERROR:", error);
      }
    };

    initializeFCM();
  }, []);

  return { token };
};

export default useFcmToken;
