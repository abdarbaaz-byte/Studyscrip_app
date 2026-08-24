
import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import "./globals.css";
import { ClientSideLayout } from "@/components/client-side-layout";
import { ConditionalLayout } from "@/components/conditional-layout";
import { AudioPlayerProvider } from "@/hooks/use-audio-player";
import { DataProvider } from "@/hooks/use-data";
import { GoogleAnalytics } from '@next/third-parties/google';
import { FCMInit } from "@/components/fcm-init";
import { ScrollRestorer } from "@/components/scroll-restorer";

export const metadata: Metadata = {
  metadataBase: new URL("https://studyscript.netlify.app"),
  title: "Free Notes for Class 8-12 | NCERT solutions | StudyScript",
  description: "StudyScript se online padhai karein! Hum Class 8-12 ke liye structured courses, live classes, quizzes, free pdf notes aur books pradan karte hain. NCERT, MP Board syllabus, aur previous year question papers ke saath apni exam ki taiyari ko behtar banayein.",
  applicationName: "StudyScript",
  keywords: ["online classes", "StudyScript", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "NCERT solutions", "MP Board", "previous year question papers", "CBSE notes", "live classes", "online quiz", "free study material", "free pdf notes", "MP board notes", "free pdf books", "Study script", "B.Pharma PCI", "M.Pharm PCI"],
  authors: [{ name: "StudyScript" }],
  robots: "index, follow",
  verification: {
      google: "AP1STnDfS5TmnaOq0PNHyAoeCyOhmcHimMI0Z5MgCbk",
  },
  openGraph: {
    type: "website",
    siteName: "StudyScript",
    title: "StudyScript | NCERT Solutions for CBSE, MP Board & All State Boards",
    description: "StudyScript se online padhai karein! Hum Class 8th-12th ke liye structured courses, quizzes, free pdf notes aur books pradan karte hain.",
    url: "https://studyscript.netlify.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#227447",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-body antialiased">
        <FCMInit />
        <ScrollRestorer />
        <AuthProvider>
          <AudioPlayerProvider>
            <DataProvider>
              <ClientSideLayout>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
              </ClientSideLayout>
            </DataProvider>
          </AudioPlayerProvider>
        </AuthProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""} />
      </body>
    </html>
  );
}
