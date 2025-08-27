"use client";

import { useEffect } from 'react';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { useToast } from "@/hooks/use-toast";

// This is your VAPID key that you get from your Firebase project settings.
// Go to Project Settings > Cloud Messaging > Web configuration.
// Under "Web Push certificates", click "Generate key pair".
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'; // IMPORTANT: REPLACE THIS

export function FcmTokenManager() {
  const { toast } = useToast();

  useEffect(() => {
    const retrieveToken = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging) {
        try {
          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready;
          
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken) {
              console.log('FCM Token:', currentToken);
              // Here you would typically send this token to your server
              // to store it against the current user.
              // e.g., saveTokenToServer(currentToken);
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          } else {
            console.log('Notification permission denied.');
          }
        } catch (error) {
          console.error('An error occurred while retrieving token. ', error);
           toast({
             variant: "destructive",
             title: "Could not get notification token",
             description: "Please ensure you are not in incognito mode and have enabled notifications.",
           });
        }
      }
    };

    // We ask for permission as soon as the component mounts.
    // In a real app, you might want to trigger this on a button click.
    retrieveToken();
  }, [toast]);

  return null; // This component does not render anything.
}
