import TrackPlayer, { Event } from 'react-native-track-player';

export const playbackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('[Playback Service] Remote play');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('[Playback Service] Remote pause');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('[Playback Service] Remote next');
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('[Playback Service] Remote previous');
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    console.log('[Playback Service] Remote seek:', event.position);
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('[Playback Service] Remote stop');
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
    console.log('[Playback Service] Queue ended:', event);
  });

  TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
    console.error('[Playback Service] Playback error:', event);
  });
};
