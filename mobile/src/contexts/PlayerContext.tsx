import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { State, Event, useTrackPlayerEvents } from 'react-native-track-player';
import { Track, RepeatMode } from '../types';
import * as AudioPlayer from '../services/audioPlayer';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
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

  // Initialize player on mount
  useEffect(() => {
    const initPlayer = async () => {
      await AudioPlayer.setupPlayer();

      // Load persisted state
      const savedQueue = await AsyncStorage.getItem('queue');
      const savedFavorites = await AsyncStorage.getItem('favorites');
      const savedHistory = await AsyncStorage.getItem('history');

      if (savedQueue) {
        try {
          setQueue(JSON.parse(savedQueue));
        } catch (e) {
          console.error('Error loading queue:', e);
        }
      }

      if (savedFavorites) {
        try {
          setFavorites(new Set(JSON.parse(savedFavorites)));
        } catch (e) {
          console.error('Error loading favorites:', e);
        }
      }

      if (savedHistory) {
        try {
          setPlayHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Error loading history:', e);
        }
      }
    };

    initPlayer();
  }, []);

  // Listen to player events
  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackState) {
      const state = await TrackPlayer.getPlaybackState();
      setIsPlaying(state.state === State.Playing);
    }

    if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
      const track: Track = {
        id: event.track.id as string,
        title: event.track.title as string,
        artist: event.track.artist as string,
        duration: event.track.duration || 0,
        thumbnail: event.track.artwork as string,
        source: 'youtube', // Default to YouTube; could be enhanced
      };
      setCurrentTrack(track);
    }
  });

  // Persist queue changes
  useEffect(() => {
    AsyncStorage.setItem('queue', JSON.stringify(queue));
  }, [queue]);

  // Persist favorites
  useEffect(() => {
    AsyncStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Persist history
  useEffect(() => {
    AsyncStorage.setItem('history', JSON.stringify(playHistory));
  }, [playHistory]);

  const addToQueue = useCallback(async (track: Track) => {
    setQueue((prev) => {
      // Check if track already in queue
      if (prev.find(t => t.id === track.id)) {
        console.log('Track already in queue');
        return prev;
      }
      return [...prev, track];
    });

    // If no current track, play this one
    if (!currentTrack) {
      playTrack(track);
    } else {
      // Add to TrackPlayer queue
      await AudioPlayer.addTrack(track);
    }
  }, [currentTrack]);

  const removeFromQueue = useCallback(async (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    await AudioPlayer.removeTrackFromQueue(index);
  }, []);

  const clearQueue = useCallback(async () => {
    setQueue([]);
    await TrackPlayer.reset();
    setCurrentTrack(null);
    setCurrentIndex(-1);
  }, []);

  const playTrack = useCallback(async (track: Track) => {
    try {
      await AudioPlayer.playTrack(track);
      setCurrentTrack(track);

      // Update queue if not already present
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
    // TODO: Implement shuffle logic with TrackPlayer
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
      // Remove if already exists
      const filtered = prev.filter(t => t.id !== track.id);
      // Add to beginning
      return [track, ...filtered].slice(0, 50); // Keep last 50
    });
  }, []);

  const toggleRadioMode = useCallback(() => {
    setRadioMode((prev) => !prev);
  }, []);

  const value: PlayerContextType = {
    currentTrack,
    isPlaying,
    queue,
    currentIndex,
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
