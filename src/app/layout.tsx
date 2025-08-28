
"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { ChatWidget } from "@/components/chat-widget";
import { AuthProvider } from "@/hooks/use-auth";
import { InstallPwaButton } from "@/components/install-pwa-button";
import { FcmTokenManager } from "@/components/fcm-token-manager";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
    
    return () => {
       if (isAndroid) {
         document.removeEventListener('visibilitychange', handleVisibilityChange);
       }
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#5062B5" />
      </head>
      <body className="min-h-screen font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <ChatWidget />
          <Toaster />
          <InstallPwaButton />
          <FcmTokenManager />
        </AuthProvider>
      </body>
    </html>
  );
}
