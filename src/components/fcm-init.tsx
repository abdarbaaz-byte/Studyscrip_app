'use client';

import useFcmToken from '@/hooks/use-fcm';

/**
 * FCMInit Component
 * Headless component that auto-initializes the FCM hook on the client side.
 */
export function FCMInit() {
  useFcmToken();
  return null;
}
