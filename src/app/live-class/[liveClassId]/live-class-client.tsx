
"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface LiveClassClientProps {
  liveClassId: string;
  className: string;
}

export default function LiveClassClient({ liveClassId, className }: LiveClassClientProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (jitsiContainerRef.current && user) {
        const domain = "meet.jit.si";
        const options = {
          roomName: `StudyScript-${liveClassId}`,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          interfaceConfigOverwrite: {
            SHOW_CHROME_EXTENSION_BANNER: false,
          },
          configOverwrite: {
            prejoinPageEnabled: false, // Bypass the "Ready to join?" screen
            startWithAudioMuted: true,
            startWithVideoMuted: true,
          },
          userInfo: {
            email: user.email,
            displayName: user.displayName,
          },
        };

        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      }
    };

    return () => {
      jitsiApiRef.current?.dispose();
      document.body.removeChild(script);
    };
  }, [liveClassId, user]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div ref={jitsiContainerRef} className="w-full h-full">
         <div className="flex flex-col items-center justify-center h-full text-white">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Connecting to Live Class...</p>
        </div>
      </div>
    </div>
  );
}
