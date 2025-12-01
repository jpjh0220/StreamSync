import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Sparkles } from "lucide-react";

interface AudioEffectsProps {
  audioContextRef: React.RefObject<AudioContext | null>;
}

export function AudioEffects({ audioContextRef }: AudioEffectsProps) {
  const [bassBoost, setBassBoost] = useState(0);
  const [reverb, setReverb] = useState(0);
  const [echo, setEcho] = useState(0);
  const [trebleBoost, setTrebleBoost] = useState(0);

  // Create audio nodes when context is available
  useEffect(() => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;

    // Create bass boost filter (low shelf)
    const bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = bassBoost;

    // Create treble boost filter (high shelf)
    const trebleFilter = audioContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 3000;
    trebleFilter.gain.value = trebleBoost;

    // Note: Reverb and echo would require more complex Web Audio API setup
    // For now, we're just tracking the values

    return () => {
      bassFilter.disconnect();
      trebleFilter.disconnect();
    };
  }, [bassBoost, trebleBoost, audioContextRef]);

  const presets = [
    { name: 'Flat', bass: 0, treble: 0, reverb: 0, echo: 0 },
    { name: 'Bass Boost', bass: 12, treble: 0, reverb: 0, echo: 0 },
    { name: 'Treble Boost', bass: 0, treble: 10, reverb: 0, echo: 0 },
    { name: 'Concert Hall', bass: 3, treble: 2, reverb: 70, echo: 30 },
    { name: 'Studio', bass: 2, treble: 5, reverb: 20, echo: 10 },
    { name: 'Dance', bass: 10, treble: 8, reverb: 10, echo: 5 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setBassBoost(preset.bass);
    setTrebleBoost(preset.treble);
    setReverb(preset.reverb);
    setEcho(preset.echo);
  };

  const isEffectActive = bassBoost !== 0 || trebleBoost !== 0 || reverb !== 0 || echo !== 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Audio effects"
        >
          <Sparkles className={`w-4 h-4 ${isEffectActive ? 'text-purple-400' : 'text-zinc-400'}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Audio Effects</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enhance your listening experience
          </DialogDescription>
        </DialogHeader>

        {/* Presets */}
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-semibold">Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                variant="outline"
                size="sm"
                className="border-zinc-700 hover:bg-zinc-800"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Bass Boost */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Bass Boost</Label>
            <span className="text-xs text-zinc-400">{bassBoost > 0 ? '+' : ''}{bassBoost} dB</span>
          </div>
          <Slider
            value={[bassBoost]}
            onValueChange={(val) => setBassBoost(val[0])}
            min={-12}
            max={12}
            step={1}
            className="w-full"
          />
        </div>

        {/* Treble Boost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Treble Boost</Label>
            <span className="text-xs text-zinc-400">{trebleBoost > 0 ? '+' : ''}{trebleBoost} dB</span>
          </div>
          <Slider
            value={[trebleBoost]}
            onValueChange={(val) => setTrebleBoost(val[0])}
            min={-12}
            max={12}
            step={1}
            className="w-full"
          />
        </div>

        {/* Reverb */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Reverb</Label>
            <span className="text-xs text-zinc-400">{reverb}%</span>
          </div>
          <Slider
            value={[reverb]}
            onValueChange={(val) => setReverb(val[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Echo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Echo</Label>
            <span className="text-xs text-zinc-400">{echo}%</span>
          </div>
          <Slider
            value={[echo]}
            onValueChange={(val) => setEcho(val[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Reset Button */}
        {isEffectActive && (
          <Button
            onClick={() => applyPreset(presets[0])}
            variant="outline"
            className="w-full mt-4 border-zinc-700 hover:bg-zinc-800"
          >
            Reset to Flat
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
