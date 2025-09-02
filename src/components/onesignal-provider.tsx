
"use client";

import { useEffect, type ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/use-auth';

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    async function initializeOneSignal() {
      if (typeof window === 'undefined') return;

      if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        console.error("OneSignal App ID is not configured. Push notifications will be disabled.");
        return;
      }
      
      // OneSignal.init must be called only once
      if (OneSignal.isInitialized()) {
        return;
      }
      
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true, // Important for local testing
        safari_web_id: "web.onesignal.auto.123456-7890-abcd-efgh-ijklmnopqrst", // Generic Safari Web ID
      });

      // Prompt for notification permission
      OneSignal.Slidedown.promptPush();
    }

    initializeOneSignal();
  }, []);
  
  useEffect(() => {
    if (!OneSignal.isInitialized()) return;

    if (user) {
      OneSignal.login(user.uid);
    } else {
      if (OneSignal.User.isSubscribed()) {
          OneSignal.logout();
      }
    }
  }, [user]);

  return <>{children}</>;
}
