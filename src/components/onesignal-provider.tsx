
"use client";

import { useEffect, type ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/use-auth';

let isOneSignalInitialized = false;

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (isOneSignalInitialized || typeof window === 'undefined') {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
        console.log("OneSignal: Skipping initialization in development mode.");
        return;
    }

    const ONE_SIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!ONE_SIGNAL_APP_ID) {
      console.error("OneSignal App ID is not configured. Push notifications will be disabled.");
      return;
    }
    
    // According to OneSignal docs, init is not async.
    OneSignal.init({
      appId: ONE_SIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      safari_web_id: "web.onesignal.auto.123456-7890-abcd-efgh-ijklmnopqrst", // Placeholder, replace if you have one
      serviceWorkerPath: "sw.js", // We point to our main PWA service worker
      serviceWorkerUpdaterPath: "sw.js" // Also point updater to the main worker
    }).then(() => {
        isOneSignalInitialized = true;
        console.log("OneSignal Initialized using main sw.js.");
        
        OneSignal.Slidedown.promptPush({
          force: false,
        });
    });

  }, []);
  
  useEffect(() => {
    if (!isOneSignalInitialized || !OneSignal) return;

    if (user) {
      OneSignal.login(user.uid);
      console.log("OneSignal user logged in with UID:", user.uid);
    } else {
      if (OneSignal.User.isSubscribed()) {
          OneSignal.logout();
          console.log("OneSignal user logged out.");
      }
    }
  }, [user]);

  return <>{children}</>;
}
