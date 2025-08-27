
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

// This interface defines the structure of the event that the browser fires
// when the app is ready to be installed.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // This event is fired by the browser when the PWA is ready to be installed.
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the default mini-infobar from appearing on mobile.
      event.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // This event is fired when the PWA has been successfully installed.
    const handleAppInstalled = () => {
      // Hide the install button
      setInstallPrompt(null);
      setIsAppInstalled(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    
    // Check if the app is already running in standalone mode (i.e., installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsAppInstalled(true);
    }

    // Cleanup event listeners when the component unmounts.
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Show the browser's installation prompt.
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt.
    const { outcome } = await installPrompt.userChoice;
    
    // We've used the prompt, so we can't use it again. Clear it.
    setInstallPrompt(null);

    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
  };
  
  // Only show the button if the app is not installed and the prompt is available.
  if (isAppInstalled || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
        <Button onClick={handleInstallClick} size="lg" className="shadow-2xl">
            <Download className="mr-2 h-5 w-5" />
            Install App
        </Button>
    </div>
  );
}
