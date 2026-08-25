
'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCM = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn("FCM: Notifications not allowed by user.");
          return;
        }

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // Wait for service worker to be ready
        let sw = registration.active || registration.waiting || registration.installing;
        if (sw?.state !== 'activated') {
            await new Promise((resolve) => {
                const checkState = (target: any) => {
                    if (target.state === 'activated') resolve(null);
                };
                if (registration.installing) registration.installing.addEventListener('statechange', (e: any) => checkState(e.target));
                if (registration.waiting) registration.waiting.addEventListener('statechange', (e: any) => checkState(e.target));
                if (registration.active) registration.active.addEventListener('statechange', (e: any) => checkState(e.target));
                setTimeout(resolve, 5000);
            });
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('FCM: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.');
          return;
        }

        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          setToken(currentToken);
          
          // Initial registration with UID tracking
          // This listener ensures the token is ALWAYS mapped to the current UID (or null if guest)
          onAuthStateChanged(auth, async (user) => {
            const tokenDocRef = doc(db, 'fcmTokens', currentToken);
            await setDoc(tokenDocRef, {
              token: currentToken,
              uid: user ? user.uid : null,
              lastUpdated: serverTimestamp(),
              platform: 'web',
              createdAt: serverTimestamp(),
            }, { merge: true });
          });
          
          console.log("FCM: Token registered with UID tracking.");
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
