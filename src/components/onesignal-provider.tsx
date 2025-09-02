
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/use-auth';

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOneSignalInitialized, setIsOneSignalInitialized] = useState(false);

  useEffect(() => {
    async function initializeOneSignal() {
      if (typeof window === 'undefined' || isOneSignalInitialized) return;

      if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        console.error("OneSignal App ID is not configured. Push notifications will be disabled.");
        return;
      }
      
      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true, // This line fixes the error on localhost
          safari_web_id: "web.onesignal.auto.123456-7890-abcd-efgh-ijklmnopqrst",
        });
        setIsOneSignalInitialized(true);
        
        OneSignal.Slidedown.promptPush();
      } catch (error) {
        console.error("OneSignal initialization failed:", error);
      }
    }

    initializeOneSignal();
  }, [isOneSignalInitialized]);
  
  useEffect(() => {
    if (!isOneSignalInitialized) return;

    if (user) {
      OneSignal.login(user.uid);
    } else {
      if (OneSignal.User.isSubscribed()) {
          OneSignal.logout();
      }
    }
  }, [user, isOneSignalInitialized]);

  return <>{children}</>;
}
