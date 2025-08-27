
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { ChatWidget } from "@/components/chat-widget";
import { AuthProvider } from "@/hooks/use-auth";
import { InstallPwaButton } from "@/components/install-pwa-button";
import { FcmTokenManager } from "@/components/fcm-token-manager";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "StudyScript",
  description: "An online learning platform.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // A simple check for user agent to apply screenshot protection on Android.
  // This would ideally be done in a client component to avoid sending this to all browsers.
  const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);

  return (
    <html lang="en" className={cn(isAndroid && 'android-screenshot-secure')}>
      <head>
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
