import { usePlayer } from "@/contexts/PlayerContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward, ListMusic, Shuffle, Repeat, Repeat1, Save, Timer, Gauge, Trash2, Minimize2, Maximize2, PictureInPicture, GripVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState, useRef, useCallback } from "react";
import { Slider } from "./ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Equalizer } from './Equalizer';
import { LyricsPanel } from './LyricsPanel';
import { UrlImport } from './UrlImport';
import { AudioVisualizer } from './AudioVisualizer';
import { FocusTimer } from './FocusTimer';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  source: "youtube" | "soundcloud";
}

interface SortableQueueItemProps {
  track: Track;
  index: number;
  currentIndex: number;
  onRemove: () => void;
}

function SortableQueueItem({ track, index, currentIndex, onRemove }: SortableQueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${track.id}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 rounded ${
        index === currentIndex ? 'bg-purple-900/50' : 'hover:bg-zinc-800'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-zinc-500" />
      </div>
      <img
        src={track.thumbnail}
        alt={track.title}
        className="w-10 h-10 rounded object-cover"
        onError={(e) => {
          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23333" width="40" height="40"/%3E%3C/svg%3E';
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-white">{track.title}</p>
        <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
      </div>
      {index === currentIndex && (
        <span className="text-xs bg-purple-600 px-2 py-0.5 rounded text-white">
          Playing
        </span>
      )}
      {index !== currentIndex && (
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 shrink-0"
          onClick={onRemove}
        >
          <X className="w-3 h-3 text-zinc-400" />
        </Button>
      )}
    </div>
  );
}

export function GlobalPlayer() {
  const { user } = useAuth();
  const {
    currentTrack,
    setCurrentTrack,
    isFavorite,
    toggleFavorite: toggleFavoriteLocal,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    queue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    currentIndex,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    addToHistory,
    sleepTimer,
    setSleepTimer,
    playbackSpeed,
    setPlaybackSpeed,
  } = usePlayer();
  const toggleFavoriteMutation = trpc.tracks.toggleFavorite.useMutation();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((_, i) => `${queue[i].id}-${i}` === active.id);
      const newIndex = queue.findIndex((_, i) => `${queue[i].id}-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQueue(oldIndex, newIndex);
      }
    }
  };

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [error, setError] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const createPlaylistMutation = trpc.playlists.create.useMutation();
  const addTrackToPlaylistMutation = trpc.playlists.addTrack.useMutation();
  const saveTrackMutation = trpc.tracks.save.useMutation();

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

  const sendCommand = useCallback((command: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      sendCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendCommand('playVideo');
      setIsPlaying(true);
    }
  }, [isPlaying, sendCommand]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      sendCommand('unMute');
      setIsMuted(false);
    } else {
      sendCommand('mute');
      setIsMuted(true);
    }
  }, [isMuted, sendCommand]);

  const volumeUp = useCallback(() => {
    const newVolume = Math.min(100, volume + 10);
    setVolume(newVolume);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [newVolume] }),
        '*'
      );
    }
    if (isMuted && newVolume > 0) setIsMuted(false);
  }, [volume, isMuted]);

  const volumeDown = useCallback(() => {
    const newVolume = Math.max(0, volume - 10);
    setVolume(newVolume);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [newVolume] }),
        '*'
      );
    }
    if (newVolume === 0) setIsMuted(true);
  }, [volume]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: currentTrack ? togglePlayPause : undefined,
    onNext: hasNext ? playNext : undefined,
    onPrevious: hasPrevious ? playPrevious : undefined,
    onVolumeUp: currentTrack ? volumeUp : undefined,
    onVolumeDown: currentTrack ? volumeDown : undefined,
    onToggleMute: currentTrack ? toggleMute : undefined,
  });

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

  const handleSaveQueueAsPlaylist = async () => {
    if (!user) {
      toast.error("Please sign in to create playlists");
      return;
    }

    if (!playlistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    if (queue.length === 0) {
      toast.error("Queue is empty");
      return;
    }

    setIsSavingPlaylist(true);

    try {
      // Create playlist
      const playlist = await createPlaylistMutation.mutateAsync({
        name: playlistName.trim(),
        description: playlistDescription.trim() || undefined,
      });

      // Save all tracks and add to playlist
      for (let i = 0; i < queue.length; i++) {
        const track = queue[i];

        // Save track first
        const savedTrack = await saveTrackMutation.mutateAsync({
          source: track.source,
          sourceId: track.id,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          thumbnail: track.thumbnail,
        });

        // Add to playlist
        await addTrackToPlaylistMutation.mutateAsync({
          playlistId: playlist.id,
          trackId: savedTrack.id,
          position: i,
        });
      }

      toast.success(`Playlist "${playlistName}" created with ${queue.length} tracks!`);
      setPlaylistName("");
      setPlaylistDescription("");
    } catch (error) {
      console.error('Save playlist error:', error);
      toast.error("Failed to create playlist");
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSleepTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handlePictureInPicture = async () => {
    try {
      if (!document.pictureInPictureEnabled) {
        toast.error("Picture-in-Picture not supported");
        return;
      }

      const iframe = iframeRef.current;
      if (!iframe) return;

      // For YouTube iframe, we need to use the iframe's document
      // This is a simplified version - real implementation would need more work
      toast.info("Picture-in-Picture: Click the PiP button in the video player");

      // Send PiP command to YouTube iframe
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'requestPictureInPicture', args: '' }),
          '*'
        );
      }
    } catch (error) {
      console.error('PiP error:', error);
      toast.error("Could not activate Picture-in-Picture");
    }
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

    navigator.mediaSession.setActionHandler('nexttrack', hasNext ? playNext : null);
    navigator.mediaSession.setActionHandler('previoustrack', hasPrevious ? playPrevious : null);

    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, [currentTrack, hasNext, hasPrevious, playNext, playPrevious]);

  useEffect(() => {
    setIsPlaying(true);
    setError(false);

    // Add to play history when track changes
    if (currentTrack) {
      addToHistory(currentTrack);
    }
  }, [currentTrack?.id, currentTrack, addToHistory]);

  // Set playback speed when it changes
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [playbackSpeed] }),
        '*'
      );
    }
  }, [playbackSpeed, currentTrack?.id]);

  // Auto-play next track when video ends
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        // YouTube sends state change events: 0 = ended, 1 = playing, 2 = paused
        if (data.event === 'onStateChange' && data.info === 0) {
          // Video ended - play next if available
          if (hasNext || repeatMode !== 'off') {
            playNext();
          }
        }
      } catch {
        // Ignore parse errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [hasNext, playNext, repeatMode]);

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

  // Mini mode player
  if (isMiniMode) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Card className="bg-zinc-900/95 backdrop-blur border-zinc-800 w-64">
          <div className="p-2 flex items-center gap-2">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-10 h-10 rounded object-cover cursor-pointer"
              onClick={() => setIsMiniMode(false)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{currentTrack.title}</p>
              <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={playPrevious} disabled={!hasPrevious} className="h-6 w-6">
              <SkipBack className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" onClick={togglePlayPause} className="h-6 w-6">
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={playNext} disabled={!hasNext} className="h-6 w-6">
              <SkipForward className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsMiniMode(false)} className="h-6 w-6">
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </Card>
        {/* Hidden iframe for playback */}
        <div className="fixed -left-[9999px] w-[640px] h-[360px]">
          <iframe
            ref={iframeRef}
            key={currentTrack.id}
            src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-4">
      <Card className="bg-zinc-900/95 backdrop-blur border-zinc-800 overflow-hidden">
        {/* Video Player - Hidden but playing */}
        <div className="fixed -left-[9999px] w-[640px] h-[360px]" ref={videoContainerRef}>
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
              {/* Previous track */}
              <Button
                size="icon"
                variant="ghost"
                onClick={playPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8"
              >
                <SkipBack className={`w-4 h-4 ${hasPrevious ? 'text-white' : 'text-zinc-600'}`} />
              </Button>

              {/* Play/Pause */}
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

              {/* Next track */}
              <Button
                size="icon"
                variant="ghost"
                onClick={playNext}
                disabled={!hasNext}
                className="h-8 w-8"
              >
                <SkipForward className={`w-4 h-4 ${hasNext ? 'text-white' : 'text-zinc-600'}`} />
              </Button>

              {/* Shuffle */}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleShuffle}
                className="h-8 w-8"
                title={shuffle ? "Disable shuffle" : "Enable shuffle"}
              >
                <Shuffle className={`w-4 h-4 ${shuffle ? 'text-purple-400' : 'text-zinc-400'}`} />
              </Button>

              {/* Repeat */}
              <Button
                size="icon"
                variant="ghost"
                onClick={cycleRepeatMode}
                className="h-8 w-8"
                title={repeatMode === 'off' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4 text-purple-400" />
                ) : (
                  <Repeat className={`w-4 h-4 ${repeatMode === 'all' ? 'text-purple-400' : 'text-zinc-400'}`} />
                )}
              </Button>

              {/* Sleep Timer */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 relative"
                    title="Sleep timer"
                  >
                    <Timer className={`w-4 h-4 ${sleepTimer ? 'text-purple-400' : 'text-zinc-400'}`} />
                    {sleepTimer && sleepTimer > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {Math.ceil(sleepTimer / 60)}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Sleep Timer</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      {sleepTimer ? `Timer active: ${formatSleepTimer(sleepTimer)} remaining` : 'Set a timer to auto-stop playback'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button
                      onClick={() => setSleepTimer(15)}
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      15 min
                    </Button>
                    <Button
                      onClick={() => setSleepTimer(30)}
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      30 min
                    </Button>
                    <Button
                      onClick={() => setSleepTimer(45)}
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      45 min
                    </Button>
                    <Button
                      onClick={() => setSleepTimer(60)}
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      1 hour
                    </Button>
                  </div>
                  {sleepTimer && (
                    <Button
                      onClick={() => setSleepTimer(null)}
                      variant="destructive"
                      className="mt-2 w-full"
                    >
                      Cancel Timer
                    </Button>
                  )}
                </DialogContent>
              </Dialog>

              {/* Playback Speed */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title="Playback speed"
                  >
                    <Gauge className={`w-4 h-4 ${playbackSpeed !== 1 ? 'text-purple-400' : 'text-zinc-400'}`} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Playback Speed</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Current speed: {playbackSpeed}x
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <Button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        variant={playbackSpeed === speed ? "default" : "outline"}
                        className={playbackSpeed === speed ? "bg-purple-600 hover:bg-purple-700" : "border-zinc-700 hover:bg-zinc-800"}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Equalizer */}
              <Equalizer />

              {/* Lyrics */}
              <LyricsPanel
                trackId={currentTrack.id}
                trackTitle={currentTrack.title}
                trackArtist={currentTrack.artist}
              />

              {/* URL Import */}
              <UrlImport />

              {/* Audio Visualizer */}
              <AudioVisualizer isPlaying={isPlaying} />

              {/* Focus Timer */}
              <FocusTimer />

              {/* Favorite */}
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

              {/* Queue */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 relative"
                  >
                    <ListMusic className="w-4 h-4 text-white" />
                    {queue.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {queue.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96 bg-zinc-900 border-zinc-800">
                  <SheetHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <SheetTitle className="text-white">Queue ({queue.length})</SheetTitle>
                        <SheetDescription className="text-zinc-400">
                          Up next tracks
                        </SheetDescription>
                      </div>
                      {queue.length > 0 && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Clear all ${queue.length} tracks from queue?`)) {
                                clearQueue();
                                toast.success("Queue cleared");
                              }
                            }}
                            className="gap-2 border-zinc-700 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-2 border-zinc-700">
                                <Save className="w-4 h-4" />
                                Save
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                            <DialogHeader>
                              <DialogTitle>Save Queue as Playlist</DialogTitle>
                              <DialogDescription className="text-zinc-400">
                                Create a new playlist from your current queue ({queue.length} tracks)
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="playlist-name">Playlist Name</Label>
                                <Input
                                  id="playlist-name"
                                  placeholder="My Awesome Mix"
                                  value={playlistName}
                                  onChange={(e) => setPlaylistName(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="playlist-description">Description (optional)</Label>
                                <Input
                                  id="playlist-description"
                                  placeholder="The best tracks..."
                                  value={playlistDescription}
                                  onChange={(e) => setPlaylistDescription(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleSaveQueueAsPlaylist}
                                disabled={isSavingPlaylist || !playlistName.trim()}
                                className="bg-gradient-to-r from-purple-600 to-pink-600"
                              >
                                {isSavingPlaylist ? "Creating..." : "Create Playlist"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        </div>
                      )}
                    </div>
                  </SheetHeader>
                  <div className="mt-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {queue.length === 0 ? (
                      <p className="text-center text-zinc-500 py-8">No tracks in queue</p>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={queue.map((track, i) => `${track.id}-${i}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {queue.map((track, index) => (
                              <SortableQueueItem
                                key={`${track.id}-${index}`}
                                track={track}
                                index={index}
                                currentIndex={currentIndex}
                                onRemove={() => removeFromQueue(index)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Volume (desktop only) */}
              <div className="hidden md:flex items-center gap-2 ml-2">
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

              {/* Picture-in-Picture */}
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePictureInPicture}
                className="h-8 w-8"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-4 h-4 text-white" />
              </Button>

              {/* Minimize */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMiniMode(true)}
                className="h-8 w-8"
                title="Minimize player"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </Button>

              {/* Close */}
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
