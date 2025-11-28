import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Heart, ListMusic, Loader2, Music2, Play } from "lucide-react";

export default function Library() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: playlists, isLoading: playlistsLoading } = trpc.playlists.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: favorites, isLoading: favoritesLoading } = trpc.tracks.favorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Music2 className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-semibold mb-2">Sign in to view your library</h2>
          <p className="text-zinc-400 mb-6">
            Save your favorite tracks and create playlists
          </p>
          <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Your Library</h1>

        {/* Favorites Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-semibold">Favorites</h2>
          </div>

          {favoritesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid gap-3">
              {favorites.map((track) => (
                <Card key={track.id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <img 
                      src={track.thumbnail || ''} 
                      alt={track.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Play className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">No favorite tracks yet</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Playlists Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <ListMusic className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Playlists</h2>
          </div>

          {playlistsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-full aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                      <ListMusic className="w-12 h-12 text-purple-400" />
                    </div>
                    <h3 className="font-semibold mb-1">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-zinc-400 line-clamp-2">{playlist.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <ListMusic className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">No playlists yet</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
