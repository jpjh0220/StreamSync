import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode as PlayerRepeatMode,
  State,
} from 'react-native-track-player';
import { getYouTubeStream } from './api';

export const setupPlayer = async () => {
  let isSetup = false;
  try {
    await TrackPlayer.getActiveTrack();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      progressUpdateEventInterval: 1,
    });
    isSetup = true;
  }
  return isSetup;
};

export const addTrack = async (track: any) => {
  try {
    // For YouTube tracks, we need to get the stream URL first
    let url = track.url;
    if (track.source === 'youtube' && !url) {
      console.log(`[Player] Fetching stream URL for: ${track.title}`);
      const streamData = await getYouTubeStream(track.id);
      url = streamData.url;
    }

    await TrackPlayer.add({
      id: track.id,
      url: url,
      title: track.title,
      artist: track.artist,
      artwork: track.thumbnail,
      duration: track.duration,
    });

    console.log(`[Player] Added track: ${track.title}`);
  } catch (error) {
    console.error('[Player] Error adding track:', error);
    throw error;
  }
};

export const playTrack = async (track: any, startPosition?: number) => {
  try {
    await TrackPlayer.reset();
    await addTrack(track);

    if (startPosition) {
      await TrackPlayer.seekTo(startPosition);
    }

    await TrackPlayer.play();
  } catch (error) {
    console.error('[Player] Error playing track:', error);
    throw error;
  }
};

export const addTracksToQueue = async (tracks: any[]) => {
  for (const track of tracks) {
    try {
      await addTrack(track);
    } catch (error) {
      console.warn(`[Player] Skipped track ${track.title} due to error:`, error);
    }
  }
};

export const togglePlayback = async () => {
  const state = await TrackPlayer.getPlaybackState();
  const isPlaying = state.state === State.Playing;

  if (isPlaying) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
};

export const skipToNext = async () => {
  try {
    await TrackPlayer.skipToNext();
  } catch (error) {
    console.log('[Player] No next track available');
  }
};

export const skipToPrevious = async () => {
  try {
    await TrackPlayer.skipToPrevious();
  } catch (error) {
    console.log('[Player] No previous track available');
  }
};

export const seekTo = async (seconds: number) => {
  await TrackPlayer.seekTo(seconds);
};

export const setVolume = async (volume: number) => {
  // volume should be between 0 and 1
  await TrackPlayer.setVolume(volume);
};

export const setRepeatMode = async (mode: 'off' | 'one' | 'all') => {
  const modeMap = {
    off: PlayerRepeatMode.Off,
    one: PlayerRepeatMode.Track,
    all: PlayerRepeatMode.Queue,
  };
  await TrackPlayer.setRepeatMode(modeMap[mode]);
};

export const getQueue = async () => {
  return await TrackPlayer.getQueue();
};

export const removeTrackFromQueue = async (index: number) => {
  await TrackPlayer.remove(index);
};

export const getActiveTrack = async () => {
  return await TrackPlayer.getActiveTrack();
};

export const getProgress = async () => {
  return await TrackPlayer.getProgress();
};

export const getPlaybackState = async () => {
  return await TrackPlayer.getPlaybackState();
};
