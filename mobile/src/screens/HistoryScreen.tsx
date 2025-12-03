import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { usePlayer } from '../contexts/PlayerContext';
import { colors } from '../theme/colors';
import { Track } from '../types';

export default function HistoryScreen() {
  const { playHistory, playTrack } = usePlayer();

  const handleTrackPress = (track: Track) => {
    playTrack(track);
  };

  const renderTrack = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleTrackPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.trackNumber}>{index + 1}</Text>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.trackInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Text style={styles.playIcon}>▶</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Play History</Text>
        <Text style={styles.headerSubtitle}>
          {playHistory.length} {playHistory.length === 1 ? 'track' : 'tracks'} played
        </Text>
      </View>

      {playHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyText}>No playback history yet</Text>
          <Text style={styles.emptySubtext}>
            Tracks you play will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={playHistory}
          renderItem={renderTrack}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.surfaceLight,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playIcon: {
    fontSize: 18,
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
