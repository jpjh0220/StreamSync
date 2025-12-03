import { registerRootComponent } from 'expo';
import App from './App';

// Web doesn't need TrackPlayer service registration
// HTML5 Audio is used instead

// Register Service Worker for PWA and background audio support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker registered successfully:', registration.scope);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[App] New service worker available, reload to update');
                // Optionally notify user about update
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[App] Service Worker registration failed:', error);
      });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_KEEP_ALIVE') {
        // Service worker is alive, respond to keep it active
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'KEEP_ALIVE',
            timestamp: Date.now()
          });
        }
      }
    });
  });
}

registerRootComponent(App);
