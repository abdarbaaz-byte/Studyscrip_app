
"use client";

import { useEffect, type ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/use-auth';

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize OneSignal as soon as the component mounts on the client-side.
    if (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      OneSignal.init({ 
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      });
    } else {
      console.error("OneSignal App ID is not configured. Push notifications will be disabled.");
    }
  }, []); // Empty dependency array ensures this runs only once on mount.
  
  useEffect(() => {
    // This effect runs when the user's login state changes.
    if (user) {
      // If user is logged in, set their UID as the external user ID in OneSignal.
      // This allows you to target specific users from the OneSignal dashboard.
      OneSignal.login(user.uid);
    } else {
      // If user logs out, remove their ID from OneSignal.
      // It's safe to call logout even if the user is not logged in.
      OneSignal.logout();
    }
  }, [user]);

  return <>{children}</>;
}
