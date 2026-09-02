"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { listenToBannerSettings, type PopupBannerSettings } from "@/lib/data";
import { getGoogleDriveImageUrl, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PopupBanner() {
  const [banner, setBanner] = useState<PopupBannerSettings | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Listen for Live Banner Config
    const unsubscribe = listenToBannerSettings((settings) => {
        const popup = settings.popupBanner;
        
        if (!popup || !popup.isActive || !popup.imageUrl) {
            setIsVisible(false);
            return;
        }

        // 2. Check Expiration
        const now = new Date();
        const expiry = popup.expiresAt.toDate();
        if (now > expiry) {
            setIsVisible(false);
            return;
        }

        // 3. Check Dismissal Persistence (per specific banner ID)
        const dismissedId = localStorage.getItem("dismissed_popup_id");
        if (dismissedId === popup.id) {
            setIsVisible(false);
            return;
        }

        // 4. Preload Image before showing anything
        const img = new window.Image();
        img.src = getGoogleDriveImageUrl(popup.imageUrl);
        img.onload = () => {
            setBanner(popup);
            setImageLoaded(true);
            setIsVisible(true);
        };
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = () => {
    if (banner) {
        localStorage.setItem("dismissed_popup_id", banner.id);
    }
    setIsVisible(false);
  };

  const handleBannerClick = () => {
    if (!banner?.actionUrl) return;

    // Save dismissal since they interacted
    localStorage.setItem("dismissed_popup_id", banner.id);
    setIsVisible(false);

    if (banner.actionUrl.startsWith("http")) {
        window.open(banner.actionUrl, "_blank");
    } else {
        router.push(banner.actionUrl);
    }
  };

  if (!isVisible || !banner || !imageLoaded) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-lg w-full bg-transparent overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Close Button */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-4 right-4 z-10 rounded-full h-8 w-8 bg-black/20 hover:bg-black/40 text-white border border-white/20 backdrop-blur-md"
          onClick={handleDismiss}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Banner Content */}
        <div 
          className={cn(
            "relative aspect-[4/5] md:aspect-square overflow-hidden cursor-default",
            banner.actionUrl && "cursor-pointer active:scale-[0.98] transition-transform"
          )}
          onClick={handleBannerClick}
        >
          <Image
            src={getGoogleDriveImageUrl(banner.imageUrl)}
            alt="Important Update"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </div>
  );
}
