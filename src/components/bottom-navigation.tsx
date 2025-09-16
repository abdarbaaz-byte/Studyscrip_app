
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, BrainCircuit, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/my-courses", label: "My Courses", icon: LayoutGrid, requiresAuth: true },
  { href: "/quizzes", label: "Quizzes", icon: BrainCircuit },
  { href: "/doubt-ai", label: "AI Doubt", icon: MessageCircleQuestion },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const authPages = ["/login", "/signup", "/forgot-password", "/verify-email"];
  if (authPages.includes(pathname)) {
    return null;
  }


  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          if (item.requiresAuth && !user) {
            return null;
          }
          
          const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full text-sm font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
