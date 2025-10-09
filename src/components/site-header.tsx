

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WhatsAppIcon } from "@/components/icons";
import { Menu, Bell, Circle, LogOut, Share2, User, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/notifications";
import { listenToNotifications, listenToUserReadNotifications, markNotificationAsRead } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";


export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logOut } = useAuth();
  const { toast } = useToast();
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/verify-email"].includes(pathname);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
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

  const handleMarkAsRead = (id: string, link?: string) => {
    if (user && !readNotificationIds.includes(id)) {
      markNotificationAsRead(user.uid, id);
    }
    if(link) {
      router.push(link);
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

  const handleShare = async () => {
    const shareData = {
      title: 'StudyScript',
      text: 'Check out StudyScript for amazing courses!',
      url: window.location.origin,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser does not support the Web Share API.",
      });
    }
    setIsSheetOpen(false);
  };

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#courses", label: "Courses" },
    { href: "/live-classes", label: "Live Classes Survey" },
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
                    href="/disclaimer"
                    className="text-foreground/70 transition-colors hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    Disclaimer
                  </Link>
                  <Button
                    variant="ghost"
                    className="text-foreground/70 transition-colors hover:text-foreground justify-start p-0"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share App
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

           <Popover>
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
            <PopoverContent className="w-96 p-0">
               <div className="p-4 font-medium border-b">Notifications</div>
                <ScrollArea className="h-80">
                  {sortedNotifications.length > 0 ? (
                    sortedNotifications.map(notif => {
                      const isRead = readNotificationIds.includes(notif.id);
                      return (
                       <div 
                         key={notif.id} 
                         className={cn("p-4 border-b flex gap-3 items-start hover:bg-secondary", notif.link && "cursor-pointer")}
                         onClick={() => handleMarkAsRead(notif.id, notif.link)}
                        >
                        {!isRead && <Circle className="h-2 w-2 mt-1.5 fill-primary text-primary flex-shrink-0" />}
                        <div className={cn("flex-1 min-w-0", isRead && "pl-5")}>
                          <p className="font-semibold break-words">{notif.title}</p>
                          <p className="text-sm text-muted-foreground break-words">{notif.description}</p>
                           {notif.link && (
                              <div className="text-xs text-blue-500 hover:underline break-all flex items-center gap-1 mt-1">
                                <LinkIcon className="h-3 w-3"/> Click to view
                              </div>
                           )}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                        </div>
                       </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-muted-foreground p-8">No new notifications.</p>
                  )}
                </ScrollArea>
            </PopoverContent>
          </Popover>
          
          {user ? (
             <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="secondary">
                  <Link href="/my-profile">
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
