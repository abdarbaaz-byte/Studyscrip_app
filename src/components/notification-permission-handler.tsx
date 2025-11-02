
"use client";

import useFcmToken from '@/hooks/use-fcm';

export function NotificationPermissionHandler() {
  // This component's sole purpose is to activate the useFcmToken hook
  // which handles the permission request and token retrieval logic.
  useFcmToken();

  // It does not render anything to the UI.
  return null;
}
