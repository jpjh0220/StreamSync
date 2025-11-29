import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Waves, Sparkles } from "lucide-react";
import { Card } from "./ui/card";

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export function AudioVisualizer({ isPlaying }: AudioVisualizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visualizerType, setVisualizerType] = useState<'bars' | 'particles' | 'wave'>('bars');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const drawBars = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const barCount = 64;
      const barWidth = width / barCount;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        // Simulate frequency data with sine waves
        const t = time + i * 0.1;
        const amp = Math.sin(t) * Math.cos(t * 0.5) * 0.5 + 0.5;
        const barHeight = amp * height * 0.8;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#a855f7'); // purple-500
        gradient.addColorStop(0.5, '#ec4899'); // pink-500
        gradient.addColorStop(1, '#f97316'); // orange-500

        ctx.fillStyle = gradient;
        ctx.fillRect(
          i * barWidth + 2,
          height - barHeight,
          barWidth - 4,
          barHeight
        );
      }
    };

    const drawParticles = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const particleCount = 100;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 100 + Math.sin(time + i * 0.1) * 50;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        const size = 3 + Math.sin(time * 2 + i) * 2;

        // Color gradient
        const hue = (time * 50 + i * 3) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawWave = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const waveCount = 5;

      ctx.clearRect(0, 0, width, height);

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        const alpha = 0.6 - w * 0.1;
        const offset = w * 30;
        const color = w % 2 === 0 ? `rgba(168, 85, 247, ${alpha})` : `rgba(236, 72, 153, ${alpha})`;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        for (let x = 0; x < width; x += 5) {
          const y = height / 2 + Math.sin((x + time * 100 + offset) * 0.02) * 50 * (1 + w * 0.2);
          ctx.lineTo(x, y);
        }

        ctx.stroke();
      }
    };

    const animate = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        return;
      }

      if (visualizerType === 'bars') {
        drawBars();
      } else if (visualizerType === 'particles') {
        drawParticles();
      } else if (visualizerType === 'wave') {
        drawWave();
      }

      time += 0.05;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, isPlaying, visualizerType]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Audio Visualizer"
        >
          <Waves className={`w-4 h-4 ${isPlaying ? 'text-purple-400 animate-pulse' : 'text-zinc-400'}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Audio Visualizer
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {isPlaying ? "Watch the music come alive" : "Play music to see the visualizer"}
          </DialogDescription>
        </DialogHeader>

        {/* Visualizer Type Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={visualizerType === 'bars' ? 'default' : 'outline'}
            onClick={() => setVisualizerType('bars')}
            className={visualizerType === 'bars' ? 'bg-purple-600 hover:bg-purple-700' : 'border-zinc-700 hover:bg-zinc-800'}
          >
            Bars
          </Button>
          <Button
            size="sm"
            variant={visualizerType === 'particles' ? 'default' : 'outline'}
            onClick={() => setVisualizerType('particles')}
            className={visualizerType === 'particles' ? 'bg-purple-600 hover:bg-purple-700' : 'border-zinc-700 hover:bg-zinc-800'}
          >
            Particles
          </Button>
          <Button
            size="sm"
            variant={visualizerType === 'wave' ? 'default' : 'outline'}
            onClick={() => setVisualizerType('wave')}
            className={visualizerType === 'wave' ? 'bg-purple-600 hover:bg-purple-700' : 'border-zinc-700 hover:bg-zinc-800'}
          >
            Wave
          </Button>
        </div>

        {/* Canvas */}
        <Card className="bg-black border-zinc-800 p-0 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-80"
            style={{ display: 'block' }}
          />
        </Card>

        <p className="text-xs text-zinc-500 text-center">
          {visualizerType === 'bars' && "Frequency bars dancing to the beat"}
          {visualizerType === 'particles' && "Floating particles in harmony"}
          {visualizerType === 'wave' && "Sine waves flowing with the rhythm"}
        </p>
      </DialogContent>
    </Dialog>
  );
}
