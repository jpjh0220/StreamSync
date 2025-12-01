import { useEffect, useRef } from 'react';

interface MiniVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export function MiniVisualizer({ isPlaying, className = '' }: MiniVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const barCount = 20;
    const barWidth = canvas.offsetWidth / barCount;
    const bars = Array.from({ length: barCount }, () => Math.random());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      bars.forEach((height, i) => {
        // Smoothly update bar heights
        const targetHeight = 0.3 + Math.random() * 0.7;
        bars[i] = bars[i] + (targetHeight - bars[i]) * 0.15;

        const barHeight = bars[i] * canvas.offsetHeight;
        const x = i * barWidth;
        const y = (canvas.offsetHeight - barHeight) / 2;

        // Gradient from purple to pink
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  if (!isPlaying) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
