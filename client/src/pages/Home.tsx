import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";
import { Search, Play, Heart, Plus, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { usePlayer } from "@/contexts/PlayerContext";
import { Badge } from "@/components/ui/badge";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  source: "youtube" | "soundcloud";
}

export default function Home() {
  const { user } = useAuth();
  const {
    playTrack,
    addToQueue,
    isFavorite,
    toggleFavorite: toggleFavoriteLocal,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  const searchYouTubeMutation = trpc.music.searchYouTube.useMutation();
  const searchSoundCloudMutation = trpc.music.searchSoundCloud.useMutation();
  const saveTrackMutation = trpc.tracks.save.useMutation();
  const toggleFavoriteMutation = trpc.tracks.toggleFavorite.useMutation();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    // Save to recent searches
    addRecentSearch(searchQuery.trim());

    try {
      const [youtubeResults, soundcloudResults] = await Promise.allSettled([
        searchYouTubeMutation.mutateAsync({ query: searchQuery, limit: 15 }),
        searchSoundCloudMutation.mutateAsync({ query: searchQuery, limit: 15 })
      ]);

      const youtube = youtubeResults.status === 'fulfilled' ? youtubeResults.value : [];
      const soundcloud = soundcloudResults.status === 'fulfilled' ? soundcloudResults.value : [];

      const combined: Track[] = [];
      const maxLength = Math.max(youtube.length, soundcloud.length);

      for (let i = 0; i < maxLength; i++) {
        if (youtube[i]) combined.push(youtube[i]);
        if (soundcloud[i]) combined.push(soundcloud[i]);
      }

      setSearchResults(combined);

      if (combined.length === 0) {
        toast.info("No results found");
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchYouTubeMutation, searchSoundCloudMutation, addRecentSearch]);

  const handlePlayTrack = useCallback(async (track: Track) => {
    try {
      if (track.source === "youtube") {
        playTrack(track);

        if (user) {
          await saveTrackMutation.mutateAsync({
            source: track.source,
            sourceId: track.id,
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            thumbnail: track.thumbnail,
          });
        }
      } else {
        toast.info("SoundCloud coming soon");
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error("Failed to play track");
    }
  }, [user, saveTrackMutation, playTrack]);

  const handleAddToQueue = useCallback((track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.source === "youtube") {
      addToQueue(track);
      toast.success("Added to queue");
    } else {
      toast.info("SoundCloud coming soon");
    }
  }, [addToQueue]);

  const handleToggleFavorite = useCallback(async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("Sign in to save favorites");
      return;
    }

    try {
      const result = await toggleFavoriteMutation.mutateAsync({
        sourceId: track.id,
        source: track.source,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        thumbnail: track.thumbnail,
      });
      
      toggleFavoriteLocal(track.id);
      toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error("Failed to update favorites");
    }
  }, [user, toggleFavoriteMutation, toggleFavoriteLocal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Search */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Search Music</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search YouTube and SoundCloud..."
              className="flex-1 bg-zinc-800 border-zinc-700 text-white"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Recent Searches</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearRecentSearches}
                  className="h-6 text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(search);
                      setIsSearching(true);
                      setSearchResults([]);
                      addRecentSearch(search);
                      Promise.allSettled([
                        searchYouTubeMutation.mutateAsync({ query: search, limit: 15 }),
                        searchSoundCloudMutation.mutateAsync({ query: search, limit: 15 })
                      ]).then(([youtubeResults, soundcloudResults]) => {
                        const youtube = youtubeResults.status === 'fulfilled' ? youtubeResults.value : [];
                        const soundcloud = soundcloudResults.status === 'fulfilled' ? soundcloudResults.value : [];
                        const combined: Track[] = [];
                        const maxLength = Math.max(youtube.length, soundcloud.length);
                        for (let i = 0; i < maxLength; i++) {
                          if (youtube[i]) combined.push(youtube[i]);
                          if (soundcloud[i]) combined.push(soundcloud[i]);
                        }
                        setSearchResults(combined);
                        setIsSearching(false);
                      });
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Results */}
        {isSearching && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((track) => (
              <Card
                key={`${track.source}-${track.id}`}
                className="bg-zinc-900/50 border-zinc-800 p-4 hover:bg-zinc-800/50 cursor-pointer"
                onClick={() => handlePlayTrack(track)}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{track.title}</h4>
                    <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-zinc-800">
                        {track.source === 'youtube' ? 'YouTube' : 'SoundCloud'}
                      </span>
                      <span className="text-xs text-zinc-500">{formatTime(track.duration)}</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleAddToQueue(track, e)}
                    title="Add to queue"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleToggleFavorite(track, e)}
                    title="Toggle favorite"
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite(track.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                    title="Play now"
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
