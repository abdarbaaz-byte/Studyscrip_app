
'use client';

import useFcmToken from '@/hooks/use-fcm';

/**
 * FCMInit Component
 * This is a headless component used to auto-initialize the FCM hook 
 * globally within the app layout.
 */
export function FCMInit() {
  useFcmToken();
  return null;
}
