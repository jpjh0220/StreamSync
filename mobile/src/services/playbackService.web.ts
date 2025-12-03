// Web implementation (no-op since web doesn't need background service)
// This file is used when running on web (playbackService.web.ts)

export const playbackService = async () => {
  // No-op for web - background audio is handled by HTML5 Audio
  console.log('[Web] Playback service not needed on web');
};
