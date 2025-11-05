
import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { ChatWidget } from "@/components/chat-widget";
import { AuthProvider } from "@/hooks/use-auth";
import { InstallPwaButton } from "@/components/install-pwa-button";
import "./globals.css";
import { ClientSideLayout } from "@/components/client-side-layout";
import { NotificationPermissionHandler } from "@/components/notification-permission-handler";
import { ConditionalLayout } from "@/components/conditional-layout";
import { AudioPlayerProvider } from "@/hooks/use-audio-player";
import { AudioPlayer } from "@/components/audio-player";


export const metadata: Metadata = {
  title: "StudyScript | Live Classes, Courses & Exam Prep for NCERT & MP Board",
  description: "StudyScript se online padhai karein! Hum Class 8-12 ke liye structured courses, live classes, quizzes, aur AI doubt solver pradan karte hain. NCERT, MP Board syllabus, aur previous year question papers ke saath apni exam ki taiyari ko behtar banayein.",
  keywords: ["online classes", "e-learning India", "StudyScript", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "NCERT solutions", "MP Board", "previous year question papers", "academic courses", "live classes", "online quiz", "free study material", "free notes pdf", "AI doubt solver", "online padhai", "digital learning", "education platform", "professional courses", "exam preparation"],
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
          <AudioPlayerProvider>
            <ClientSideLayout>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
            </ClientSideLayout>
          </AudioPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

