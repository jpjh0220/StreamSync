import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  source: "youtube" | "soundcloud";
}

interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  playTrack: (track: Track, addToQueueIfNotPlaying?: boolean) => void;
  favorites: Set<string>;
  toggleFavorite: (sourceId: string) => void;
  isFavorite: (sourceId: string) => boolean;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
    }
  }, [currentIndex, queue]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
    }
  }, [currentIndex, queue]);

  const hasNext = currentIndex < queue.length - 1;
  const hasPrevious = currentIndex > 0;

  const toggleFavorite = (sourceId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  };

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

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      setCurrentTrack,
      queue,
      addToQueue,
      removeFromQueue,
      clearQueue,
      playNext,
      playPrevious,
      currentIndex,
      hasNext,
      hasPrevious,
      playTrack,
      favorites,
      toggleFavorite,
      isFavorite,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
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
