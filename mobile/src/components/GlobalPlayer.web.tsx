import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from '../contexts/PlayerContext';

export default function GlobalPlayer() {
  const {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    isFavorite,
    toggleFavorite,
    queue,
    removeFromQueue,
    clearQueue,
    sleepTimer,
    setSleepTimer,
    playbackSpeed,
    setPlaybackSpeed,
    radioMode,
    toggleRadioMode,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showPlaybackSpeed, setShowPlaybackSpeed] = useState(false);

  if (!currentTrack) return null;

  const formatSleepTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={webStyles.container}>
      {isPlaying && <div style={webStyles.playingIndicator} />}

      <div style={webStyles.playerCard}>
        <div style={webStyles.content}>
          {/* Thumbnail */}
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            style={webStyles.thumbnail}
          />

          {/* Track Info */}
          <div style={webStyles.trackInfo}>
            <div style={webStyles.trackInfoRow}>
              <h4 style={webStyles.title}>{currentTrack.title}</h4>
              {isPlaying && (
                <span style={webStyles.badge}>PLAYING</span>
              )}
            </div>
            <p style={webStyles.artist}>{currentTrack.artist}</p>
            <div style={webStyles.metaInfo}>
              <span style={webStyles.sourceBadge}>
                {currentTrack.source === 'youtube' ? 'YouTube' : 'SoundCloud'}
              </span>
              <span style={webStyles.duration}>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={webStyles.controls}>
            {/* Previous */}
            <button
              onClick={playPrevious}
              disabled={!hasPrevious}
              style={{
                ...webStyles.controlButton,
                ...(hasPrevious ? {} : webStyles.controlButtonDisabled),
              }}
              title="Previous track"
            >
              ⏮
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              style={webStyles.playButton}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              disabled={!hasNext}
              style={{
                ...webStyles.controlButton,
                ...(hasNext ? {} : webStyles.controlButtonDisabled),
              }}
              title="Next track"
            >
              ⏭
            </button>

            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              style={{
                ...webStyles.controlButton,
                color: shuffle ? '#a855f7' : '#a1a1aa',
              }}
              title={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
            >
              🔀
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              style={{
                ...webStyles.controlButton,
                color: repeatMode !== 'off' ? '#a855f7' : '#a1a1aa',
              }}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? '🔂' : '🔁'}
            </button>

            {/* Sleep Timer */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSleepTimer(!showSleepTimer)}
                style={{
                  ...webStyles.controlButton,
                  color: sleepTimer ? '#a855f7' : '#a1a1aa',
                }}
                title="Sleep timer"
              >
                ⏲
                {sleepTimer && sleepTimer > 0 && (
                  <span style={webStyles.badge2}>{Math.ceil(sleepTimer / 60)}</span>
                )}
              </button>
              {showSleepTimer && (
                <div style={webStyles.dropdown}>
                  <h3 style={webStyles.dropdownTitle}>Sleep Timer</h3>
                  {sleepTimer && (
                    <p style={webStyles.dropdownSubtitle}>
                      {formatSleepTimer(sleepTimer)} remaining
                    </p>
                  )}
                  <div style={webStyles.grid}>
                    {[15, 30, 45, 60].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => {
                          setSleepTimer(minutes);
                          setShowSleepTimer(false);
                        }}
                        style={webStyles.gridButton}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                  {sleepTimer && (
                    <button
                      onClick={() => {
                        setSleepTimer(null);
                        setShowSleepTimer(false);
                      }}
                      style={webStyles.cancelButton}
                    >
                      Cancel Timer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Playback Speed */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowPlaybackSpeed(!showPlaybackSpeed)}
                style={{
                  ...webStyles.controlButton,
                  color: playbackSpeed !== 1 ? '#a855f7' : '#a1a1aa',
                }}
                title="Playback speed"
              >
                ⏩
              </button>
              {showPlaybackSpeed && (
                <div style={webStyles.dropdown}>
                  <h3 style={webStyles.dropdownTitle}>Playback Speed</h3>
                  <p style={webStyles.dropdownSubtitle}>Current: {playbackSpeed}x</p>
                  <div style={webStyles.grid}>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowPlaybackSpeed(false);
                        }}
                        style={{
                          ...webStyles.gridButton,
                          ...(playbackSpeed === speed ? webStyles.gridButtonActive : {}),
                        }}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Radio Mode */}
            <button
              onClick={toggleRadioMode}
              style={{
                ...webStyles.controlButton,
                color: radioMode ? '#a855f7' : '#a1a1aa',
              }}
              title={radioMode ? 'Radio mode on' : 'Radio mode off'}
            >
              📻
            </button>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              style={webStyles.controlButton}
              title={isFavorite(currentTrack.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span style={{ color: isFavorite(currentTrack.id) ? '#ef4444' : '#a1a1aa' }}>
                {isFavorite(currentTrack.id) ? '❤️' : '🤍'}
              </span>
            </button>

            {/* Queue */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              style={webStyles.controlButton}
              title="Queue"
            >
              📋
              {queue.length > 0 && (
                <span style={webStyles.badge2}>{queue.length}</span>
              )}
            </button>

            {/* Close */}
            <button
              onClick={() => setCurrentTrack(null)}
              style={webStyles.controlButton}
              title="Close player"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Queue Panel */}
        {showQueue && (
          <div style={webStyles.queuePanel}>
            <div style={webStyles.queueHeader}>
              <h3 style={webStyles.queueTitle}>Queue ({queue.length})</h3>
              {queue.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Clear all ${queue.length} tracks from queue?`)) {
                      clearQueue();
                    }
                  }}
                  style={webStyles.clearButton}
                >
                  Clear All
                </button>
              )}
            </div>
            <div style={webStyles.queueList}>
              {queue.length === 0 ? (
                <p style={webStyles.emptyQueue}>No tracks in queue</p>
              ) : (
                queue.map((track, index) => (
                  <div key={`${track.id}-${index}`} style={webStyles.queueItem}>
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      style={webStyles.queueThumbnail}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={webStyles.queueTrackTitle}>{track.title}</p>
                      <p style={webStyles.queueTrackArtist}>{track.artist}</p>
                    </div>
                    <button
                      onClick={() => removeFromQueue(index)}
                      style={webStyles.removeButton}
                      title="Remove from queue"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const webStyles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    bottom: '80px',
    left: 0,
    right: 0,
    padding: '0 16px 16px',
    zIndex: 40,
  },
  playingIndicator: {
    position: 'absolute',
    top: 0,
    left: '16px',
    right: '16px',
    height: '4px',
    background: 'linear-gradient(to right, #a855f7, #ec4899)',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  playerCard: {
    background: 'rgba(24, 24, 27, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(63, 63, 70, 0.5)',
    borderRadius: '16px',
    padding: '12px',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  thumbnail: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  title: {
    color: '#fafafa',
    fontSize: '14px',
    fontWeight: '600',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  artist: {
    color: '#a1a1aa',
    fontSize: '12px',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '4px',
  },
  metaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sourceBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    background: '#27272a',
    color: '#d4d4d8',
  },
  duration: {
    fontSize: '10px',
    color: '#71717a',
  },
  badge: {
    fontSize: '8px',
    padding: '2px 6px',
    borderRadius: '4px',
    background: '#22c55e',
    color: 'white',
    fontWeight: 'bold',
    animation: 'pulse 2s ease-in-out infinite',
    flexShrink: 0,
  },
  badge2: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    fontSize: '10px',
    background: '#a855f7',
    color: 'white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  controlButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'transparent',
    color: '#fafafa',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'background 0.2s',
  },
  controlButtonDisabled: {
    color: '#52525b',
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  playButton: {
    width: '36px',
    height: '36px',
    border: 'none',
    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  dropdown: {
    position: 'absolute',
    bottom: '40px',
    right: 0,
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    padding: '12px',
    minWidth: '200px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  dropdownTitle: {
    color: '#fafafa',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  dropdownSubtitle: {
    color: '#a1a1aa',
    fontSize: '12px',
    margin: '0 0 12px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  gridButton: {
    padding: '8px',
    border: '1px solid #3f3f46',
    background: 'transparent',
    color: '#fafafa',
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  gridButtonActive: {
    background: '#a855f7',
    borderColor: '#a855f7',
  },
  cancelButton: {
    width: '100%',
    marginTop: '8px',
    padding: '8px',
    border: '1px solid #3f3f46',
    background: '#ef4444',
    color: 'white',
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  queuePanel: {
    marginTop: '12px',
    borderTop: '1px solid #3f3f46',
    paddingTop: '12px',
  },
  queueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  queueTitle: {
    color: '#fafafa',
    fontSize: '14px',
    fontWeight: '600',
    margin: 0,
  },
  clearButton: {
    padding: '4px 12px',
    border: '1px solid #3f3f46',
    background: 'transparent',
    color: '#ef4444',
    fontSize: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  queueList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  emptyQueue: {
    textAlign: 'center',
    color: '#71717a',
    fontSize: '12px',
    padding: '20px',
    margin: 0,
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '4px',
    transition: 'background 0.2s',
  },
  queueThumbnail: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  queueTrackTitle: {
    color: '#fafafa',
    fontSize: '12px',
    fontWeight: '500',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  queueTrackArtist: {
    color: '#a1a1aa',
    fontSize: '11px',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  removeButton: {
    width: '24px',
    height: '24px',
    border: 'none',
    background: 'transparent',
    color: '#a1a1aa',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '4px',
    flexShrink: 0,
  },
};
