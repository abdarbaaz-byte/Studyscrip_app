
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
      <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.982,13.43,5.569c3.586,3.587,5.566,8.352,5.568,13.43c-0.004,10.465-8.522,18.98-18.986,18.98c-3.18,0-6.21-0.796-8.904-2.24l-10.251,2.553L4.868,43.303z" />
      <path fill="#fff" stroke="#cfd8dc" strokeMiterlimit="10" strokeWidth="0.5" d="M24.014,5.867c-9.999-0.004-18.114,8.104-18.118,18.118c-0.001,3.229,0.852,6.413,2.498,9.223l-3.13,11.45l11.695-3.079c2.7,1.52,5.748,2.33,8.87,2.329h0.005c9.999,0,18.118-8.118,18.118-18.118c0-4.999-2.011-9.704-5.571-13.264C33.718,7.878,28.999,5.867,24.014,5.867z" />
      <path fill="#40c351" d="M19.373,34.198c-0.326,0-0.652-0.053-0.963-0.16c-0.896-0.317-1.543-1.01-1.69-1.967c-0.065-0.421-0.104-0.851-0.106-1.284c-0.003-1.84,0.25-3.663,0.745-5.409c0.237-0.857,0.569-1.693,0.985-2.49c0.528-1.014,1.172-1.956,1.908-2.809c1.07-1.235,2.372-2.28,3.846-3.107c0.825-0.463,1.726-0.82,2.67-1.055c-0.138,0.951-0.54,1.858-1.163,2.656c-0.76,0.979-1.688,1.854-2.73,2.603c-1.166,0.835-2.433,1.534-3.763,2.083c-0.784,0.323-1.542,0.618-2.26,0.892c-0.53,0.203-1.043,0.39-1.53,0.568c-0.032,0.012-0.063,0.023-0.095,0.035c-0.21,0.076-0.413,0.158-0.606,0.25c-0.076,0.036-0.15,0.075-0.223,0.115c-0.19,0.103-0.37,0.216-0.537,0.342c-0.133,0.1-0.258,0.208-0.374,0.323c-0.155,0.154-0.295,0.318-0.419,0.493c-0.113,0.16-0.213,0.327-0.301,0.501c-0.081,0.16-0.151,0.326-0.21,0.497c-0.054,0.157-0.096,0.318-0.128,0.482c-0.03,0.153-0.05,0.308-0.059,0.465c-0.009,0.15-0.009,0.3-0.009,0.45c0,0.213,0.018,0.423,0.053,0.629c0.07,0.402,0.203,0.782,0.388,1.129c0.189,0.354,0.43,0.67,0.71,0.938c0.092,0.088,0.187,0.173,0.284,0.255c-0.096,0.001-0.192,0.001-0.288,0.001C19.661,34.198,19.517,34.198,19.373,34.198z" />
      <path fill="#40c351" d="M34.693,25.973c-0.003-1.84-0.25-3.663-0.745-5.409c-0.237-0.857-0.569-1.693-0.985-2.49c-0.528-1.014-1.172-1.956-1.908-2.809c-1.07-1.235-2.372-2.28-3.846-3.107c-0.825-0.463-1.726-0.82-2.67-1.055c-0.138,0.951-0.54,1.858-1.163,2.656c-0.76,0.979-1.688,1.854-2.73,2.603c-1.166,0.835-2.433,1.534-3.763,2.083c-0.784,0.323-1.542,0.618-2.26,0.892c-0.53,0.203-1.043,0.39-1.53,0.568c-0.032,0.012-0.063,0.023-0.095,0.035c-0.21,0.076-0.413,0.158-0.606,0.25c-0.076,0.036-0.15,0.075-0.223,0.115c-0.19,0.103-0.37,0.216-0.537,0.342c-0.133,0.1-0.258,0.208-0.374,0.323c-0.155,0.154-0.295,0.318-0.419,0.493c-0.113,0.16-0.213,0.327-0.301,0.501c-0.081,0.16-0.151,0.326-0.21,0.497c-0.054,0.157-0.096,0.318-0.128,0.482c-0.03,0.153-0.05,0.308-0.059,0.465c-0.009,0.15-0.009,0.3-0.009,0.45c0,0.213,0.018,0.423,0.053,0.629c0.07,0.402,0.203,0.782,0.388,1.129c0.189,0.354,0.43,0.67,0.71,0.938c0.279,0.268,0.597,0.488,0.941,0.652c0.214,0.102,0.434,0.189,0.659,0.261c0.141,0.045,0.284,0.083,0.428,0.115c0.15,0.032,0.3,0.056,0.45,0.07c0.138,0.013,0.275,0.02,0.412,0.02c0.326,0,0.652-0.053,0.963-0.16c0.896-0.317,1.543-1.01,1.69-1.967c0.065-0.421,0.104-0.851,0.106-1.284C34.943,29.636,34.696,27.813,34.693,25.973z" />
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
