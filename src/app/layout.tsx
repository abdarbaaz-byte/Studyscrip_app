
import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { ChatWidget } from "@/components/chat-widget";
import { AuthProvider } from "@/hooks/use-auth";
import { InstallPwaButton } from "@/components/install-pwa-button";
import "./globals.css";
import { ClientSideLayout } from "@/components/client-side-layout";
import { BottomNavigation } from "@/components/bottom-navigation";
import { NotificationPermissionHandler } from "@/components/notification-permission-handler";


export const metadata: Metadata = {
  title: "StudyScript - Live Classes, Courses, and AI Doubts",
  description: "StudyScript par online padhai karein! Hum Class 8-12 ke liye structured courses, live classes, quizzes, free notes, aur AI doubt solver pradan karte hain. Aaj hi join karein aur apni padhai ko ek nayi disha dein.",
  keywords: ["online classes", "e-learning India", "StudyScript", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "academic courses", "live classes", "online quiz", "free study material", "free notes pdf", "AI doubt solver", "online padhai", "digital learning", "education platform", "professional courses", "exam preparation"],
  authors: [{ name: "StudyScript" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: "#227447",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
      </head>
      <body className="min-h-screen font-body antialiased">
        <AuthProvider>
            <ClientSideLayout>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1 pb-20 md:pb-0">{children}</main>
                  <SiteFooter />
                </div>
                <BottomNavigation />
                <ChatWidget />
                <Toaster />
                <InstallPwaButton />
                <NotificationPermissionHandler />
            </ClientSideLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
