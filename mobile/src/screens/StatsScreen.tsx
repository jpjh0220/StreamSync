import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { usePlayer } from '../contexts/PlayerContext';
import { colors } from '../theme/colors';

export default function StatsScreen() {
  const { playHistory, queue, favorites } = usePlayer();

  const stats = useMemo(() => {
    const totalPlays = playHistory.length;
    const uniqueTracks = new Set(playHistory.map(t => t.id)).size;
    const totalFavorites = favorites.size;
    const queueLength = queue.length;

    // Calculate total listening time
    const totalSeconds = playHistory.reduce((sum, track) => sum + track.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // Count YouTube vs SoundCloud
    const youtubePlays = playHistory.filter(t => t.source === 'youtube').length;
    const soundcloudPlays = playHistory.filter(t => t.source === 'soundcloud').length;

    // Top artists
    const artistCounts: { [key: string]: number } = {};
    playHistory.forEach(track => {
      artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
    });
    const topArtists = Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([artist, count]) => ({ artist, count }));

    return {
      totalPlays,
      uniqueTracks,
      totalFavorites,
      queueLength,
      totalTime: `${hours}h ${minutes}m`,
      youtubePlays,
      soundcloudPlays,
      topArtists,
    };
  }, [playHistory, queue, favorites]);

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Stats</Text>
          <Text style={styles.headerSubtitle}>
            Your music listening statistics
          </Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total Plays" value={stats.totalPlays} />
            <StatCard title="Unique Tracks" value={stats.uniqueTracks} />
            <StatCard title="Favorites" value={stats.totalFavorites} />
            <StatCard title="Queue Size" value={stats.queueLength} />
          </View>
        </View>

        {/* Listening Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listening Time</Text>
          <View style={styles.timeCard}>
            <Text style={styles.timeValue}>{stats.totalTime}</Text>
            <Text style={styles.timeLabel}>Total time listened</Text>
          </View>
        </View>

        {/* Source Breakdown */}
        {(stats.youtubePlays > 0 || stats.soundcloudPlays > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sources</Text>
            <View style={styles.sourceContainer}>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>YouTube</Text>
                <Text style={styles.sourceCount}>{stats.youtubePlays} plays</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(stats.youtubePlays / stats.totalPlays) * 100}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>SoundCloud</Text>
                <Text style={styles.sourceCount}>{stats.soundcloudPlays} plays</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(stats.soundcloudPlays / stats.totalPlays) * 100}%`,
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Top Artists */}
        {stats.topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Artists</Text>
            {stats.topArtists.map((item, index) => (
              <View key={item.artist} style={styles.artistItem}>
                <Text style={styles.artistRank}>#{index + 1}</Text>
                <View style={styles.artistInfo}>
                  <Text style={styles.artistName}>{item.artist}</Text>
                  <Text style={styles.artistCount}>{item.count} plays</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {stats.totalPlays === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No stats yet</Text>
            <Text style={styles.emptySubtext}>
              Start playing music to see your statistics
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  timeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sourceContainer: {
    gap: 12,
  },
  sourceItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sourceCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  artistRank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    width: 40,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  artistCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
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
