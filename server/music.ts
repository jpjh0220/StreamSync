import { Innertube } from 'youtubei.js';
import SCDL from 'soundcloud-downloader';

let youtube: Innertube | null = null;
let youtubeLastError: Date | null = null;
const YOUTUBE_RETRY_DELAY = 5000; // 5 seconds

/**
 * Get or create YouTube client instance
 */
async function getYouTubeClient() {
  // If there was a recent error, wait before retrying
  if (youtubeLastError && Date.now() - youtubeLastError.getTime() < YOUTUBE_RETRY_DELAY) {
    throw new Error('YouTube service temporarily unavailable. Please try again in a few seconds.');
  }

  try {
    if (!youtube) {
      youtube = await Innertube.create();
      youtubeLastError = null;
    }
    return youtube;
  } catch (error) {
    youtubeLastError = new Date();
    youtube = null; // Reset to allow retry
    throw error;
  }
}

/**
 * Search YouTube for music tracks
 */
export async function searchYouTube(query: string, limit: number = 10) {
  if (!query || query.trim().length === 0) {
    console.warn('Empty search query provided');
    return [];
  }

  try {
    const yt = await getYouTubeClient();
    const search = await yt.search(query.trim(), { type: 'video' });

    if (!search || !search.videos || search.videos.length === 0) {
      console.info('No YouTube results found for query:', query);
      return [];
    }

    const results = search.videos.slice(0, limit).map((video: any) => {
      // Handle both string and object title formats
      const title = typeof video.title === 'string' ? video.title : (video.title?.text || video.title?.toString() || 'Unknown Title');
      const artist = video.author?.name || video.channel?.name || 'Unknown Artist';
      const duration = video.duration?.seconds || 0;
      const thumbnail = video.thumbnails?.[0]?.url || video.best_thumbnail?.url || '';

      return {
        id: video.id,
        title,
        artist,
        duration,
        thumbnail,
        source: 'youtube' as const,
      };
    }).filter(video => video.id && video.title !== 'Unknown Title');

    console.info(`Found ${results.length} YouTube results for query: ${query}`);
    return results;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error('YouTube search error:', {
      query,
      error: errorMessage,
      stack: error?.stack,
    });

    // Return empty array for graceful degradation
    return [];
  }
}

/**
 * Get YouTube video stream URL
 */
export async function getYouTubeStreamUrl(videoId: string) {
  try {
    const yt = await getYouTubeClient();
    const info = await yt.getInfo(videoId);
    
    // Get audio-only format with best quality
    const format = info.chooseFormat({ 
      type: 'audio',
      quality: 'best'
    });

    let url: string;
    
    // Try to get URL directly or decipher if needed
    if (format.url) {
      url = format.url;
    } else if (format.decipher) {
      url = await format.decipher(yt.session.player);
    } else {
      throw new Error('Unable to get stream URL');
    }
    
    return {
      url: url,
      title: info.basic_info.title || '',
      artist: info.basic_info.author || '',
      duration: info.basic_info.duration || 0,
      thumbnail: info.basic_info.thumbnail?.[0]?.url || '',
    };
  } catch (error) {
    console.error('YouTube stream error:', error);
    throw new Error('Failed to get YouTube stream');
  }
}

/**
 * Search SoundCloud for music tracks
 */
export async function searchSoundCloud(query: string, limit: number = 10) {
  if (!query || query.trim().length === 0) {
    console.warn('Empty search query provided');
    return [];
  }

  try {
    const searchUrl = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query.trim())}&limit=${limit}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`SoundCloud API returned status ${response.status} for query: ${query}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.error('SoundCloud rate limit exceeded');
      }

      return [];
    }

    const data = await response.json();

    if (!data || !data.collection || data.collection.length === 0) {
      console.info('No SoundCloud results found for query:', query);
      return [];
    }

    const results = data.collection.map((track: any) => ({
      id: track.id?.toString() || '',
      title: track.title || 'Unknown Title',
      artist: track.user?.username || 'Unknown Artist',
      duration: Math.floor((track.duration || 0) / 1000),
      thumbnail: track.artwork_url || track.user?.avatar_url || '',
      source: 'soundcloud' as const,
    })).filter((track: any) => track.id && track.title !== 'Unknown Title');

    console.info(`Found ${results.length} SoundCloud results for query: ${query}`);
    return results;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('SoundCloud search timed out for query:', query);
    } else {
      const errorMessage = error?.message || 'Unknown error';
      console.error('SoundCloud search error:', {
        query,
        error: errorMessage,
        stack: error?.stack,
      });
    }

    return [];
  }
}

/**
 * Get SoundCloud track stream URL
 */
export async function getSoundCloudStreamUrl(trackId: string) {
  try {
    const info = await SCDL.getInfo(`https://soundcloud.com/track/${trackId}`);
    
    if (!info) {
      throw new Error('Track not found');
    }

    // Get stream URL
    const stream = await SCDL.download(`https://soundcloud.com/track/${trackId}`);
    
    // For SoundCloud, we need to proxy the stream through our server
    // The stream object is a readable stream that we'll handle in the endpoint
    
    return {
      stream,
      title: info.title || '',
      artist: info.user?.username || '',
      duration: Math.floor((info.duration || 0) / 1000),
      thumbnail: info.artwork_url || info.user?.avatar_url || '',
    };
  } catch (error) {
    console.error('SoundCloud stream error:', error);
    throw new Error('Failed to get SoundCloud stream');
  }
}
