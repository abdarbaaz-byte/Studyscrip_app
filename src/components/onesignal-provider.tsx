"use client";

import { useEffect, useState, type ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/use-auth';

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOneSignalInitialized, setIsOneSignalInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect once on component mount
    if (isOneSignalInitialized || typeof window === 'undefined') {
      return;
    }

    // Only initialize in production.
    if (process.env.NODE_ENV !== 'production') {
        console.log("OneSignal: Skipping initialization in development mode.");
        return;
    }

    if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      console.error("OneSignal App ID is not configured. Push notifications will be disabled.");
      return;
    }
      
    // OneSignal.init is synchronous and does not return a promise
    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      safari_web_id: "web.onesignal.auto.123456-7890-abcd-efgh-ijklmnopqrst", // This needs to be your actual Safari Web ID
    });
    
    setIsOneSignalInitialized(true);

    // Use the recommended Slidedown prompt
    OneSignal.Slidedown.promptPush();

  }, [isOneSignalInitialized]);
  
  useEffect(() => {
    if (!isOneSignalInitialized) return;

    if (user) {
      // Set the external user ID for this device
      OneSignal.login(user.uid);
    } else {
      // If the user logs out, logout of OneSignal as well
      if (OneSignal.User.isSubscribed()) {
          OneSignal.logout();
      }
    }
  }, [user, isOneSignalInitialized]);

  return <>{children}</>;
}
