
'use client';

import { useEffect } from 'react';
import useFcmToken from '@/hooks/use-fcm';

/**
 * FCMInit Component
 * Headless client component that auto-initializes the FCM hook on the client side.
 * This ensures the token generation process starts immediately on page load.
 */
export function FCMInit() {
  // Execute the hook
  useFcmToken();
  
  // Return null because this component doesn't render any UI
  return null;
}
