import { usePlayer } from "@/contexts/PlayerContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { Slider } from "./ui/slider";

export function GlobalPlayer() {
  const { user } = useAuth();
  const { currentTrack, setCurrentTrack, isFavorite, toggleFavorite: toggleFavoriteLocal } = usePlayer();
  const toggleFavoriteMutation = trpc.tracks.toggleFavorite.useMutation();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleToggleFavorite = async () => {
    if (!currentTrack) return;

    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    try {
      const result = await toggleFavoriteMutation.mutateAsync({
        sourceId: currentTrack.id,
        source: currentTrack.source,
        title: currentTrack.title,
        artist: currentTrack.artist,
        duration: currentTrack.duration,
        thumbnail: currentTrack.thumbnail,
      });

      toggleFavoriteLocal(currentTrack.id);
      toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error("Failed to update favorites");
    }
  };

  const sendCommand = (command: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      sendCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      sendCommand('unMute');
      setIsMuted(false);
    } else {
      sendCommand('mute');
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [newVolume] }),
        '*'
      );
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleClose = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setError(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: [
        { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      sendCommand('playVideo');
      setIsPlaying(true);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      sendCommand('pauseVideo');
      setIsPlaying(false);
    });

    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    };
  }, [currentTrack]);

  useEffect(() => {
    setIsPlaying(true);
    setError(false);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  if (error) {
    return (
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-4">
        <Card className="bg-red-900/95 backdrop-blur border-red-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Failed to load video</p>
              <p className="text-xs text-red-200">This video may be unavailable or restricted</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClose}
            >
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-4">
      <Card className="bg-zinc-900/95 backdrop-blur border-zinc-800 overflow-hidden">
        {/* Video Player - Hidden but playing */}
        <div className="w-0 h-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            key={currentTrack.id}
            src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentTrack.title}
            onError={() => setError(true)}
          />
        </div>

        {/* Mini Player UI */}
        <div className="p-3">
          <div className="flex items-center gap-3">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-12 h-12 rounded object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23333" width="48" height="48"/%3E%3C/svg%3E';
              }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate text-white">{currentTrack.title}</h4>
              <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {currentTrack.source === 'youtube' ? 'YouTube' : 'SoundCloud'}
                </span>
                <span className="text-xs text-zinc-500">{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlayPause}
                className="h-8 w-8"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleToggleFavorite}
                className="h-8 w-8"
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite(currentTrack.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </Button>

              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="h-8 w-8"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </Button>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-20"
                />
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
