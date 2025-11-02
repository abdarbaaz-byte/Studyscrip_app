
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
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            if (currentToken) {
              setToken(currentToken);
              // Save the token to Firestore
              const tokenDocRef = doc(db, 'fcmTokens', currentToken);
              await setDoc(tokenDocRef, { token: currentToken, createdAt: new Date() });
            } else {
              toast({
                variant: 'destructive',
                title: 'Permission needed for notifications.',
                description: 'Please allow notification permission to get the latest updates.',
              });
            }
          }
        } catch (error) {
          console.error('An error occurred while retrieving token. ', error);
        }
      }
    };

    retrieveToken();
  }, [toast]);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
