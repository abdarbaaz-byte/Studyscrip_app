"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  useEffect(() => {
    // Event listener to detect when the device comes back online
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener("online", handleOnline);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-md w-full text-center shadow-2xl border-none overflow-hidden rounded-[2.5rem]">
        <CardHeader className="bg-secondary/50 pt-12 pb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm text-muted-foreground/40">
              <WifiOff className="h-16 w-16" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black font-headline tracking-tight text-primary">
            You are Offline
          </CardTitle>
          <CardDescription className="text-base md:text-lg pt-2 font-medium">
            It looks like your internet connection was interrupted.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-10 space-y-6">
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
            Don't worry! You can still browse the content you have previously visited without an active connection.
            The page will automatically refresh when you are back online.
          </p>
          <div className="flex flex-col gap-3">
             <Button asChild className="w-full h-12 text-base font-bold rounded-2xl shadow-lg">
                <Link href="/">
                    <Home className="mr-2 h-5 w-5" /> Return to Home
                </Link>
             </Button>
             <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 font-semibold" 
                onClick={() => window.location.reload()}
             >
                <RefreshCw className="mr-2 h-4 w-4" /> Try Reconnecting
             </Button>
          </div>
          <div className="pt-6">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">
              StudyScript Offline Mode
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
