import { useEffect, useRef, useState } from 'react';

interface TrackWaveformProps {
  isPlaying: boolean;
  duration: number;
  className?: string;
}

export function TrackWaveform({ isPlaying, duration, className = '' }: TrackWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now() - (progress * duration * 1000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Generate consistent waveform pattern based on duration
    const barCount = 100;
    const seed = duration; // Use duration as seed for consistency
    const waveform = Array.from({ length: barCount }, (_, i) => {
      // Pseudo-random but consistent pattern
      const x = (Math.sin(i * 0.5 + seed) + Math.cos(i * 0.3)) / 2;
      return 0.3 + Math.abs(x) * 0.7;
    });

    const render = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const barWidth = canvas.offsetWidth / barCount;

      waveform.forEach((height, i) => {
        const barHeight = height * canvas.offsetHeight * 0.8;
        const x = i * barWidth;
        const y = (canvas.offsetHeight - barHeight) / 2;

        // Color based on progress
        const barProgress = i / barCount;
        const isPlayed = barProgress <= progress;

        if (isPlayed) {
          // Gradient for played portion
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(1, '#ec4899');
          ctx.fillStyle = gradient;
        } else {
          // Gray for unplayed portion
          ctx.fillStyle = '#3f3f46';
        }

        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
      });
    };

    const animate = () => {
      if (isPlaying && duration > 0) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);
      }
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration, progress]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
    />
  );
}
