
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
        return;
      }

      try {
        // 2. Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn("FCM: Notifications not allowed by user.");
          return;
        }

        // 3. Register our Unified Service Worker
        // Note: Using firebase-messaging-sw.js as the primary entry point
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // 4. Wait for it to be fully READY and ACTIVE
        // Use a more robust check for activation to avoid 'bad-precaching' stalls
        let sw = registration.active || registration.waiting || registration.installing;
        
        if (sw?.state !== 'activated') {
            await new Promise((resolve) => {
                const checkState = (target: any) => {
                    if (target.state === 'activated') {
                        resolve(null);
                    }
                };
                
                if (registration.installing) registration.installing.addEventListener('statechange', (e: any) => checkState(e.target));
                if (registration.waiting) registration.waiting.addEventListener('statechange', (e: any) => checkState(e.target));
                if (registration.active) registration.active.addEventListener('statechange', (e: any) => checkState(e.target));
                
                // Safety timeout
                setTimeout(resolve, 5000);
            });
        }

        // 5. Get Token with Explicit Registration
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('FCM: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.');
          return;
        }

        // We use the registration we just created
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          setToken(currentToken);

          // 6. Save to Firestore
          const tokenDocRef = doc(db, 'fcmTokens', currentToken);
          await setDoc(tokenDocRef, {
            token: currentToken,
            lastUpdated: serverTimestamp(),
            platform: 'web',
            createdAt: serverTimestamp(),
          }, { merge: true });
          
          console.log("FCM: Token successfully registered.");
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
