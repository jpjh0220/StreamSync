import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  imageUrl: string;
  isPlaying: boolean;
}

export function AnimatedBackground({ imageUrl, isPlaying }: AnimatedBackgroundProps) {
  const [colors, setColors] = useState<string[]>(['#18181b', '#27272a']);

  useEffect(() => {
    const extractColors = async () => {
      try {
        // Create a temporary image element
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        // Convert to a canvas to extract colors
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Resize to small canvas for performance
          canvas.width = 50;
          canvas.height = 50;
          ctx.drawImage(img, 0, 0, 50, 50);

          try {
            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;

            // Sample colors from different regions
            const colorSamples: { r: number; g: number; b: number; count: number }[] = [];

            for (let i = 0; i < data.length; i += 4 * 10) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              // Skip very dark or very light colors and transparent pixels
              if (a < 128 || (r < 20 && g < 20 && b < 20) || (r > 235 && g > 235 && b > 235)) {
                continue;
              }

              // Boost saturation
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const saturation = max === 0 ? 0 : (max - min) / max;

              if (saturation > 0.2) {
                colorSamples.push({ r, g, b, count: 1 });
              }
            }

            if (colorSamples.length >= 2) {
              // Sort by vibrancy (saturation * brightness)
              colorSamples.sort((a, b) => {
                const aVibrancy = (Math.max(a.r, a.g, a.b) - Math.min(a.r, a.g, a.b)) * (a.r + a.g + a.b);
                const bVibrancy = (Math.max(b.r, b.g, b.b) - Math.min(b.r, b.g, b.b)) * (b.r + b.g + b.b);
                return bVibrancy - aVibrancy;
              });

              // Pick 3 most vibrant colors
              const extracted = colorSamples.slice(0, 3).map(c => `rgb(${c.r}, ${c.g}, ${c.b})`);
              setColors(extracted.length >= 2 ? extracted : ['#a855f7', '#ec4899', '#8b5cf6']);
            } else {
              // Fallback to default purple-pink gradient
              setColors(['#a855f7', '#ec4899', '#8b5cf6']);
            }
          } catch (error) {
            // CORS or other error - use default gradient
            console.warn('Could not extract colors from image:', error);
            setColors(['#a855f7', '#ec4899', '#8b5cf6']);
          }
        };

        img.onerror = () => {
          setColors(['#a855f7', '#ec4899', '#8b5cf6']);
        };

        img.src = imageUrl;
      } catch (error) {
        console.warn('Error loading image:', error);
        setColors(['#a855f7', '#ec4899', '#8b5cf6']);
      }
    };

    extractColors();
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient layer */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${colors[0]} 0%, transparent 50%),
                       radial-gradient(circle at 80% 50%, ${colors[1] || colors[0]} 0%, transparent 50%),
                       radial-gradient(circle at 50% 80%, ${colors[2] || colors[1] || colors[0]} 0%, transparent 50%)`,
        }}
      />

      {/* Animated gradient overlay */}
      {isPlaying && (
        <div
          className="absolute inset-0 opacity-10 blur-3xl animate-pulse"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, ${colors[0]}, ${colors[1] || colors[0]}, ${colors[2] || colors[0]}, ${colors[0]})`,
            animation: 'pulse 4s ease-in-out infinite, spin 20s linear infinite',
          }}
        />
      )}

      {/* Dark overlay to maintain readability */}
      <div className="absolute inset-0 bg-zinc-950 opacity-90" />
    </div>
  );
}
