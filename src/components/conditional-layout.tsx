
"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AudioPlayer } from "@/components/audio-player";
import { Toaster } from "@/components/ui/toaster";
import { ChatWidget } from "@/components/chat-widget";
import { InstallPwaButton } from "@/components/install-pwa-button";
import { NotificationPermissionHandler } from "@/components/notification-permission-handler";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGamePage = pathname.startsWith('/games/');
  const isQuizAttemptPage = pathname.startsWith('/quizzes/') && pathname.endsWith('/attempt');
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/verify-email"].includes(pathname);

  const showFullAppLayout = !isGamePage && !isQuizAttemptPage;
  const showPlayerAndWidgets = !isGamePage && !isQuizAttemptPage && !isAuthPage;

  if (!showFullAppLayout) {
    return <main className="h-screen w-screen">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      {showPlayerAndWidgets && (
        <>
          <ChatWidget />
          <AudioPlayer />
          <InstallPwaButton />
        </>
      )}
      <Toaster />
      <NotificationPermissionHandler />
      <BottomNavigation />
    </div>
  );
}
