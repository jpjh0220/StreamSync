import { usePlayer } from "@/contexts/PlayerContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function History() {
  const { playHistory, clearHistory, playTrack } = usePlayer();

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your play history?")) {
      clearHistory();
      toast.success("Play history cleared");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Play History
          </h1>
          <p className="text-zinc-400 mt-2">
            {playHistory.length === 0
              ? "No tracks played yet"
              : `${playHistory.length} track${playHistory.length === 1 ? '' : 's'} played`}
          </p>
        </div>
        {playHistory.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="gap-2 border-zinc-700 hover:bg-zinc-800"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* History List */}
      {playHistory.length === 0 ? (
        <Card className="bg-zinc-900/50 border-zinc-800 p-12">
          <div className="text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">
              No Play History
            </h3>
            <p className="text-zinc-500">
              Start listening to music and your history will appear here
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {playHistory.map((track, index) => (
            <Card
              key={`${track.id}-${index}`}
              className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 transition-colors overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative group shrink-0">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-16 h-16 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23333" width="64" height="64"/%3E%3C/svg%3E';
                    }}
                  />
                  {/* Play Overlay */}
                  <button
                    onClick={() => playTrack(track)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
                  >
                    <Play className="w-6 h-6 text-white fill-white" />
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {track.title}
                  </h3>
                  <p className="text-sm text-zinc-400 truncate">
                    {track.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {track.source === 'youtube' ? 'YouTube' : 'SoundCloud'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>

                {/* Play Button */}
                <Button
                  size="icon"
                  onClick={() => playTrack(track)}
                  className="shrink-0 bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
