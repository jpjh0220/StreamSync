import { usePlayer } from "@/contexts/PlayerContext";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { BarChart3, Clock, Headphones, TrendingUp, Music, Award } from "lucide-react";

export default function Stats() {
  const { playHistory } = usePlayer();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPlays = playHistory.length;
    const totalDuration = playHistory.reduce((acc, track) => acc + track.duration, 0);
    const uniqueTracks = new Set(playHistory.map(t => t.id)).size;

    // Top artists
    const artistCounts = new Map<string, { count: number; totalDuration: number }>();
    playHistory.forEach(track => {
      const existing = artistCounts.get(track.artist);
      if (existing) {
        existing.count++;
        existing.totalDuration += track.duration;
      } else {
        artistCounts.set(track.artist, { count: 1, totalDuration: track.duration });
      }
    });

    const topArtists = Array.from(artistCounts.entries())
      .map(([artist, data]) => ({ artist, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top tracks
    const trackCounts = new Map<string, { track: any; count: number }>();
    playHistory.forEach(track => {
      const existing = trackCounts.get(track.id);
      if (existing) {
        existing.count++;
      } else {
        trackCounts.set(track.id, { track, count: 1 });
      }
    });

    const topTracks = Array.from(trackCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Source distribution
    const sources = { youtube: 0, soundcloud: 0 };
    playHistory.forEach(track => {
      if (track.source === 'youtube') sources.youtube++;
      else sources.soundcloud++;
    });

    // Recent activity (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentPlays = playHistory.filter((_, index) => {
      // Assuming most recent tracks are first
      return index < 100; // Last 100 tracks as proxy for recent
    });

    return {
      totalPlays,
      totalDuration,
      uniqueTracks,
      topArtists,
      topTracks,
      sources,
      recentPlays: recentPlays.length,
    };
  }, [playHistory]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Listening Statistics
        </h1>
        <p className="text-zinc-400 mt-2">
          Your music journey at a glance
        </p>
      </div>

      {playHistory.length === 0 ? (
        <Card className="bg-zinc-900/50 border-zinc-800 p-12">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">
              No Statistics Yet
            </h3>
            <p className="text-zinc-500">
              Start listening to music to see your stats here
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Total Plays</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPlays}</p>
                </div>
                <Headphones className="w-10 h-10 text-purple-400" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-200 text-sm mb-1">Listening Time</p>
                  <p className="text-3xl font-bold text-white">{formatDuration(stats.totalDuration)}</p>
                </div>
                <Clock className="w-10 h-10 text-pink-400" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Unique Tracks</p>
                  <p className="text-3xl font-bold text-white">{stats.uniqueTracks}</p>
                </div>
                <Music className="w-10 h-10 text-blue-400" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm mb-1">Recent Plays</p>
                  <p className="text-3xl font-bold text-white">{stats.recentPlays}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </Card>
          </div>

          {/* Top Artists */}
          {stats.topArtists.length > 0 && (
            <Card className="bg-zinc-900/50 border-zinc-800 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Top Artists</h2>
              </div>
              <div className="space-y-3">
                {stats.topArtists.map((artist, index) => {
                  const maxCount = stats.topArtists[0].count;
                  const percentage = (artist.count / maxCount) * 100;

                  return (
                    <div key={artist.artist} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{artist.artist}</p>
                            <p className="text-xs text-zinc-400">
                              {artist.count} {artist.count === 1 ? 'play' : 'plays'} • {formatDuration(artist.totalDuration)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Top Tracks */}
          {stats.topTracks.length > 0 && (
            <Card className="bg-zinc-900/50 border-zinc-800 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-pink-400" />
                <h2 className="text-xl font-semibold text-white">Most Played Tracks</h2>
              </div>
              <div className="space-y-3">
                {stats.topTracks.map(({ track, count }, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-3 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-600 text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23333" width="48" height="48"/%3E%3C/svg%3E';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate text-sm">
                        {track.title}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate">
                        {track.artist} • {formatTime(track.duration)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-pink-400">
                        {count} {count === 1 ? 'play' : 'plays'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Source Distribution */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Source Distribution</h2>
            </div>
            <div className="space-y-4">
              {stats.sources.youtube > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">YouTube</span>
                    <span className="text-zinc-400">
                      {stats.sources.youtube} plays ({Math.round((stats.sources.youtube / stats.totalPlays) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-500"
                      style={{ width: `${(stats.sources.youtube / stats.totalPlays) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {stats.sources.soundcloud > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">SoundCloud</span>
                    <span className="text-zinc-400">
                      {stats.sources.soundcloud} plays ({Math.round((stats.sources.soundcloud / stats.totalPlays) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-orange-600 h-full transition-all duration-500"
                      style={{ width: `${(stats.sources.soundcloud / stats.totalPlays) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
