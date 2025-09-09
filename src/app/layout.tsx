
import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { ChatWidget } from "@/components/chat-widget";
import { AuthProvider } from "@/hooks/use-auth";
import { InstallPwaButton } from "@/components/install-pwa-button";
import { OneSignalProvider } from "@/components/onesignal-provider";
import "./globals.css";
import { ClientSideLayout } from "@/components/client-side-layout";


export const metadata: Metadata = {
  title: "StudyScript - E-Learning for Academic & Professional Courses",
  description: "Join StudyScript, a modern e-learning platform for academic classes (9th, 10th) and professional courses in web development, data science, and more. Start learning today!",
  manifest: "/manifest.json",
  keywords: ["e-learning", "online courses", "academic classes", "9th class", "10th class", "professional courses", "online education", "StudyScript"],
  authors: [{ name: "StudyScript" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: "#5062B5",
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
      </head>
      <body className="min-h-screen font-body antialiased">
        <AuthProvider>
          <OneSignalProvider>
            <ClientSideLayout>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
                <ChatWidget />
                <Toaster />
                <InstallPwaButton />
            </ClientSideLayout>
          </OneSignalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
