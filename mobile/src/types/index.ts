export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  source: 'youtube' | 'soundcloud';
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  trackCount: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
}
