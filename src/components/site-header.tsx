
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Logo } from "@/components/icons";
import { Menu, Bell, Circle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/notifications";
import { listenToNotifications, listenToUserReadNotifications, markNotificationAsRead } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { requestNotificationPermission, getFCMToken } from "@/lib/firebase"; 
import { useToast } from "@/hooks/use-toast";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" {...props}>
      <path fill="#40c351" d="M41.6,8.7c-3.7-3.7-8.8-6-14.7-6.2c-10.9-0.3-20,8.6-20.3,19.5c-0.1,3.6,0.8,7.1,2.4,10.2l-2.8,9.7l10-2.7c3,1.5,6.4,2.3,9.8,2.3h0c10.8,0,19.7-8.8,19.7-19.7C47.8,17.4,45.4,12.4,41.6,8.7z"/>
      <path fill="#fff" d="M34.3,32.4c-0.4-0.2-2.5-1.2-2.9-1.4c-0.4-0.1-0.6-0.2-0.9,0.2c-0.3,0.4-1.1,1.4-1.3,1.6c-0.3,0.3-0.5,0.3-0.9,0.1c-0.4-0.2-1.8-0.7-3.4-2.1c-1.3-1.1-2.1-2.5-2.4-2.9c-0.3-0.4-0.01-0.6,0.2-0.8c0.2-0.2,0.4-0.4,0.6-0.6c0.2-0.2,0.3-0.4,0.4-0.6c0.1-0.2,0.1-0.5,0-0.7c-0.1-0.2-0.9-2.1-1.2-2.9c-0.3-0.8-0.6-0.7-0.9-0.7c-0.2,0-0.5,0-0.7,0c-0.3,0-0.7,0.1-1.1,0.5c-0.4,0.4-1.5,1.5-1.5,3.6c0,2.1,1.6,4.2,1.8,4.5c0.2,0.3,3,4.6,7.2,6.4c1,0.4,1.8,0.7,2.4,0.9c0.9,0.3,1.7,0.2,2.3,0.1c0.7-0.1,2.5-1,2.8-2c0.4-0.9,0.4-1.7,0.3-1.9C35,32.8,34.7,32.6,34.3,32.4z"/>
    </svg>
  );


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
           <a href="https://whatsapp.com/channel/your-channel-id" target="_blank" rel="noopener noreferrer">
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
