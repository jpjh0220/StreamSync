import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Link, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePlayer } from "@/contexts/PlayerContext";

export function UrlImport() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { addToQueue } = usePlayer();

  const extractVideoId = (url: string): string | null => {
    // YouTube video patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL or video ID");
      return;
    }

    setIsLoading(true);

    try {
      // Extract video ID from URL
      const videoId = extractVideoId(url.trim());

      if (!videoId) {
        toast.error("Invalid YouTube URL or video ID");
        setIsLoading(false);
        return;
      }

      // Create a mock track object
      // In a real implementation, you would fetch video details from YouTube API
      const track = {
        id: videoId,
        title: `Video ${videoId}`,
        artist: "Unknown Artist",
        duration: 240, // 4 minutes default
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        source: "youtube" as const,
      };

      addToQueue(track);
      toast.success("Track added to queue!");
      setUrl("");
      setIsOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import track");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Import from URL"
        >
          <Link className="w-4 h-4 text-zinc-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Import from URL</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add tracks to your queue from YouTube URLs or video IDs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Paste YouTube URL or video ID..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleImport();
                }
              }}
              className="bg-zinc-800 border-zinc-700 text-white"
              disabled={isLoading}
            />
            <p className="text-xs text-zinc-500">
              Supported formats:
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 list-disc list-inside">
              <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>https://youtu.be/VIDEO_ID</li>
              <li>VIDEO_ID (11 characters)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={isLoading || !url.trim()}
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add to Queue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
