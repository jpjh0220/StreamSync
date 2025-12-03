import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Playlist } from '../types';

// Update this to your server URL
// For development: use your local IP address (not localhost)
// e.g., 'http://192.168.1.100:3000' or use ngrok for remote testing
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-url.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods
export const searchYouTube = async (query: string, limit: number = 10): Promise<Track[]> => {
  const response = await api.post('/music/searchYouTube', { query, limit });
  return response.data;
};

export const getYouTubeStream = async (videoId: string) => {
  const response = await api.post('/music/getYouTubeStream', { videoId });
  return response.data;
};

export const searchSoundCloud = async (query: string, limit: number = 10): Promise<Track[]> => {
  const response = await api.post('/music/searchSoundCloud', { query, limit });
  return response.data;
};

export const getFavorites = async (): Promise<Track[]> => {
  const response = await api.get('/tracks/favorites');
  return response.data;
};

export const toggleFavorite = async (track: Track) => {
  const response = await api.post('/tracks/toggleFavorite', {
    sourceId: track.id,
    source: track.source,
    title: track.title,
    artist: track.artist,
    duration: track.duration,
    thumbnail: track.thumbnail,
  });
  return response.data;
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const response = await api.get('/playlists');
  return response.data;
};

export const createPlaylist = async (name: string, description?: string) => {
  const response = await api.post('/playlists', { name, description });
  return response.data;
};

export const getPlaylistTracks = async (playlistId: number): Promise<Track[]> => {
  const response = await api.get(`/playlists/${playlistId}/tracks`);
  return response.data;
};

export const addTrackToPlaylist = async (playlistId: number, track: Track) => {
  // First save the track
  const savedTrack = await api.post('/tracks/save', {
    source: track.source,
    sourceId: track.id,
    title: track.title,
    artist: track.artist,
    duration: track.duration,
    thumbnail: track.thumbnail,
  });

  // Then add to playlist
  const response = await api.post('/playlists/addTrack', {
    playlistId,
    trackId: savedTrack.data.id,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    await AsyncStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { username, email, password });
  if (response.data.token) {
    await AsyncStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
};

export default api;
