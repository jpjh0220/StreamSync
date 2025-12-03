# StreamSync Mobile (React Native)

Native mobile app for StreamSync with true background audio playback using React Native + Expo.

## Features

- ✅ **True Native Background Playback** - Music continues playing when app is in background
- ✅ **Lock Screen Controls** - Full media controls on lock screen (play/pause/skip/seek)
- ✅ **YouTube Audio Streaming** - Direct audio extraction from YouTube
- ✅ **Queue Management** - Add tracks, manage queue, repeat modes
- ✅ **Favorites & History** - Save your favorite tracks and view play history
- ✅ **Cross-Platform** - Works on iOS, Android, **and Web** 🌐
- ✅ **React Native Web** - Same codebase runs on web using HTML5 Audio

## Tech Stack

- **React Native** with **Expo**
- **react-native-track-player** - Native audio playback with background support
- **React Navigation** - Bottom tab navigation
- **AsyncStorage** - Local data persistence
- **Axios** - API communication with backend

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

```bash
cd mobile
npm install
```

### Configuration

1. **Update API URL** in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api';
   ```
   - For development, use your local IP (not localhost)
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `http://192.168.1.100:3000/api`

2. **Start the backend server** (in main project):
   ```bash
   cd ..
   npm run dev
   ```

### Running the App

#### Development Mode

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on Web (uses HTML5 Audio instead of native)
npm run web

# Export static web build
npm run export:web
```

**Web Platform Notes:**
- Uses React Native Web to run the same code in browser
- Audio playback uses HTML5 `<audio>` element instead of react-native-track-player
- Platform-specific files (`.web.ts`) provide web implementations
- All features work on web, but background audio is browser-limited

#### Testing on Physical Device

1. Install **Expo Go** app on your phone
2. Run `npm start`
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## Building for Production

### Android APK

```bash
# Build APK
eas build --platform android --profile preview

# Or local build
npm run export:android
```

### iOS IPA

```bash
# Build IPA (requires Apple Developer account)
eas build --platform ios --profile preview
```

## Project Structure

```
mobile/
├── src/
│   ├── contexts/
│   │   └── PlayerContext.tsx      # Global player state management
│   ├── screens/
│   │   ├── SearchScreen.tsx        # Search for music
│   │   └── LibraryScreen.tsx       # Favorites & history
│   ├── components/
│   │   └── GlobalPlayer.tsx        # Bottom player UI
│   ├── services/
│   │   ├── api.ts                  # Backend API calls
│   │   ├── audioPlayer.ts          # Track player wrapper
│   │   └── playbackService.ts      # Background audio service
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── theme/
│       └── colors.ts               # App colors
├── App.tsx                         # Main entry point
├── index.ts                        # App registration
└── app.json                        # Expo configuration
```

## Key Components

### PlayerContext
Global state management for:
- Current track and playback state
- Queue management
- Favorites and history
- Repeat/shuffle modes

### AudioPlayer Service
Wrapper around react-native-track-player:
- Track loading with YouTube stream URLs
- Playback controls (play/pause/skip)
- Queue operations
- Background audio configuration

### Playback Service
Background service that handles:
- Remote controls (lock screen, headphones, car)
- Playback events
- Queue completion

## Background Audio

The app uses `react-native-track-player` which provides:
- **iOS**: Native AVFoundation audio with background modes
- **Android**: Foreground service with MediaSession controls
- **Lock Screen**: Full native media controls with artwork

## API Integration

The mobile app communicates with the existing StreamSync backend:
- Search YouTube via `/api/music/searchYouTube`
- Get audio stream via `/api/music/getYouTubeStream`
- Manage favorites via `/api/tracks/*`
- Manage playlists via `/api/playlists/*`

## Troubleshooting

### Audio Not Playing
- Check if backend server is running
- Verify API_BASE_URL points to correct IP
- Check network connectivity
- Look at server logs for YouTube extraction errors

### Background Audio Not Working
- iOS: Ensure app.json has `UIBackgroundModes: ["audio"]`
- Android: Check FOREGROUND_SERVICE permission
- Rebuild app after configuration changes

### Cannot Connect to Server
- Use local IP address, not localhost
- Ensure phone and computer are on same WiFi network
- Check firewall settings
- Test API URL in browser first

## Next Steps

To enhance the app:
- Add SoundCloud support
- Implement playlists screen
- Add search filters
- Create full-screen player view
- Add audio visualizer
- Implement offline mode
- Add lyrics support

## License

Same as main StreamSync project
