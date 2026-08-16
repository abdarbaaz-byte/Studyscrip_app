
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollRestorer Component
 * Manually manages scroll position saving and restoration across route changes.
 * Especially useful for dynamic pages where standard browser restoration might fail.
 */
export function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Restore scroll position from session storage
    const savedScrollPos = sessionStorage.getItem(`scroll_pos_${pathname}`);
    
    if (savedScrollPos) {
      const targetY = parseInt(savedScrollPos, 10);
      
      // We perform multiple attempts because content often loads asynchronously (Firestore/API).
      // This ensures that even if the page height changes after a second, we hit the target.
      const restore = () => {
        window.scrollTo({
          top: targetY,
          behavior: "instant",
        });
      };

      // Immediate attempt
      restore();

      // Scheduled attempts to catch layout shifts from dynamic content
      const timers = [
        setTimeout(restore, 50),
        setTimeout(restore, 200),
        setTimeout(restore, 500),
        setTimeout(restore, 1000),
        setTimeout(restore, 2000),
      ];

      return () => timers.forEach(t => clearTimeout(t));
    } else {
      // For new pages, ensure we start at the top
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    // 2. Save scroll position on scroll
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Debounce saving to avoid excessive storage writes
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`scroll_pos_${pathname}`, window.scrollY.toString());
        }
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
}
