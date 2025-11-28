import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onToggleMute?: () => void;
  onSearch?: () => void;
}

/**
 * Custom hook for keyboard shortcuts
 *
 * Keyboard shortcuts:
 * - Space: Play/Pause
 * - ArrowRight: Next track
 * - ArrowLeft: Previous track
 * - ArrowUp: Volume up
 * - ArrowDown: Volume down
 * - M: Toggle mute
 * - /: Focus search
 */
export function useKeyboardShortcuts(options: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow '/' to focus search even in input fields
        if (e.key !== '/') {
          return;
        }
      }

      switch (e.key) {
        case ' ':
          // Space bar - Play/Pause
          e.preventDefault();
          options.onPlayPause?.();
          break;

        case 'ArrowRight':
          // Right arrow - Next track
          e.preventDefault();
          options.onNext?.();
          break;

        case 'ArrowLeft':
          // Left arrow - Previous track
          e.preventDefault();
          options.onPrevious?.();
          break;

        case 'ArrowUp':
          // Up arrow - Volume up
          e.preventDefault();
          options.onVolumeUp?.();
          break;

        case 'ArrowDown':
          // Down arrow - Volume down
          e.preventDefault();
          options.onVolumeDown?.();
          break;

        case 'm':
        case 'M':
          // M - Toggle mute
          e.preventDefault();
          options.onToggleMute?.();
          break;

        case '/':
          // / - Focus search
          e.preventDefault();
          options.onSearch?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options]);
}
