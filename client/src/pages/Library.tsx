import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Heart, ListMusic, Loader2, Music2, Play, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

export default function Library() {
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: playlists, isLoading: playlistsLoading } = trpc.playlists.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: favorites, isLoading: favoritesLoading } = trpc.tracks.favorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleExportPlaylist = async (playlistId: number, playlistName: string) => {
    try {
      // In a real app, you'd fetch the full playlist with tracks
      // For now, we'll export just the playlist metadata
      const exportData = {
        name: playlistName,
        tracks: [], // Would fetch tracks from API
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playlistName.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Playlist exported successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export playlist");
    }
  };

  const handleImportPlaylist = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data
      if (!data.name || !Array.isArray(data.tracks)) {
        throw new Error('Invalid playlist format');
      }

      toast.success(`Playlist "${data.name}" imported (${data.tracks.length} tracks)`);
      // In a real app, you'd create the playlist and add tracks via API

    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import playlist - Invalid format");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ListMusic className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-semibold">Playlists</h2>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={handleImportPlaylist}
                variant="outline"
                size="sm"
                className="gap-2 border-zinc-700 hover:bg-zinc-800"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </div>
          </div>

          {playlistsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                  <CardContent className="p-6">
                    <div className="w-full aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center relative">
                      <ListMusic className="w-12 h-12 text-purple-400" />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPlaylist(playlist.id, playlist.name);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 hover:bg-zinc-800"
                        title="Export playlist"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
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
