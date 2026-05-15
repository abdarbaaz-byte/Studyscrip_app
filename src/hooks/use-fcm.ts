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
          const status = await Notification.requestPermission();
          setNotificationPermissionStatus(status);

          if (status === 'granted') {
            // Register the unified service worker manually
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/'
            });

            // Pass the registration to getToken to avoid 'failed-service-worker-registration' error
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: registration,
            });

            if (currentToken) {
              setToken(currentToken);
              const tokenDocRef = doc(db, 'fcmTokens', currentToken);
              await setDoc(tokenDocRef, { token: currentToken, createdAt: new Date() });
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
