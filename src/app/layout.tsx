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
  metadataBase: new URL("https://studyscript.netlify.app"),
  title: "StudyScript | Live Classes, Free pdf Notes for NCERT & MP Board",
  description: "StudyScript se online padhai karein! Hum Class 8th-12th ke liye structured courses, live classes, quizzes, free pdf notes aur books pradan karte hain. NCERT, MP Board syllabus, aur previous year question papers ke saath apni exam ki taiyari ko behtar banayein.",
  applicationName: "StudyScript",
  keywords: ["online classes", "e-learning India", "StudyScript", "Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th", "NCERT solutions", "MP Board", "previous year question papers", "audio lectures", "live classes", "online quiz", "free study material", "free notes pdf", "English spoken", "online padhai", "free pdf books", "education platform", "professional courses", "exam preparation"],
  authors: [{ name: "StudyScript" }],
  robots: "index, follow",
  verification: {
      google: "AP1STnDfS5TmnaOq0PNHyAoeCyOhmcHimMI0Z5MgCbk",
  },
  openGraph: {
    type: "website",
    siteName: "StudyScript",
    title: "StudyScript | Live Classes, Free pdf Notes for NCERT & MP Board",
    description: "StudyScript se online padhai karein! Hum Class 8th-12th ke liye structured courses, live classes, quizzes, free pdf notes aur books pradan karte hain.",
    url: "https://studyscript.netlify.app",
  },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StudyScript",
    "alternateName": "Study Script",
    "url": "https://studyscript.netlify.app"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
