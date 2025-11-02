
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, BrainCircuit, MessageCircleQuestion, User, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", label: "Home", icon: Home, requiresAuth: false },
  { href: "/my-courses", label: "Courses", icon: LayoutGrid, requiresAuth: true },
  { href: "/quizzes", label: "Quizzes", icon: BrainCircuit, requiresAuth: false },
  { href: "/my-profile", label: "Profile", icon: User, requiresAuth: true },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { user, userSchoolId, userRole } = useAuth();
  
  const authPages = ["/login", "/signup", "/forgot-password", "/verify-email"];
  if (authPages.includes(pathname)) {
    return null;
  }

  const baseNavItems = [
    { href: "/", label: "Home", icon: Home, requiresAuth: false },
    null, // Placeholder for conditional item
    { href: "/quizzes", label: "Quizzes", icon: BrainCircuit, requiresAuth: false },
    { href: "/my-profile", label: "Profile", icon: User, requiresAuth: true },
  ];

  let conditionalItem = { href: "/my-courses", label: "Courses", icon: LayoutGrid, requiresAuth: true };

  if (userRole === 'teacher') {
    conditionalItem = { href: "/teacher/dashboard", label: "Dashboard", icon: School, requiresAuth: true };
  } else if (userSchoolId) {
    conditionalItem = { href: "/my-school", label: "School", icon: School, requiresAuth: true };
  }
  
  // A simple 4-item layout for mobile. We can adjust this.
  // The middle item will be the conditional one.
  const finalNavItems = [
     { href: "/", label: "Home", icon: Home, requiresAuth: false },
     conditionalItem,
     { href: "/quizzes", label: "Quizzes", icon: BrainCircuit, requiresAuth: false },
     { href: "/my-profile", label: "Profile", icon: User, requiresAuth: true },
  ];


  const visibleNavItems = finalNavItems.filter(item => item && (!item.requiresAuth || !!user)) as (typeof navItems[0])[];


  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex h-16 items-center justify-around">
        {visibleNavItems.map((item) => {
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
