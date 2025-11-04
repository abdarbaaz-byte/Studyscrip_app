
"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import type { AudioTrack } from '@/lib/data';
import { getGoogleDriveAudioUrl } from '@/lib/utils';
import { useToast } from './use-toast';

interface AudioPlayerContextType {
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  currentTrackIndex: number | null;
  playlist: AudioTrack[];
  progress: number;
  duration: number;
  playPlaylist: (playlist: AudioTrack[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const playPlaylist = (newPlaylist: AudioTrack[], startIndex = 0) => {
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(startIndex);
    setIsPlaying(true);
  };
  
  const playNext = useCallback(() => {
    if (currentTrackIndex !== null && currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      // End of playlist
      setIsPlaying(false);
      setCurrentTrackIndex(null);
      setPlaylist([]);
    }
  }, [currentTrackIndex, playlist.length]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };

  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    
    const trackUrl = getGoogleDriveAudioUrl(currentTrack.url);
    if (audio.src !== trackUrl) {
      audio.src = trackUrl;
    }

    if (isPlaying) {
      audio.play().catch(error => {
        console.error("Audio play failed:", error);
        toast({
            variant: "destructive",
            title: "Playback Error",
            description: "Could not play the audio. Please try again."
        });
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, toast]);

  const play = () => currentTrack && setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  const nextTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const prevTrack = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0; // Rewind if played more than 3s
    } else if (currentTrackIndex !== null && currentTrackIndex > 0) {
        setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const value: AudioPlayerContextType = {
    isPlaying,
    currentTrack,
    currentTrackIndex,
    playlist,
    progress,
    duration,
    playPlaylist,
    play,
    pause,
    nextTrack,
    prevTrack,
    seek,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
