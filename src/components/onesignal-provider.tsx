
"use client";

import { useEffect, type ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/use-auth';

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const ONE_SIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

  useEffect(() => {
    async function initializeOneSignal() {
      if (!ONE_SIGNAL_APP_ID) {
        console.error("OneSignal App ID is not configured. Push notifications will be disabled.");
        return;
      }
      
      // The `init` call in react-onesignal is idempotent, so it's safe to call multiple times.
      // However, we can add a check to prevent re-initialization if not needed.
      if (!OneSignal.isInitialized) {
        await OneSignal.init({ 
          appId: ONE_SIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true, // Important for local development
        });
      }
    }

    initializeOneSignal();
  }, [ONE_SIGNAL_APP_ID]);
  
  useEffect(() => {
    // This effect runs when the user's login state changes.
    if (user) {
      // If user is logged in, set their UID as the external user ID in OneSignal.
      // This allows you to target specific users from the OneSignal dashboard.
      OneSignal.login(user.uid);
    } else {
      // If user logs out, remove their ID from OneSignal.
      if (OneSignal.User.isLoggedIn()) {
        OneSignal.logout();
      }
    }
  }, [user]);

  return <>{children}</>;
}
