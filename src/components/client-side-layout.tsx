
"use client";

import { useEffect } from "react";

export function ClientSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    // This effect runs only on the client side
    const isAndroid = /android/i.test(navigator.userAgent);
    const htmlElement = document.documentElement;

    if (isAndroid) {
      htmlElement.classList.add('android-screenshot-secure');
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        htmlElement.classList.add('secure-view-enabled');
      } else {
        htmlElement.classList.remove('secure-view-enabled');
      }
    };
    
    if (isAndroid) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);


    return () => {
       if (isAndroid) {
         document.removeEventListener('visibilitychange', handleVisibilityChange);
       }
       document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return <>{children}</>;
}
