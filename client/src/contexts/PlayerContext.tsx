import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  source: "youtube" | "soundcloud";
}

type RepeatMode = 'off' | 'one' | 'all';

interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (oldIndex: number, newIndex: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  playTrack: (track: Track, addToQueueIfNotPlaying?: boolean) => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  cycleRepeatMode: () => void;
  favorites: Set<string>;
  toggleFavorite: (sourceId: string) => void;
  isFavorite: (sourceId: string) => boolean;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  playHistory: Track[];
  addToHistory: (track: Track) => void;
  clearHistory: () => void;
  sleepTimer: number | null; // minutes remaining
  setSleepTimer: (minutes: number | null) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Persistent queue with localStorage
  const [queue, setQueue] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('playerQueue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    try {
      const saved = localStorage.getItem('currentTrack');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('currentIndex');
      return saved ? parseInt(saved, 10) : -1;
    } catch {
      return -1;
    }
  });

  const [originalQueue, setOriginalQueue] = useState<Track[]>([]); // For shuffle
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null); // seconds remaining
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('playbackSpeed');
      return saved ? parseFloat(saved) : 1;
    } catch {
      return 1;
    }
  });

  // Persistent favorites with localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Recent searches with localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Play history with localStorage (last 50 tracks)
  const [playHistory, setPlayHistory] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('playHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist queue to localStorage
  useEffect(() => {
    localStorage.setItem('playerQueue', JSON.stringify(queue));
  }, [queue]);

  // Persist current track to localStorage
  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('currentTrack', JSON.stringify(currentTrack));
    } else {
      localStorage.removeItem('currentTrack');
    }
  }, [currentTrack]);

  // Persist current index to localStorage
  useEffect(() => {
    localStorage.setItem('currentIndex', currentIndex.toString());
  }, [currentIndex]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepTimer === null || sleepTimer <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerState(prev => {
        if (prev === null || prev <= 1) {
          // Timer expired - stop playback
          setCurrentTrack(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerState(null);
    } else {
      setSleepTimerState(minutes * 60); // Convert to seconds
    }
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    localStorage.setItem('playbackSpeed', speed.toString());
  }, []);

  const playTrack = useCallback((track: Track, addToQueueIfNotPlaying: boolean = true) => {
    if (addToQueueIfNotPlaying && !currentTrack) {
      // First track, start a new queue
      setQueue([track]);
      setCurrentIndex(0);
    } else if (addToQueueIfNotPlaying) {
      // Add to queue and play immediately
      const newQueue = [...queue];
      newQueue.splice(currentIndex + 1, 0, track);
      setQueue(newQueue);
      setCurrentIndex(currentIndex + 1);
    }
    setCurrentTrack(track);
  }, [currentTrack, queue, currentIndex]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
    if (!currentTrack) {
      setCurrentTrack(track);
      setCurrentIndex(0);
    }
  }, [currentTrack]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    } else if (index === currentIndex) {
      // If removing current track, play next or clear
      if (queue.length > index + 1) {
        setCurrentTrack(queue[index + 1]);
      } else if (queue.length > 0 && index > 0) {
        setCurrentTrack(queue[index - 1]);
        setCurrentIndex(index - 1);
      } else {
        setCurrentTrack(null);
        setCurrentIndex(-1);
      }
    }
  }, [currentIndex, queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    setCurrentTrack(null);
  }, []);

  const reorderQueue = useCallback((oldIndex: number, newIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [movedTrack] = newQueue.splice(oldIndex, 1);
      newQueue.splice(newIndex, 0, movedTrack);
      return newQueue;
    });

    // Update current index if needed
    if (oldIndex === currentIndex) {
      setCurrentIndex(newIndex);
    } else if (oldIndex < currentIndex && newIndex >= currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (oldIndex > currentIndex && newIndex <= currentIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex]);

  const playNext = useCallback(() => {
    if (repeatMode === 'one' && currentTrack) {
      // Repeat current track
      setCurrentTrack({ ...currentTrack });
      return;
    }

    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      // Loop back to start
      setCurrentIndex(0);
      setCurrentTrack(queue[0]);
    }
  }, [currentIndex, queue, repeatMode, currentTrack]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
    }
  }, [currentIndex, queue]);

  const hasNext = currentIndex < queue.length - 1 || repeatMode === 'all';
  const hasPrevious = currentIndex > 0;

  const toggleShuffle = useCallback(() => {
    if (!shuffle) {
      // Enable shuffle - save original queue and shuffle
      setOriginalQueue([...queue]);
      const shuffled = [...queue];
      const currentTrackItem = shuffled[currentIndex];

      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Move current track to first position
      if (currentTrackItem) {
        const newIndex = shuffled.indexOf(currentTrackItem);
        if (newIndex !== -1 && newIndex !== 0) {
          shuffled.splice(newIndex, 1);
          shuffled.unshift(currentTrackItem);
        }
        setCurrentIndex(0);
      }

      setQueue(shuffled);
      setShuffle(true);
    } else {
      // Disable shuffle - restore original queue
      if (originalQueue.length > 0) {
        const currentTrackItem = queue[currentIndex];
        setQueue(originalQueue);
        const newIndex = originalQueue.findIndex(t => t.id === currentTrackItem?.id);
        setCurrentIndex(newIndex !== -1 ? newIndex : 0);
      }
      setShuffle(false);
    }
  }, [shuffle, queue, originalQueue, currentIndex]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(current => {
      if (current === 'off') return 'all';
      if (current === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleFavorite = useCallback((sourceId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      // Persist to localStorage
      localStorage.setItem('favorites', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  const isFavorite = (sourceId: string) => {
    return favorites.has(sourceId);
  };

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      const newSearches = [query, ...filtered].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  const addToHistory = useCallback((track: Track) => {
    setPlayHistory(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(t => t.id !== track.id);
      const newHistory = [track, ...filtered].slice(0, 50); // Keep last 50
      localStorage.setItem('playHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setPlayHistory([]);
    localStorage.removeItem('playHistory');
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      setCurrentTrack,
      queue,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      clearQueue,
      playNext,
      playPrevious,
      currentIndex,
      hasNext,
      hasPrevious,
      playTrack,
      shuffle,
      toggleShuffle,
      repeatMode,
      cycleRepeatMode,
      favorites,
      toggleFavorite,
      isFavorite,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      playHistory,
      addToHistory,
      clearHistory,
      sleepTimer,
      setSleepTimer,
      playbackSpeed,
      setPlaybackSpeed,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
