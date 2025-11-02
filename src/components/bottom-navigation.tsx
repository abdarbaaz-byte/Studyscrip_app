
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, BrainCircuit, Gamepad2, User, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function BottomNavigation() {
  const pathname = usePathname();
  const { user, userSchoolId, userRole } = useAuth();
  
  const authPages = ["/login", "/signup", "/forgot-password", "/verify-email"];
  if (authPages.includes(pathname)) {
    return null;
  }
  
  // Define a 5-item layout for better spacing
  const baseNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/my-courses", label: "Courses", icon: LayoutGrid },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/quizzes", label: "Quizzes", icon: BrainCircuit },
    { href: "/my-profile", label: "Profile", icon: User },
  ];
  
  let navItems = [...baseNavItems];
  
  if (userRole === 'teacher') {
    // Replace 'Courses' with 'Dashboard' for teachers
    navItems[1] = { href: "/teacher/dashboard", label: "Dashboard", icon: School };
  } else if (userSchoolId) {
    // Replace 'Courses' with 'School' for students in a school
    navItems[1] = { href: "/my-school", label: "School", icon: School };
  }

  // Filter out items that require auth if user is not logged in
  const visibleNavItems = user ? navItems : navItems.filter(item => ["/", "/quizzes", "/games"].includes(item.href));


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
