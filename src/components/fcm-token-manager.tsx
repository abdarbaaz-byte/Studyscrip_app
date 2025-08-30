
"use client";

import { useEffect } from 'react';
import { getFCMToken } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

// This component now has a single responsibility:
// get the FCM token for a LOGGED-IN user if permission is already granted.
// The permission request logic has been moved to the SiteHeader.

export function FcmTokenManager() {
  const { user } = useAuth();

  useEffect(() => {
    // This effect runs when the user logs in or out.
    if (user && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        // We only need to get the token if permission is already granted.
        // The SiteHeader component will handle requesting permission if it's 'default'.
        if (Notification.permission === 'granted') {
            getFCMToken(); // This function now handles getting and logging the token.
        }
    }
  }, [user]);

  return null; // This component does not render anything.
}
