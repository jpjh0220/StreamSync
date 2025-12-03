import React, { useState, useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

type VisualizerType = 'bars' | 'particles' | 'wave';

export function AudioVisualizerButton({ isPlaying }: AudioVisualizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visualizerType, setVisualizerType] = useState<VisualizerType>('bars');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const drawBars = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
      const barCount = 64;
      const barWidth = width / barCount;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        const t = time + i * 0.1;
        const amp = Math.sin(t) * Math.cos(t * 0.5) * 0.5 + 0.5;
        const barHeight = amp * height * 0.8;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#f97316');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 2, height - barHeight, barWidth - 4, barHeight);
      }
    };

    const drawParticles = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
      const particleCount = 100;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 100 + Math.sin(time + i * 0.1) * 50;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        const size = 3 + Math.sin(time * 2 + i) * 2;

        const hue = (time * 50 + i * 3) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawWave = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
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
        const width = canvas.getBoundingClientRect().width;
        const height = canvas.getBoundingClientRect().height;
        ctx.clearRect(0, 0, width, height);
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
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...webStyles.controlButton,
          color: isPlaying ? '#a855f7' : '#a1a1aa',
        }}
        title="Audio Visualizer"
      >
        📊
      </button>

      {isOpen && (
        <div style={webStyles.modal} onClick={() => setIsOpen(false)}>
          <div style={webStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={webStyles.modalHeader}>
              <h2 style={webStyles.modalTitle}>Audio Visualizer</h2>
              <button onClick={() => setIsOpen(false)} style={webStyles.closeButton}>
                ✕
              </button>
            </div>

            <p style={webStyles.modalSubtitle}>
              {isPlaying ? 'Watch the music come alive' : 'Play music to see the visualizer'}
            </p>

            {/* Visualizer Type Selector */}
            <div style={webStyles.typeSelector}>
              {(['bars', 'particles', 'wave'] as VisualizerType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setVisualizerType(type)}
                  style={{
                    ...webStyles.typeButton,
                    ...(visualizerType === type ? webStyles.typeButtonActive : {}),
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Canvas */}
            <div style={webStyles.canvasContainer}>
              <canvas ref={canvasRef} style={webStyles.canvas} />
            </div>

            <p style={webStyles.hint}>
              {visualizerType === 'bars' && 'Frequency bars dancing to the beat'}
              {visualizerType === 'particles' && 'Floating particles in harmony'}
              {visualizerType === 'wave' && 'Sine waves flowing with the rhythm'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const webStyles: { [key: string]: React.CSSProperties } = {
  controlButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalContent: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  modalTitle: {
    color: '#fafafa',
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  closeButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'transparent',
    color: '#a1a1aa',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  modalSubtitle: {
    color: '#a1a1aa',
    fontSize: '14px',
    margin: '0 0 20px 0',
  },
  typeSelector: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  typeButton: {
    flex: 1,
    padding: '8px 16px',
    border: '1px solid #3f3f46',
    background: 'transparent',
    color: '#fafafa',
    fontSize: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  typeButtonActive: {
    background: '#a855f7',
    borderColor: '#a855f7',
  },
  canvasContainer: {
    background: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  canvas: {
    width: '100%',
    height: '320px',
    display: 'block',
  },
  hint: {
    color: '#71717a',
    fontSize: '12px',
    textAlign: 'center',
    margin: 0,
  },
};
