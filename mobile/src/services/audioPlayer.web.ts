// Web implementation using HTML5 Audio
// This file is used when running on web (audioPlayer.web.ts)

let audioElement: HTMLAudioElement | null = null;
let currentQueue: any[] = [];
let currentIndex = -1;

export const setupPlayer = async () => {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.addEventListener('ended', () => {
      // Auto-play next track
      if (currentIndex < currentQueue.length - 1) {
        skipToNext();
      }
    });
  }
  return true;
};

export const addTrack = async (track: any) => {
  currentQueue.push(track);
  console.log(`[Web Player] Added track: ${track.title}`);
};

export const playTrack = async (track: any, startPosition?: number) => {
  if (!audioElement) await setupPlayer();

  currentQueue = [track];
  currentIndex = 0;

  const url = track.url || track.streamUrl;
  if (url) {
    audioElement!.src = url;
    if (startPosition) {
      audioElement!.currentTime = startPosition;
    }
    await audioElement!.play();
  }
};

export const addTracksToQueue = async (tracks: any[]) => {
  tracks.forEach(track => {
    currentQueue.push(track);
  });
};

export const togglePlayback = async () => {
  if (!audioElement) return;

  if (audioElement.paused) {
    await audioElement.play();
  } else {
    audioElement.pause();
  }
};

export const skipToNext = async () => {
  if (currentIndex < currentQueue.length - 1) {
    currentIndex++;
    const nextTrack = currentQueue[currentIndex];
    await playTrack(nextTrack);
  }
};

export const skipToPrevious = async () => {
  if (currentIndex > 0) {
    currentIndex--;
    const prevTrack = currentQueue[currentIndex];
    await playTrack(prevTrack);
  }
};

export const seekTo = async (seconds: number) => {
  if (audioElement) {
    audioElement.currentTime = seconds;
  }
};

export const setVolume = async (volume: number) => {
  if (audioElement) {
    audioElement.volume = volume;
  }
};

export const setRepeatMode = async (mode: 'off' | 'one' | 'all') => {
  if (audioElement) {
    audioElement.loop = mode === 'one';
  }
};

export const getQueue = async () => {
  return currentQueue;
};

export const removeTrackFromQueue = async (index: number) => {
  currentQueue.splice(index, 1);
  if (currentIndex >= index) {
    currentIndex--;
  }
};

export const getActiveTrack = async () => {
  return currentQueue[currentIndex] || null;
};

export const getProgress = async () => {
  if (!audioElement) {
    return { position: 0, duration: 0 };
  }
  return {
    position: audioElement.currentTime,
    duration: audioElement.duration || 0,
  };
};

export const getPlaybackState = async () => {
  if (!audioElement) {
    return { state: 'idle' };
  }
  return {
    state: audioElement.paused ? 'paused' : 'playing',
  };
};
