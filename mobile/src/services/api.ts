import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Playlist } from '../types';

// API URL configuration
// Priority: ENV variable > window.location (web) > localhost (dev)
const getApiBaseUrl = () => {
  // 1. Use environment variable if set (for custom deployments)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. For web platform, use same origin (works when deployed together)
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    // If deployed on same domain as backend, use relative URL
    return origin;
  }

  // 3. Default to localhost for development
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used for debugging
console.log('[API] Using base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// tRPC helper function
const trpcCall = async (path: string, input: any) => {
  const response = await api.get(`/api/trpc/${path}`, {
    params: {
      input: JSON.stringify(input),
    },
  });
  return response.data.result.data;
};

const trpcMutation = async (path: string, input: any) => {
  const response = await api.post(`/api/trpc/${path}`, input);
  return response.data.result.data;
};

// API Methods
export const searchYouTube = async (query: string, limit: number = 10): Promise<Track[]> => {
  try {
    const result = await trpcMutation('music.searchYouTube', { query, limit });
    return result || [];
  } catch (error: any) {
    console.error('Search YouTube error:', error.message);
    throw error;
  }
};

export const getYouTubeStream = async (videoId: string) => {
  try {
    const result = await trpcMutation('music.getYouTubeStream', { videoId });
    return result;
  } catch (error: any) {
    console.error('Get YouTube stream error:', error.message);
    throw error;
  }
};

export const searchSoundCloud = async (query: string, limit: number = 10): Promise<Track[]> => {
  try {
    const result = await trpcMutation('music.searchSoundCloud', { query, limit });
    return result || [];
  } catch (error: any) {
    console.error('Search SoundCloud error:', error.message);
    return [];
  }
};

export const getFavorites = async (): Promise<Track[]> => {
  try {
    const result = await trpcCall('tracks.getFavorites', {});
    return result || [];
  } catch (error: any) {
    console.error('Get favorites error:', error.message);
    return [];
  }
};

export const toggleFavorite = async (track: Track) => {
  try {
    const result = await trpcMutation('tracks.toggleFavorite', {
      sourceId: track.id,
      source: track.source,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      thumbnail: track.thumbnail,
    });
    return result;
  } catch (error: any) {
    console.error('Toggle favorite error:', error.message);
    throw error;
  }
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  try {
    const result = await trpcCall('playlists.list', {});
    return result || [];
  } catch (error: any) {
    console.error('Get playlists error:', error.message);
    return [];
  }
};

export const createPlaylist = async (name: string, description?: string) => {
  try {
    const result = await trpcMutation('playlists.create', { name, description });
    return result;
  } catch (error: any) {
    console.error('Create playlist error:', error.message);
    throw error;
  }
};

export const getPlaylistTracks = async (playlistId: number): Promise<Track[]> => {
  try {
    const result = await trpcCall('playlists.getTracks', { playlistId });
    return result || [];
  } catch (error: any) {
    console.error('Get playlist tracks error:', error.message);
    return [];
  }
};

export const addTrackToPlaylist = async (playlistId: number, track: Track) => {
  try {
    // First save the track
    const savedTrack = await trpcMutation('tracks.save', {
      source: track.source,
      sourceId: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      thumbnail: track.thumbnail,
    });

    // Then add to playlist
    const result = await trpcMutation('playlists.addTrack', {
      playlistId,
      trackId: savedTrack.id,
    });
    return result;
  } catch (error: any) {
    console.error('Add track to playlist error:', error.message);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const result = await trpcMutation('auth.login', { email, password });
    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
    }
    return result;
  } catch (error: any) {
    console.error('Login error:', error.message);
    throw error;
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const result = await trpcMutation('auth.register', { username, email, password });
    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
    }
    return result;
  } catch (error: any) {
    console.error('Register error:', error.message);
    throw error;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
};

export default api;
