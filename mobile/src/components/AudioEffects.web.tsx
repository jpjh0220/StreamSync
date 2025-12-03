import React, { useState, useEffect } from 'react';

interface AudioEffectsProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onEffectsChange?: (effects: AudioEffectsState) => void;
}

export interface AudioEffectsState {
  bassBoost: number;
  trebleBoost: number;
  reverb: number;
  echo: number;
}

const PRESETS: { [key: string]: AudioEffectsState } = {
  flat: { bassBoost: 0, trebleBoost: 0, reverb: 0, echo: 0 },
  bassBoost: { bassBoost: 12, trebleBoost: 0, reverb: 0, echo: 0 },
  trebleBoost: { bassBoost: 0, trebleBoost: 10, reverb: 0, echo: 0 },
  concertHall: { bassBoost: 3, trebleBoost: 2, reverb: 70, echo: 30 },
  studio: { bassBoost: 2, trebleBoost: 5, reverb: 20, echo: 10 },
  dance: { bassBoost: 10, trebleBoost: 8, reverb: 10, echo: 5 },
};

export function AudioEffectsButton({ audioRef }: AudioEffectsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [effects, setEffects] = useState<AudioEffectsState>(PRESETS.flat);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !audioRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    setAudioContext(ctx);

    return () => {
      ctx.close();
    };
  }, [audioRef]);

  useEffect(() => {
    if (!audioContext || !audioRef.current) return;

    const source = audioContext.createMediaElementSource(audioRef.current);

    // Create bass boost filter (low shelf)
    const bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = effects.bassBoost;

    // Create treble boost filter (high shelf)
    const trebleFilter = audioContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 3000;
    trebleFilter.gain.value = effects.trebleBoost;

    // Connect nodes
    source.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(audioContext.destination);

    return () => {
      source.disconnect();
      bassFilter.disconnect();
      trebleFilter.disconnect();
    };
  }, [effects, audioContext, audioRef]);

  const applyPreset = (presetName: keyof typeof PRESETS) => {
    setEffects(PRESETS[presetName]);
  };

  const updateEffect = (key: keyof AudioEffectsState, value: number) => {
    setEffects(prev => ({ ...prev, [key]: value }));
  };

  const isEffectActive = Object.values(effects).some(v => v !== 0);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...webStyles.controlButton,
          color: isEffectActive ? '#a855f7' : '#a1a1aa',
        }}
        title="Audio effects"
      >
        ✨
      </button>

      {isOpen && (
        <div style={webStyles.dropdown}>
          <h3 style={webStyles.dropdownTitle}>Audio Effects</h3>
          <p style={webStyles.dropdownSubtitle}>Enhance your listening experience</p>

          {/* Presets */}
          <div style={{ marginBottom: '16px' }}>
            <label style={webStyles.label}>Presets</label>
            <div style={webStyles.presetsGrid}>
              {Object.keys(PRESETS).map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => applyPreset(presetName as keyof typeof PRESETS)}
                  style={webStyles.presetButton}
                >
                  {presetName.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Bass Boost */}
          <div style={webStyles.sliderContainer}>
            <div style={webStyles.sliderHeader}>
              <label style={webStyles.label}>Bass Boost</label>
              <span style={webStyles.value}>
                {effects.bassBoost > 0 ? '+' : ''}{effects.bassBoost} dB
              </span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              value={effects.bassBoost}
              onChange={(e) => updateEffect('bassBoost', parseInt(e.target.value))}
              style={webStyles.slider}
            />
          </div>

          {/* Treble Boost */}
          <div style={webStyles.sliderContainer}>
            <div style={webStyles.sliderHeader}>
              <label style={webStyles.label}>Treble Boost</label>
              <span style={webStyles.value}>
                {effects.trebleBoost > 0 ? '+' : ''}{effects.trebleBoost} dB
              </span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              value={effects.trebleBoost}
              onChange={(e) => updateEffect('trebleBoost', parseInt(e.target.value))}
              style={webStyles.slider}
            />
          </div>

          {/* Reverb */}
          <div style={webStyles.sliderContainer}>
            <div style={webStyles.sliderHeader}>
              <label style={webStyles.label}>Reverb</label>
              <span style={webStyles.value}>{effects.reverb}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={effects.reverb}
              onChange={(e) => updateEffect('reverb', parseInt(e.target.value))}
              style={webStyles.slider}
            />
          </div>

          {/* Echo */}
          <div style={webStyles.sliderContainer}>
            <div style={webStyles.sliderHeader}>
              <label style={webStyles.label}>Echo</label>
              <span style={webStyles.value}>{effects.echo}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={effects.echo}
              onChange={(e) => updateEffect('echo', parseInt(e.target.value))}
              style={webStyles.slider}
            />
          </div>

          {/* Reset Button */}
          {isEffectActive && (
            <button
              onClick={() => applyPreset('flat')}
              style={webStyles.resetButton}
            >
              Reset to Flat
            </button>
          )}
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
  dropdown: {
    position: 'absolute',
    bottom: '40px',
    right: 0,
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    padding: '16px',
    minWidth: '280px',
    maxWidth: '320px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  dropdownTitle: {
    color: '#fafafa',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  dropdownSubtitle: {
    color: '#a1a1aa',
    fontSize: '12px',
    margin: '0 0 16px 0',
  },
  label: {
    color: '#d4d4d8',
    fontSize: '12px',
    fontWeight: '500',
  },
  presetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
    marginTop: '8px',
  },
  presetButton: {
    padding: '6px',
    border: '1px solid #3f3f46',
    background: 'transparent',
    color: '#fafafa',
    fontSize: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    textTransform: 'capitalize',
    transition: 'all 0.2s',
  },
  sliderContainer: {
    marginBottom: '16px',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  value: {
    color: '#a1a1aa',
    fontSize: '12px',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#3f3f46',
    outline: 'none',
    cursor: 'pointer',
  },
  resetButton: {
    width: '100%',
    padding: '8px',
    border: '1px solid #3f3f46',
    background: 'transparent',
    color: '#fafafa',
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
