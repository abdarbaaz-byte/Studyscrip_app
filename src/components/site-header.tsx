
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Logo, WhatsAppIcon } from "@/components/icons";
import { Menu, Bell, Circle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/notifications";
import { listenToNotifications, listenToUserReadNotifications, markNotificationAsRead } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { requestNotificationPermission, getFCMToken } from "@/lib/firebase"; 
import { useToast } from "@/hooks/use-toast";


export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAdmin, logOut } = useAuth();
  const { toast } = useToast();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [permissionRequestedThisSession, setPermissionRequestedThisSession] = useState(false);
  
  const unreadCount = notifications.filter(n => !readNotificationIds.includes(n.id)).length;
  const sortedNotifications = [...notifications].sort((a, b) => 
      readNotificationIds.includes(a.id) === readNotificationIds.includes(b.id) ? 0 :
      readNotificationIds.includes(a.id) ? 1 : -1
  );

  useEffect(() => {
    // Listen to all notifications
    const unsubscribeNotifications = listenToNotifications((liveNotifications) => {
      setNotifications(liveNotifications);
    });

    return () => unsubscribeNotifications();
  }, []);

  useEffect(() => {
    // Listen to the user's read notifications
    if (user) {
      const unsubscribeReadStatus = listenToUserReadNotifications(user.uid, (readIds) => {
        setReadNotificationIds(readIds);
      });
      return () => unsubscribeReadStatus();
    } else {
      setReadNotificationIds([]);
    }
  }, [user]);

  const handleMarkAsRead = (id: string) => {
    if (user) {
      markNotificationAsRead(user.uid, id);
    }
  };

  const handleBellClick = async () => {
    // Check if Notification API is supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        toast({ variant: "destructive", title: "Notifications not supported on this browser."});
        return;
    }

    const permissionStatus = Notification.permission;

    if (permissionStatus === 'granted') {
        setIsPopoverOpen(true);
    } else if (permissionStatus === 'denied') {
        toast({
            variant: "destructive",
            title: "Notifications Blocked",
            description: "Please enable notifications for this site in your browser settings."
        });
    } else { // permissionStatus is 'default'
        // Only ask for permission if we haven't asked in this session
        if (!permissionRequestedThisSession) {
            setPermissionRequestedThisSession(true); // Mark as requested for this session
            const permissionGranted = await requestNotificationPermission();
            if (permissionGranted) {
                toast({ title: "Notifications Enabled!", description: "You will now receive updates." });
                setIsPopoverOpen(true); // Open popover after getting permission
                getFCMToken(); // Ensure token is registered after permission
            } else {
                toast({ variant: "destructive", title: "Permission Denied", description: "You won't receive push notifications."});
            }
        } else {
             // If already requested this session and they ignored the prompt,
             // just open the popover with in-app notifications.
             setIsPopoverOpen(true);
        }
    }
  };
  
  if (isAuthPage) {
    return null;
  }
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#courses", label: "Courses" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
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
        
        <Sheet>
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
          <SheetContent side="left" className="pr-0">
             <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Main navigation links for StudyScript.
              </SheetDescription>
            </SheetHeader>
            <Link href="/" className="mr-6 flex items-center space-x-2 pl-6">
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline">StudyScript</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                 {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="text-foreground/70 transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                 )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
           <a href="https://whatsapp.com/channel/0029Vb6Mj2mA2pLJ4M5xiH15" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="hidden sm:inline-flex">
                  <WhatsAppIcon className="h-5 w-5 mr-2" />
                  Join WhatsApp
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                  <WhatsAppIcon className="h-5 w-5" />
                  <span className="sr-only">Join WhatsApp</span>
              </Button>
           </a>

           <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" onClick={handleBellClick}>
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
                         className="p-4 border-b flex gap-3 items-start hover:bg-secondary cursor-pointer"
                         onClick={() => {
                            if (!isRead) {
                              handleMarkAsRead(notif.id);
                            }
                         }}
                        >
                        {!isRead && <Circle className="h-2 w-2 mt-1.5 fill-primary text-primary flex-shrink-0" />}
                        <div className={cn("flex-1 min-w-0", isRead && "pl-5")}>
                          <p className="font-semibold break-words">{notif.title}</p>
                          <p className="text-sm text-muted-foreground break-words">{notif.description}</p>
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
            <Button onClick={logOut} variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
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
            </>
          )}

        </div>
      </div>
    </header>
  );
}
