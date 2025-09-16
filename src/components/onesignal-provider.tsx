
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/use-auth';

// A global flag to ensure OneSignal is initialized only once.
let isOneSignalInitialized = false;

export function OneSignalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  useEffect(() => {
    // Prevent re-initialization on re-renders.
    if (isOneSignalInitialized || typeof window === 'undefined') {
      return;
    }

    // Skip initialization in development mode.
    if (process.env.NODE_ENV !== 'production') {
        console.log("OneSignal: Skipping initialization in development mode.");
        return;
    }

    if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      console.error("OneSignal App ID is not configured. Push notifications will be disabled.");
      return;
    }

    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      safari_web_id: "web.onesignal.auto.123456-7890-abcd-efgh-ijklmnopqrst", // Replace with your actual Safari Web ID if you have one
      serviceWorkerPath: "OneSignalSDKWorker.js", // Default path for the service worker
      serviceWorkerUpdaterPath: "OneSignalSDKUpdaterWorker.js",
    }).then(() => {
        isOneSignalInitialized = true;
        console.log("OneSignal Initialized.");
        // The Slidedown prompt will be shown automatically unless you configure it otherwise.
        // You can customize it like this:
        OneSignal.Slidedown.promptPush({
          force: false, // Set to true to always show, false to respect user's previous decision
        });
    });

  }, []);
  
  useEffect(() => {
    // This effect handles user login/logout state with OneSignal
    if (!isOneSignalInitialized) return;

    if (user) {
      // Set the external user ID for this device
      OneSignal.login(user.uid);
      console.log("OneSignal user logged in with UID:", user.uid);
    } else {
      // If the user logs out, logout of OneSignal as well
      if (OneSignal.User.isSubscribed()) {
          OneSignal.logout();
          console.log("OneSignal user logged out.");
      }
    }
  }, [user]);

  return <>{children}</>;
}
