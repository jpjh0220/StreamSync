import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Sliders, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface EqualizerBand {
  frequency: string;
  gain: number;
}

interface EqualizerPreset {
  name: string;
  bands: number[];
}

const defaultBands: EqualizerBand[] = [
  { frequency: "60Hz", gain: 0 },
  { frequency: "170Hz", gain: 0 },
  { frequency: "310Hz", gain: 0 },
  { frequency: "600Hz", gain: 0 },
  { frequency: "1kHz", gain: 0 },
  { frequency: "3kHz", gain: 0 },
  { frequency: "6kHz", gain: 0 },
  { frequency: "12kHz", gain: 0 },
  { frequency: "14kHz", gain: 0 },
  { frequency: "16kHz", gain: 0 },
];

const presets: EqualizerPreset[] = [
  { name: "Flat", bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: "Rock", bands: [5, 3, -2, -3, -1, 2, 4, 5, 5, 5] },
  { name: "Pop", bands: [-1, 3, 4, 4, 2, 0, -1, -1, -1, -1] },
  { name: "Jazz", bands: [4, 3, 1, 2, -1, -1, 0, 2, 3, 4] },
  { name: "Classical", bands: [5, 4, 3, 2, -1, -1, 0, 2, 3, 4] },
  { name: "Bass Boost", bands: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: "Treble Boost", bands: [0, 0, 0, 0, 0, 2, 4, 6, 8, 8] },
  { name: "Vocal Boost", bands: [-2, -1, 0, 1, 3, 4, 4, 3, 1, 0] },
  { name: "Dance", bands: [6, 4, 2, 0, 0, 2, 4, 5, 5, 0] },
  { name: "Electronic", bands: [5, 4, 1, 0, -2, 2, 1, 2, 5, 6] },
];

export function Equalizer() {
  const [bands, setBands] = useState<EqualizerBand[]>(() => {
    try {
      const saved = localStorage.getItem('equalizerBands');
      return saved ? JSON.parse(saved) : defaultBands;
    } catch {
      return defaultBands;
    }
  });

  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('equalizerEnabled');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('equalizerBands', JSON.stringify(bands));
  }, [bands]);

  useEffect(() => {
    localStorage.setItem('equalizerEnabled', enabled.toString());
  }, [enabled]);

  const handleBandChange = (index: number, value: number[]) => {
    const newBands = [...bands];
    newBands[index].gain = value[0];
    setBands(newBands);
    setSelectedPreset(null);
  };

  const applyPreset = (preset: EqualizerPreset) => {
    const newBands = bands.map((band, index) => ({
      ...band,
      gain: preset.bands[index],
    }));
    setBands(newBands);
    setSelectedPreset(preset.name);
    setEnabled(true);
    toast.success(`Applied ${preset.name} preset`);
  };

  const resetEqualizer = () => {
    setBands(defaultBands);
    setSelectedPreset(null);
    toast.success("Equalizer reset to flat");
  };

  const toggleEnabled = () => {
    setEnabled(!enabled);
    toast.success(enabled ? "Equalizer disabled" : "Equalizer enabled");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Equalizer"
        >
          <Sliders className={`w-4 h-4 ${enabled ? 'text-purple-400' : 'text-zinc-400'}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Audio Equalizer</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={resetEqualizer}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={toggleEnabled}
                className={enabled ? "bg-purple-600 hover:bg-purple-700" : "bg-zinc-700 hover:bg-zinc-600"}
              >
                {enabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {enabled ? "Adjust frequency bands to customize your sound" : "Enable equalizer to start customizing"}
          </DialogDescription>
        </DialogHeader>

        {/* Presets */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Presets</h3>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                onClick={() => applyPreset(preset)}
                variant={selectedPreset === preset.name ? "default" : "outline"}
                className={
                  selectedPreset === preset.name
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-zinc-700 hover:bg-zinc-800"
                }
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Equalizer Bands */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Frequency Bands</h3>
          <div className="flex items-end justify-between gap-3 h-64">
            {bands.map((band, index) => (
              <div key={band.frequency} className="flex flex-col items-center flex-1">
                <div className="text-xs text-zinc-500 mb-2 font-mono">
                  {band.gain > 0 ? '+' : ''}{band.gain}dB
                </div>
                <div className="h-48 flex items-center">
                  <Slider
                    value={[band.gain]}
                    onValueChange={(value) => handleBandChange(index, value)}
                    min={-12}
                    max={12}
                    step={1}
                    orientation="vertical"
                    className="h-full"
                    disabled={!enabled}
                  />
                </div>
                <div className="text-xs text-zinc-400 mt-2 font-medium">
                  {band.frequency}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-xs text-zinc-400">
            <strong className="text-zinc-300">Note:</strong> The equalizer settings are simulated and stored locally.
            Actual audio processing depends on browser support and the audio source.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
