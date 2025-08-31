
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

        // Set up the foreground message listener for the logged-in user.
        onForegroundMessage();
    }
  }, [user]);

  return null; // This component does not render anything.
}
