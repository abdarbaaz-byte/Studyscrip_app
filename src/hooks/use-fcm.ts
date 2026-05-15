'use client';

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from './use-toast';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<PermissionState | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const retrieveToken = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging) {
        try {
          // 1. Request Permission
          const status = await Notification.requestPermission();
          setNotificationPermissionStatus(status);

          if (status === 'granted') {
            // 2. Register/Get Unified Service Worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/'
            });

            // 3. IMPORTANT: Wait for the service worker to be ready
            // This ensures that the worker is fully activated before we ask for a token
            await navigator.serviceWorker.ready;

            // 4. Get FCM Token using the ready registration
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: registration,
            });

            if (currentToken) {
              setToken(currentToken);
              // Save token to Firestore
              const tokenDocRef = doc(db, 'fcmTokens', currentToken);
              await setDoc(tokenDocRef, { 
                token: currentToken, 
                lastUpdated: new Date(),
                platform: 'web'
              });
              console.log('FCM Token retrieved and saved successfully.');
            } else {
              console.warn('No registration token available. Request permission to generate one.');
            }
          }
        } catch (error) {
          console.error('An error occurred while retrieving token: ', error);
        }
      }
    };

    retrieveToken();
  }, [toast]);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
