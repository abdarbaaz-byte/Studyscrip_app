
'use client';

import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Custom Hook to manage FCM Token registration.
 * Uses a persistent Device ID to prevent duplicate token entries in Firestore.
 * Supports PWA vs Browser token preservation for smart fallback.
 */
const useFcmToken = () => {
  useEffect(() => {
    const initializeFCM = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
        return;
      }

      try {
        // 1. Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn("FCM: Notifications not allowed.");
          return;
        }

        // 2. Register/Get Service Worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        // Ensure Service Worker is active
        if (registration.installing) {
            await new Promise((resolve) => {
                registration.installing?.addEventListener('statechange', (e: any) => {
                    if (e.target.state === 'activated') resolve(null);
                });
            });
        }

        // 3. Generate or Retrieve a persistent Device ID for this browser/PWA instance
        let deviceId = localStorage.getItem('studyscript_fcm_device_id');
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem('studyscript_fcm_device_id', deviceId);
        }

        // 4. Get FCM Token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          const tokenDocRef = doc(db, 'fcmTokens', deviceId);
          const isPwa = window.matchMedia('(display-mode: standalone)').matches;

          // 5. Sync with Auth State and Store Tokens based on Platform
          onAuthStateChanged(auth, async (user) => {
            try {
                const updateData: any = {
                  token: currentToken,
                  uid: user ? user.uid : null,
                  lastUpdated: serverTimestamp(),
                  platform: isPwa ? 'pwa' : 'web',
                  browser: navigator.userAgent.includes('Chrome') ? 'chrome' : 'other',
                };

                // Preserve Browser token if in PWA mode, and vice versa
                if (isPwa) {
                  updateData.pwaToken = currentToken;
                } else {
                  updateData.browserToken = currentToken;
                }

                await setDoc(tokenDocRef, updateData, { merge: true });
                console.log(`FCM: Device ${deviceId} synced as ${isPwa ? 'PWA' : 'Browser'}`);
            } catch (err) {
                console.error("FCM: Sync failed", err);
            }
          });
        }
      } catch (error) {
        console.error("FCM ERROR:", error);
      }
    };

    initializeFCM();
  }, []);

  return null;
};

export default useFcmToken;
