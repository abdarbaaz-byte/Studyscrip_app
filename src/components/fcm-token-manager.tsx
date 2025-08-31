
"use client";

import { useEffect } from 'react';
import { getFCMToken, onForegroundMessage } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

// This component now has two responsibilities:
// 1. Get the FCM token for a LOGGED-IN user if permission is already granted.
// 2. Set up a listener for foreground messages (when the app is open and active).

export function FcmTokenManager() {
  const { user } = useAuth();

  useEffect(() => {
    // This effect runs when the user logs in or out.
    if (user && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        // We only need to get the token if permission is already granted.
        // The SiteHeader component will handle requesting permission if it's 'default'.
        if (Notification.permission === 'granted') {
            getFCMToken(); // This function now handles getting and saving the token.
        }
    }
  }, [user]);

  // This effect sets up the foreground message listener once and only once.
  useEffect(() => {
    // Check if the app is running in a browser environment
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Set up the foreground message listener.
      // This returns an unsubscribe function that gets called on cleanup.
      const unsubscribe = onForegroundMessage();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, []);

  return null; // This component does not render anything.
}
