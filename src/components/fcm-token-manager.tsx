"use client";

import { useEffect } from 'react';
import { messaging } from '@/lib/firebase';
import { getToken, Messaging } from 'firebase/messaging';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';

// This is your VAPID key that you get from your Firebase project settings.
// Go to Project Settings > Cloud Messaging > Web configuration.
// Under "Web Push certificates", click "Generate key pair".
const VAPID_KEY = 'BD4y20p9x-4F2T0g-u8r2J93hA5Qv-E4hHqX5yZ3R6g8sW7bC4p3fJ1z2N0kK9a4zJ7lX6vC6yO8g4'; // IMPORTANT: REPLACE THIS

export function FcmTokenManager() {
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    const retrieveToken = async () => {
      // Only run if there is a user, in a browser environment, and service worker is available
      if (user && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const messagingInstance = await messaging();
          if (!messagingInstance) {
              console.log("Firebase Messaging is not supported in this browser.");
              return;
          }

          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready;
          
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const currentToken = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
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

    retrieveToken();
  }, [toast, user]); // Rerun effect if user logs in/out

  return null; // This component does not render anything.
}
