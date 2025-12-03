import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, RepeatMode } from '../types';
import * as AudioPlayer from '../services/audioPlayer';

interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  nextTrack: Track | null;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playTrack: (track: Track) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  cycleRepeatMode: () => void;
  favorites: Set<string>;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  playHistory: Track[];
  addToHistory: (track: Track) => void;
  radioMode: boolean;
  toggleRadioMode: () => void;
  sleepTimer: number | null; // seconds remaining
  setSleepTimer: (minutes: number | null) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [radioMode, setRadioMode] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const [sleepTimerState, setSleepTimerState] = useState<number | null>(null); // seconds remaining
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1);

  // Initialize player on mount
  useEffect(() => {
    const initPlayer = async () => {
      await AudioPlayer.setupPlayer();

      // Load persisted state from localStorage (web)
      try {
        const savedQueue = localStorage.getItem('queue');
        const savedFavorites = localStorage.getItem('favorites');
        const savedHistory = localStorage.getItem('history');

        if (savedQueue) setQueue(JSON.parse(savedQueue));
        if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)));
        if (savedHistory) setPlayHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading state:', e);
      }
    };

    initPlayer();
  }, []);

  // Persist queue changes
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('queue', JSON.stringify(queue));
    }
  }, [queue]);

  // Persist favorites
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    }
  }, [favorites]);

  // Persist history
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('history', JSON.stringify(playHistory));
    }
  }, [playHistory]);

  const addToQueue = useCallback(async (track: Track) => {
    setQueue((prev) => {
      if (prev.find(t => t.id === track.id)) {
        console.log('Track already in queue');
        return prev;
      }
      return [...prev, track];
    });

    if (!currentTrack) {
      playTrack(track);
    } else {
      await AudioPlayer.addTrack(track);
    }
  }, [currentTrack]);

  const removeFromQueue = useCallback(async (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    await AudioPlayer.removeTrackFromQueue(index);
  }, []);

  const clearQueue = useCallback(async () => {
    setQueue([]);
    setCurrentTrack(null);
    setCurrentIndex(-1);
  }, []);

  const playTrack = useCallback(async (track: Track) => {
    try {
      await AudioPlayer.playTrack(track);
      setCurrentTrack(track);
      setIsPlaying(true);

      setQueue((prev) => {
        if (!prev.find(t => t.id === track.id)) {
          return [track, ...prev];
        }
        return prev;
      });

      addToHistory(track);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    await AudioPlayer.togglePlayback();
    setIsPlaying((prev) => !prev);
  }, []);

  const playNext = useCallback(async () => {
    if (currentIndex < queue.length - 1) {
      const nextTrack = queue[currentIndex + 1];
      await playTrack(nextTrack);
      setCurrentIndex(currentIndex + 1);
    } else if (repeatMode === 'all' && queue.length > 0) {
      await playTrack(queue[0]);
      setCurrentIndex(0);
    }
  }, [currentIndex, queue, repeatMode, playTrack]);

  const playPrevious = useCallback(async () => {
    if (currentIndex > 0) {
      const prevTrack = queue[currentIndex - 1];
      await playTrack(prevTrack);
      setCurrentIndex(currentIndex - 1);
    } else if (repeatMode === 'all' && queue.length > 0) {
      await playTrack(queue[queue.length - 1]);
      setCurrentIndex(queue.length - 1);
    }
  }, [currentIndex, queue, repeatMode, playTrack]);

  const hasNext = currentIndex < queue.length - 1 || repeatMode === 'all';
  const hasPrevious = currentIndex > 0 || repeatMode === 'all';

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(async () => {
    const modes: RepeatMode[] = ['off', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    await AudioPlayer.setRepeatMode(nextMode);
  }, [repeatMode]);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(trackId)) {
        newFavorites.delete(trackId);
      } else {
        newFavorites.add(trackId);
      }
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((trackId: string) => {
    return favorites.has(trackId);
  }, [favorites]);

  const addToHistory = useCallback((track: Track) => {
    setPlayHistory((prev) => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 50);
    });
  }, []);

  const toggleRadioMode = useCallback(() => {
    setRadioMode((prev) => !prev);
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerState(null);
    } else {
      setSleepTimerState(minutes * 60); // Convert to seconds
    }
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    // This will be handled in the player components
  }, []);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepTimerState === null || sleepTimerState <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerState(prev => {
        if (prev === null || prev <= 1) {
          // Timer reached 0, pause playback
          AudioPlayer.pause();
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerState]);

  const nextTrack = currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null;

  const value: PlayerContextType = {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    queue,
    currentIndex,
    nextTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playTrack,
    playNext,
    playPrevious,
    togglePlayPause,
    hasNext,
    hasPrevious,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    favorites,
    toggleFavorite,
    isFavorite,
    playHistory,
    addToHistory,
    radioMode,
    toggleRadioMode,
    sleepTimer: sleepTimerState,
    setSleepTimer,
    playbackSpeed,
    setPlaybackSpeed,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
