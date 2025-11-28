# StreamSync Music Player TODO

## Database Schema
- [x] Create playlists table
- [x] Create tracks table for history and favorites
- [x] Create playlist tracks junction table

## Backend API
- [x] Install youtubei.js for YouTube streaming
- [x] Install soundcloud-downloader for SoundCloud streaming
- [x] Create search endpoint for YouTube tracks
- [x] Create search endpoint for SoundCloud tracks
- [x] Create stream endpoint to get audio URL
- [x] Create playlist management endpoints (CRUD)
- [x] Create track history endpoints
- [x] Create favorites endpoints

## Music Player UI
- [x] Design modern music player interface
- [x] Implement audio player controls (play, pause, skip, volume)
- [x] Create progress bar with seek functionality
- [x] Build search interface for YouTube and SoundCloud
- [x] Create now playing display with artwork
- [ ] Implement queue/playlist view
- [ ] Add track history view
- [ ] Add favorites management
- [x] Implement responsive mobile-first design

## PWA Features
- [x] Create web app manifest for home screen installation
- [x] Set up service worker for offline capability
- [x] Add app icons for different platforms
- [x] Implement background playback support
- [x] Add caching strategy for track metadata

## Testing & Deployment
- [x] Test YouTube search functionality
- [x] Test SoundCloud search functionality
- [ ] Test playlist management
- [ ] Test PWA installation on mobile devices
- [x] Create checkpoint for deployment

## Bug Fixes & Improvements
- [x] Fix search refetch issue - subsequent searches not working
- [x] Fix YouTube playback issues (with known API limitations)
- [x] Optimize app performance and reduce loading times
- [x] Implement unified search (combine YouTube and SoundCloud results)
- [x] Create proper app layout with navigation
- [x] Remove separate search tabs, make it all-in-one experience

## Critical Bug
- [x] Fix search returning "No results found" - Changed from query to mutation for proper tRPC handling

## Critical Playback Issue
- [x] Implement reliable YouTube playback without restrictions (use iframe embed API)
- [x] Replace direct audio stream with YouTube iframe player
- [x] Ensure playback works on mobile devices

## UI Enhancement
- [x] Display YouTube video player integrated in the app (not hidden)
- [x] Design video player layout that works on mobile and desktop
- [x] Keep custom controls alongside visible video

## Critical Bug
- [x] YouTube iframe API not loading on mobile - switch to embed approach
- [x] Use YouTube embed URL directly in iframe for better mobile compatibility
- [x] Simplify player implementation to work reliably on all devices

## Bugs to Fix
- [x] Favorite button doesn't work - needs to save/remove tracks from favorites
- [ ] Video stops playing when switching between Home and Library tabs - player unmounts
- [x] Implement global player state that persists across navigation
- [x] Add visual feedback for favorited tracks (filled heart icon)
- [ ] Move YouTube iframe to persistent global component outside page routing
