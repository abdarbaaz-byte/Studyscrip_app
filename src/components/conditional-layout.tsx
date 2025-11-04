
"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomNavigation } from "@/components/bottom-navigation";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGamePage = pathname.startsWith('/games/');
  const isQuizAttemptPage = pathname.startsWith('/quizzes/') && pathname.endsWith('/attempt');

  if (isGamePage || isQuizAttemptPage) {
    return <main className="h-screen w-screen">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <BottomNavigation />
    </div>
  );
}
