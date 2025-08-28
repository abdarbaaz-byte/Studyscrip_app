
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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.06.105-1.03 3.777 3.84-1.011.105.06zm5.012-6.958c-.273 0-.546.088-.785.263l-.11.067c-.225.136-.935.458-1.16 1.334-.225.876.225 1.632.33 1.785.105.153.225.345.315.42l.105.09c.3.24.555.375.825.375.27 0 .6-.134.885-.435.285-.3.6-.705.69-.854.09-.15.18-.3.12-.494-.06-.195-.3-.345-.435-.405-.135-.06-.27-.06-.39-.06s-.27.015-.405.045c-.135.03-.285.075-.42.195l-.105.09c-.195.165-.33.225-.435.165-.105-.06-.48-1.214-.525-1.274-.045-.06-.09-.09-.15-.09s-.12.015-.165.03c-.045.015-.12.045-.165.045-.045 0-.09-.015-.135-.015s-.225-.015-.315-.015z"/>
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
