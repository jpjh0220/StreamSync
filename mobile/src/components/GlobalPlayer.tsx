import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../contexts/PlayerContext';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
  } = usePlayer();

  if (!currentTrack) return null;

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
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
            {isPlaying && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>PLAYING</Text>
              </View>
            )}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={playPrevious}
              disabled={!hasPrevious}
              style={styles.controlButton}
            >
              <Text
                style={[
                  styles.controlIcon,
                  !hasPrevious && styles.controlIconDisabled,
                ]}
              >
                ⏮
              </Text>
            </TouchableOpacity>

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

            <TouchableOpacity
              onPress={playNext}
              disabled={!hasNext}
              style={styles.controlButton}
            >
              <Text
                style={[
                  styles.controlIcon,
                  !hasNext && styles.controlIconDisabled,
                ]}
              >
                ⏭
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Above bottom tab bar
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
    height: 3,
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
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 18,
    color: colors.text,
  },
  controlIconDisabled: {
    color: colors.textMuted,
    opacity: 0.3,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
    color: colors.white,
  },
});
