
"use client";

import { useAudioPlayer } from "@/hooks/use-audio-player";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Play, Pause, SkipForward, SkipBack, ListMusic, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"


export function AudioPlayer() {
  const {
    isPlaying,
    currentTrack,
    progress,
    duration,
    play,
    pause,
    nextTrack,
    prevTrack,
    seek,
    playlist,
    currentTrackIndex,
    playPlaylist,
    closePlayer, // Get the new closePlayer function
  } = useAudioPlayer();

  const [showPlaylist, setShowPlaylist] = useState(false);

  if (!currentTrack) {
    return null;
  }
  
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const handleSeek = (values: number[]) => {
    seek(values[0]);
  };
  
  const handlePlayFromPlaylist = (index: number) => {
      playPlaylist(playlist, index);
  }

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-[60] h-20 bg-background/95 border-t backdrop-blur-sm md:bottom-0">
        <div className="container mx-auto h-full flex items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 w-1/4">
                 <div className="flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={prevTrack}><SkipBack /></Button>
                 </div>
                 <div className="flex-shrink-0">
                     {isPlaying ? (
                        <Button variant="ghost" size="icon" onClick={pause}><Pause className="h-6 w-6" /></Button>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={play}><Play className="h-6 w-6" /></Button>
                    )}
                </div>
                 <div className="flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={nextTrack}><SkipForward /></Button>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center gap-1 w-1/2">
                <p className="font-bold text-sm truncate text-center">{currentTrack.title}</p>
                <div className="w-full flex items-center gap-2">
                    <span className="text-xs font-mono">{formatTime(progress)}</span>
                    <Slider
                        value={[progress]}
                        max={duration}
                        step={1}
                        onValueChange={handleSeek}
                        className="w-full"
                    />
                    <span className="text-xs font-mono">{formatTime(duration)}</span>
                </div>
            </div>
            
             <div className="flex items-center gap-2 w-1/4 justify-end">
                <Button variant="ghost" size="icon" onClick={() => setShowPlaylist(true)}>
                    <ListMusic />
                </Button>
                <Button variant="ghost" size="icon" onClick={closePlayer}>
                    <X className="h-6 w-6" />
                </Button>
            </div>
        </div>
      </div>
      <Sheet open={showPlaylist} onOpenChange={setShowPlaylist}>
        <SheetContent>
            <SheetHeader className="flex-row items-center justify-between">
                <SheetTitle>Up Next</SheetTitle>
                 <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </SheetClose>
            </SheetHeader>
            <div className="py-4">
                <ul className="space-y-2">
                    {playlist.map((track, index) => (
                        <li 
                            key={track.id} 
                            onClick={() => handlePlayFromPlaylist(index)}
                            className={cn(
                                "p-3 rounded-md cursor-pointer flex justify-between items-center",
                                index === currentTrackIndex ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                            )}
                        >
                            <div>
                                <p className="font-semibold">{track.title}</p>
                                <p className={cn("text-sm", index === currentTrackIndex ? "text-primary-foreground/80" : "text-muted-foreground")}>{track.duration}</p>
                            </div>
                            {index === currentTrackIndex && isPlaying && <Play className="h-5 w-5" />}
                        </li>
                    ))}
                </ul>
            </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
