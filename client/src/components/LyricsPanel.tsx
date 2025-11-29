import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Textarea } from "./ui/textarea";
import { Music2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

interface LyricsPanelProps {
  trackId: string;
  trackTitle: string;
  trackArtist: string;
}

export function LyricsPanel({ trackId, trackTitle, trackArtist }: LyricsPanelProps) {
  const [lyrics, setLyrics] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Load lyrics from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lyrics_${trackId}`);
      if (saved) {
        setLyrics(saved);
      } else {
        setLyrics("");
      }
    } catch {
      setLyrics("");
    }
  }, [trackId]);

  const handleSaveLyrics = () => {
    try {
      if (editedLyrics.trim()) {
        localStorage.setItem(`lyrics_${trackId}`, editedLyrics);
        setLyrics(editedLyrics);
        toast.success("Lyrics saved!");
      } else {
        localStorage.removeItem(`lyrics_${trackId}`);
        setLyrics("");
        toast.success("Lyrics cleared!");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save lyrics");
    }
  };

  const handleStartEdit = () => {
    setEditedLyrics(lyrics);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLyrics("");
  };

  const renderLyrics = () => {
    if (!lyrics) {
      return (
        <div className="text-center py-12">
          <Music2 className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">
            No Lyrics Available
          </h3>
          <p className="text-sm text-zinc-500 mb-4">
            Add lyrics for this track to follow along
          </p>
          <Button
            onClick={handleStartEdit}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Add Lyrics
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lyrics.split('\n').map((line, index) => (
          <div
            key={index}
            className={`text-base leading-relaxed transition-colors ${
              line.trim() === ''
                ? 'h-4'
                : 'text-zinc-300 hover:text-white cursor-pointer'
            }`}
          >
            {line.trim() || <>&nbsp;</>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Lyrics"
        >
          <Music2 className={`w-4 h-4 ${lyrics ? 'text-purple-400' : 'text-zinc-400'}`} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96 bg-zinc-900 border-zinc-800 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-white">Lyrics</SheetTitle>
              <SheetDescription className="text-zinc-400 text-sm truncate">
                {trackTitle} - {trackArtist}
              </SheetDescription>
            </div>
            {!isEditing && lyrics && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleStartEdit}
                className="text-zinc-400 hover:text-white"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedLyrics}
                onChange={(e) => setEditedLyrics(e.target.value)}
                placeholder="Paste or type lyrics here...&#10;&#10;[Verse 1]&#10;Line 1&#10;Line 2&#10;&#10;[Chorus]&#10;Line 1&#10;Line 2"
                className="bg-zinc-800 border-zinc-700 text-white min-h-[400px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveLyrics}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 border-zinc-700 hover:bg-zinc-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Tip: Lyrics are saved locally to your browser for this track
              </p>
            </div>
          ) : (
            <div
              ref={lyricsRef}
              className="prose prose-invert max-w-none"
            >
              {renderLyrics()}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
