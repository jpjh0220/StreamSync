# StreamSync Music Player

A Progressive Web App (PWA) that allows you to search and stream music from YouTube and SoundCloud. The app can be installed on your mobile device's home screen for a native app-like experience.

## Features

- 🎵 **Multi-Source Search**: Search for music from both YouTube and SoundCloud
- 📱 **PWA Support**: Install on your phone's home screen for offline access
- 🎨 **Modern UI**: Beautiful dark theme with gradient accents
- 🎧 **Audio Controls**: Full playback controls with progress bar, volume control, and seek functionality
- 💾 **Track History**: Save and track your listening history (when authenticated)
- ⭐ **Favorites**: Mark tracks as favorites for quick access
- 📋 **Playlists**: Create and manage custom playlists
- 🔐 **User Authentication**: Sign in to save your preferences and history

## Installation on Mobile

### iOS (iPhone/iPad)

1. Open the app in Safari browser
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. The app icon will appear on your home screen

### Android

1. Open the app in Chrome browser
2. Tap the three-dot menu in the top right
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Add" or "Install" to confirm
5. The app icon will appear on your home screen

## Technology Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- tRPC for type-safe API calls
- Vite for fast development and building

### Backend
- Node.js with Express
- tRPC for API endpoints
- MySQL/TiDB database
- youtubei.js for YouTube integration
- soundcloud-downloader for SoundCloud integration

### PWA Features
- Service Worker for offline caching
- Web App Manifest for installation
- Responsive mobile-first design

## Known Limitations

### YouTube Streaming
YouTube frequently updates their API and implements protections against third-party streaming. While the search functionality works reliably, direct audio streaming may encounter intermittent issues due to:

- YouTube's changing signature algorithms
- Regional restrictions
- Rate limiting
- Content protection measures

**Workaround**: The app provides search functionality that allows you to discover tracks. For the most reliable playback experience, consider using YouTube's official embed player or implementing a proxy server solution.

### SoundCloud Streaming
SoundCloud streaming is implemented but may have similar limitations based on their API policies and rate limits.

## Development

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database

### Setup
```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/music.search.test.ts
```

## Database Schema

The app uses the following main tables:

- **users**: User authentication and profiles
- **tracks**: Music tracks from YouTube/SoundCloud
- **playlists**: User-created playlists
- **playlistTracks**: Junction table for playlist-track relationships

## API Endpoints

### Music Search
- `music.searchYouTube`: Search YouTube for music tracks
- `music.searchSoundCloud`: Search SoundCloud for music tracks
- `music.getYouTubeStream`: Get audio stream URL for YouTube video

### Track Management
- `tracks.list`: Get user's track history
- `tracks.favorites`: Get user's favorite tracks
- `tracks.save`: Save a track to history
- `tracks.toggleFavorite`: Mark/unmark track as favorite
- `tracks.incrementPlayCount`: Update play count

### Playlist Management
- `playlists.list`: Get user's playlists
- `playlists.get`: Get playlist details with tracks
- `playlists.create`: Create new playlist
- `playlists.update`: Update playlist details
- `playlists.delete`: Delete playlist
- `playlists.addTrack`: Add track to playlist
- `playlists.removeTrack`: Remove track from playlist

## Contributing

This is a proof-of-concept application demonstrating PWA capabilities and multi-source music search. Contributions are welcome, especially for:

- Improving YouTube/SoundCloud streaming reliability
- Adding more music sources
- Enhancing offline capabilities
- UI/UX improvements

## Legal Notice

This application is for educational and personal use only. Users are responsible for ensuring their use complies with YouTube's and SoundCloud's Terms of Service. The app does not store or redistribute copyrighted content - it only provides search functionality and links to content hosted on the respective platforms.

## License

MIT License - See LICENSE file for details
