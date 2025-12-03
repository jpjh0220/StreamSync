const CACHE_NAME = 'streamsync-v3';
const STATIC_CACHE = 'streamsync-static-v3';
const DYNAMIC_CACHE = 'streamsync-dynamic-v3';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Cache first for static assets, network first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and YouTube/SoundCloud content
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests from caching (always fetch fresh)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/trpc/')) {
    event.respondWith(fetch(request));
    return;
  }

  // For static assets: Cache first, then network
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // For HTML pages: Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page if available
          return caches.match('/');
        });
      })
  );
});

// Handle background sync for offline playback tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-play-count') {
    event.waitUntil(syncPlayCounts());
  }
});

async function syncPlayCounts() {
  // This would sync offline play counts when back online
  console.log('Syncing play counts...');
}

// Handle messages from the client (for background audio control)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'KEEP_ALIVE') {
    // Keep service worker alive for background audio
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[SW] Keeping service worker alive');
      })
    );
  }

  if (event.data && event.data.type === 'AUDIO_PLAYING') {
    // Handle audio playback state
    console.log('[SW] Audio playing state:', event.data.playing);
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic keep-alive ping to prevent service worker from sleeping
let keepAliveInterval;
self.addEventListener('activate', (event) => {
  console.log('[SW] Setting up keep-alive for iOS background audio');

  // Clear any existing interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  // Send periodic message to keep SW active
  keepAliveInterval = setInterval(() => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'SW_KEEP_ALIVE' });
      });
    });
  }, 10000); // Every 10 seconds
});
