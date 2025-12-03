import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../contexts/PlayerContext';
import { getFavorites } from '../services/api';
import { Track } from '../types';
import { colors } from '../theme/colors';

export default function LibraryScreen() {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack, currentTrack, playHistory } = usePlayer();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const tracks = await getFavorites();
      setFavorites(tracks);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTrack = ({ item }: { item: Track }) => {
    const isCurrentTrack = currentTrack?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.trackItem, isCurrentTrack && styles.trackItemActive]}
        onPress={() => playTrack(item)}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {item.artist}
          </Text>
          <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        </View>
        {isCurrentTrack && (
          <Text style={styles.playingText}>♪</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, data: Track[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length === 0 ? (
        <Text style={styles.emptyText}>No tracks yet</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
      </LinearGradient>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <>
            {renderSection('Favorites ❤️', favorites)}
            {renderSection('Recent History 🕒', playHistory.slice(0, 10))}
          </>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  trackItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  trackItemActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 12,
  },
  playingText: {
    color: colors.primary,
    fontSize: 24,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
    textAlign: 'center',
  },
});
