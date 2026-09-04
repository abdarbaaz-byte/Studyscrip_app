"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WhatsAppIcon } from "@/components/icons";
import { Menu, Bell, Circle, LogOut, Share2, User, Link as LinkIcon, School, Users, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/notifications";
import { listenToNotifications, listenToUserReadNotifications, markNotificationAsRead } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";


export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, userRole, userSchoolId, logOut } = useAuth();
  const { toast } = useToast();
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/verify-email"].includes(pathname);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !readNotificationIds.includes(n.id)).length;
  const sortedNotifications = [...notifications].sort((a, b) => 
      readNotificationIds.includes(a.id) === readNotificationIds.includes(b.id) ? 0 :
      readNotificationIds.includes(a.id) ? 1 : -1
  );

  useEffect(() => {
    const unsubscribeNotifications = listenToNotifications((liveNotifications) => {
      setNotifications(liveNotifications);
    });
    return () => unsubscribeNotifications();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeReadStatus = listenToUserReadNotifications(user.uid, (readIds) => {
        setReadNotificationIds(readIds);
      });
      return () => unsubscribeReadStatus();
    } else {
      setReadNotificationIds([]);
    }
  }, [user]);

  // Effect to handle back press for closing the notifications popover
  useEffect(() => {
    const handleHashChange = () => {
      // If hash is removed or changed (back press), close the popover
      if (window.location.hash !== '#notifications' && isNotificationOpen) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      // Add a hash to the URL when the popover opens
      window.location.hash = 'notifications';
      window.addEventListener('hashchange', handleHashChange);
    } else {
      // If the popover is closed manually, but the hash is still there, go back
      if (window.location.hash === '#notifications') {
        window.history.back();
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isNotificationOpen]);

  const handleMarkAsRead = (id: string, link?: string) => {
    if (user && !readNotificationIds.includes(id)) {
      markNotificationAsRead(user.uid, id);
    }
    if(link) {
      router.push(link);
      setIsNotificationOpen(false); // Close popover on navigation
    }
  };

  const handleMarkAllAsRead = () => {
    if (user && unreadCount > 0) {
      const unreadIds = notifications
        .filter(n => !readNotificationIds.includes(n.id))
        .map(n => n.id);
      
      unreadIds.forEach(id => {
        markNotificationAsRead(user.uid, id);
      });
    }
  };

  const handleShareAppClick = () => {
    setIsSheetOpen(false);
    router.push("/share-reward");
  };

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#courses", label: "Courses" },
    { href: "/batches", label: "Batches" },
    { href: "/faq", label: "FAQs" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
  ];

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block font-headline">
              StudyScript
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === link.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
             {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/admin/dashboard" ? "text-foreground" : "text-foreground/60"
                )}
              >
                Dashboard
              </Link>
            )}
            {userRole === 'teacher' && (
                <Link href="/teacher/dashboard" className={cn("transition-colors hover:text-foreground/80", pathname.startsWith('/teacher') ? "text-foreground" : "text-foreground/60")}>
                    Teacher Dashboard
                </Link>
            )}
            {user && userSchoolId && userRole !== 'teacher' && userRole !== 'admin' && userRole !== 'employee' && (
              <Link href="/my-school" className={cn("transition-colors hover:text-foreground/80", pathname.startsWith('/my-school') ? "text-foreground" : "text-foreground/60")}>
                  My School
              </Link>
            )}
          </nav>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 flex flex-col">
             <SheetHeader>
              <SheetTitle></SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation links for StudyScript.
              </SheetDescription>
            </SheetHeader>
            <div className="pl-6">
                <Link href="/" className="mr-6 flex items-center space-x-2" onClick={handleLinkClick}>
                <span className="font-bold font-headline">StudyScript</span>
                </Link>
            </div>
            
            <div className="flex-grow my-4 pl-6 overflow-y-auto">
              <div className="flex flex-col space-y-3">
                {user && (
                    <Link
                        href="/my-profile"
                        className="text-foreground/70 transition-colors hover:text-foreground"
                        onClick={handleLinkClick}
                    >
                        My Profile
                    </Link>
                )}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground/70 transition-colors hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </Link>
                ))}
                 {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="text-foreground/70 transition-colors hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    Dashboard
                  </Link>
                 )}
                 {userRole === 'teacher' && (
                    <Link href="/teacher/dashboard" className="text-foreground/70 transition-colors hover:text-foreground" onClick={handleLinkClick}>
                        Teacher Dashboard
                    </Link>
                )}
                {user && userSchoolId && userRole !== 'teacher' && userRole !== 'admin' && userRole !== 'employee' && (
                  <Link href="/my-school" className="text-foreground/70 transition-colors hover:text-foreground" onClick={handleLinkClick}>
                      My School
                  </Link>
                )}
                  <Link
                    href="/feedback"
                    className="text-foreground/70 transition-colors hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    Feedback Form
                  </Link>
                   <Link
                    href="/privacy"
                    className="text-foreground/70 transition-colors hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-foreground/70 transition-colors hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    Terms & Conditions
                  </Link>
                  <Link
                    href="/disclaimer"
                    className="text-foreground/70 transition-colors hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    Disclaimer
                  </Link>
                  <Button
                    variant="ghost"
                    className="text-foreground/70 transition-colors hover:text-foreground justify-start p-0"
                    onClick={handleShareAppClick}
                  >
                    <Gift className="mr-2 h-4 w-4 text-primary" />
                    Share & Earn
                  </Button>
              </div>
            </div>

            {user && (
              <div className="mt-auto p-4 border-t">
                  <Button onClick={logOut} variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
           <a href="https://whatsapp.com/channel/0029Vb6Bh8yDZ4Lf5WmUoC0m" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="hidden sm:inline-flex items-center gap-2">
                  <WhatsAppIcon />
                  Join WhatsApp
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                  <WhatsAppIcon />
                  <span className="sr-only">Join WhatsApp</span>
              </Button>
           </a>

           <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" onClick={handleMarkAllAsRead}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                   <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              sideOffset={0}
              className="w-screen sm:w-96 p-0 h-[calc(100dvh-128px)] sm:h-auto max-h-[calc(100dvh-128px)] sm:max-h-[500px] rounded-none sm:rounded-xl border-x-0 sm:border-x flex flex-col shadow-2xl overscroll-contain"
            >
               <div className="p-4 font-bold border-b bg-background sticky top-0 z-10">Notifications</div>
                <ScrollArea className="flex-1 overscroll-contain">
                  {sortedNotifications.length > 0 ? (
                    sortedNotifications.map(notif => {
                      const isRead = readNotificationIds.includes(notif.id);
                      return (
                       <div 
                         key={notif.id} 
                         className={cn("p-4 border-b flex gap-3 items-start hover:bg-secondary transition-colors", notif.link && "cursor-pointer")}
                         onClick={() => handleMarkAsRead(notif.id, notif.link)}
                        >
                        {!isRead && <Circle className="h-2.5 w-2.5 mt-1.5 fill-primary text-primary flex-shrink-0" />}
                        <div className={cn("flex-1 min-w-0", isRead && "pl-5")}>
                          <p className="font-bold text-foreground leading-tight break-words">{notif.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed break-words">{notif.description}</p>
                           {notif.link && (
                              <div className="text-xs text-blue-500 font-bold hover:underline break-all flex items-center gap-1 mt-2">
                                <LinkIcon className="h-3 w-3"/> Click to view
                              </div>
                           )}
                          <p className="text-[10px] font-medium text-muted-foreground mt-2">{new Date(notif.timestamp).toLocaleString()}</p>
                        </div>
                       </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                      <Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
                      <p className="text-muted-foreground font-medium">No new notifications.</p>
                    </div>
                  )}
                </ScrollArea>
            </PopoverContent>
          </Popover>
          
          {user ? (
             <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="outline" className="border-primary/30 hover:bg-primary/5">
                    <Link href="/share-reward">
                        <Gift className="mr-2 h-4 w-4 text-primary"/>
                        Share & Earn
                    </Link>
                </Button>
                {userRole === 'teacher' && (
                    <Button asChild variant="secondary">
                        <Link href="/teacher/dashboard">
                            <School className="mr-2 h-4 w-4"/>
                            Teacher Dashboard
                        </Link>
                    </Button>
                )}
                <Button asChild variant={userRole === 'teacher' ? 'outline' : 'secondary'}>
                  <Link href="/my-profile" >
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                  </Link>
                </Button>
                <Button onClick={logOut} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
          ) : (
            <div className="items-center gap-2 md:flex">
              <Button asChild variant="ghost">
                <Link href="/login">
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup">
                  Sign Up
                </Link>
              </Button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
