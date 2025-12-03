import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../contexts/PlayerContext';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

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
    <View style={styles.container}>
      {/* Now Playing Indicator */}
      {isPlaying && <View style={styles.playingIndicator} />}

      <LinearGradient
        colors={[colors.surface + 'F0', colors.background + 'F0']}
        style={styles.playerCard}
      >
        <View style={styles.content}>
          {/* Thumbnail */}
          <Image
            source={{ uri: currentTrack.thumbnail }}
            style={styles.thumbnail}
          />

          {/* Track Info */}
          <View style={styles.trackInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              {isPlaying && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingBadgeText}>PLAYING</Text>
                </View>
              )}
            </View>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceBadgeText}>
                  {currentTrack.source === 'youtube' ? 'YouTube' : 'SoundCloud'}
                </Text>
              </View>
              <Text style={styles.duration}>{formatTime(currentTrack.duration)}</Text>
            </View>
          </View>

          {/* Controls Row 1 */}
          <View style={styles.controls}>
            {/* Previous */}
            <TouchableOpacity
              onPress={playPrevious}
              disabled={!hasPrevious}
              style={styles.controlButton}
            >
              <Text style={[styles.controlIcon, !hasPrevious && styles.controlIconDisabled]}>
                ⏮
              </Text>
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.playButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity
              onPress={playNext}
              disabled={!hasNext}
              style={styles.controlButton}
            >
              <Text style={[styles.controlIcon, !hasNext && styles.controlIconDisabled]}>
                ⏭
              </Text>
            </TouchableOpacity>

            {/* Shuffle */}
            <TouchableOpacity onPress={toggleShuffle} style={styles.controlButton}>
              <Text style={[styles.controlIcon, shuffle && styles.controlIconActive]}>
                🔀
              </Text>
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity onPress={cycleRepeatMode} style={styles.controlButton}>
              <Text style={[styles.controlIcon, repeatMode !== 'off' && styles.controlIconActive]}>
                {repeatMode === 'one' ? '🔂' : '🔁'}
              </Text>
            </TouchableOpacity>

            {/* Radio Mode */}
            <TouchableOpacity onPress={toggleRadioMode} style={styles.controlButton}>
              <Text style={[styles.controlIcon, radioMode && styles.controlIconActive]}>
                📻
              </Text>
            </TouchableOpacity>

            {/* Favorite */}
            <TouchableOpacity
              onPress={() => toggleFavorite(currentTrack.id)}
              style={styles.controlButton}
            >
              <Text style={styles.controlIcon}>
                {isFavorite(currentTrack.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>

            {/* Queue */}
            <TouchableOpacity
              onPress={() => setShowQueue(!showQueue)}
              style={styles.controlButton}
            >
              <Text style={styles.controlIcon}>📋</Text>
              {queue.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{queue.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Extended Controls Row 2 */}
        <View style={styles.extendedControls}>
          {/* Sleep Timer */}
          <TouchableOpacity
            onPress={() => setShowSleepTimer(true)}
            style={styles.extendedButton}
          >
            <Text style={[styles.controlIcon, sleepTimer && styles.controlIconActive]}>⏲</Text>
            <Text style={styles.extendedButtonLabel}>Sleep</Text>
            {sleepTimer && sleepTimer > 0 && (
              <View style={styles.smallBadge}>
                <Text style={styles.smallBadgeText}>{Math.ceil(sleepTimer / 60)}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Playback Speed */}
          <TouchableOpacity
            onPress={() => setShowPlaybackSpeed(true)}
            style={styles.extendedButton}
          >
            <Text style={[styles.controlIcon, playbackSpeed !== 1 && styles.controlIconActive]}>
              ⏩
            </Text>
            <Text style={styles.extendedButtonLabel}>Speed</Text>
          </TouchableOpacity>

          {/* Close */}
          <TouchableOpacity
            onPress={() => setCurrentTrack(null)}
            style={styles.extendedButton}
          >
            <Text style={styles.controlIcon}>✕</Text>
            <Text style={styles.extendedButtonLabel}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Queue Panel (expandable) */}
        {showQueue && (
          <View style={styles.queuePanel}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Queue ({queue.length})</Text>
              {queue.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    clearQueue();
                    setShowQueue(false);
                  }}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.queueList} nestedScrollEnabled>
              {queue.length === 0 ? (
                <Text style={styles.emptyQueue}>No tracks in queue</Text>
              ) : (
                queue.map((track, index) => (
                  <View key={`${track.id}-${index}`} style={styles.queueItem}>
                    <Image source={{ uri: track.thumbnail }} style={styles.queueThumbnail} />
                    <View style={styles.queueTrackInfo}>
                      <Text style={styles.queueTrackTitle} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <Text style={styles.queueTrackArtist} numberOfLines={1}>
                        {track.artist}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromQueue(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </LinearGradient>

      {/* Sleep Timer Modal */}
      <Modal
        visible={showSleepTimer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSleepTimer(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSleepTimer(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Sleep Timer</Text>
            {sleepTimer && (
              <Text style={styles.modalSubtitle}>
                {formatSleepTimer(sleepTimer)} remaining
              </Text>
            )}
            <View style={styles.modalGrid}>
              {[15, 30, 45, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  onPress={() => {
                    setSleepTimer(minutes);
                    setShowSleepTimer(false);
                  }}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>{minutes} min</Text>
                </TouchableOpacity>
              ))}
            </View>
            {sleepTimer && (
              <TouchableOpacity
                onPress={() => {
                  setSleepTimer(null);
                  setShowSleepTimer(false);
                }}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>Cancel Timer</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Playback Speed Modal */}
      <Modal
        visible={showPlaybackSpeed}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlaybackSpeed(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlaybackSpeed(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Playback Speed</Text>
            <Text style={styles.modalSubtitle}>Current: {playbackSpeed}x</Text>
            <View style={styles.modalGrid}>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  onPress={() => {
                    setPlaybackSpeed(speed);
                    setShowPlaybackSpeed(false);
                  }}
                  style={[
                    styles.modalButton,
                    playbackSpeed === speed && styles.modalButtonActive,
                  ]}
                >
                  <Text style={styles.modalButtonText}>{speed}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  playingIndicator: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  playerCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  playingBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  playingBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceBadgeText: {
    color: colors.textSecondary,
    fontSize: 9,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  controlIcon: {
    fontSize: 16,
    color: colors.text,
  },
  controlIconDisabled: {
    color: colors.textMuted,
    opacity: 0.3,
  },
  controlIconActive: {
    color: colors.primary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 18,
    color: colors.white,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  extendedControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  extendedButton: {
    alignItems: 'center',
    position: 'relative',
  },
  extendedButtonLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  smallBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  smallBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  queuePanel: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 12,
  },
  queueList: {
    maxHeight: 200,
  },
  emptyQueue: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    padding: 20,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    marginBottom: 4,
  },
  queueThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  queueTrackInfo: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  queueTrackTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  queueTrackArtist: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  modalButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  modalCancelButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
