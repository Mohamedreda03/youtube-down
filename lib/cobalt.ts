/**
 * Cobalt API Client for downloading videos
 * Free service that supports YouTube, Instagram, TikTok, Twitter and more
 * Docs: https://github.com/imputnet/cobalt
 */

const COBALT_API_URL = "https://api.cobalt.tools/api/json";

export interface CobaltVideoInfo {
  status: "success" | "error" | "rate-limit";
  url?: string;
  pickerType?: "various" | "images";
  picker?: Array<{
    type: "video" | "audio" | "photo";
    url: string;
    thumb?: string;
  }>;
  audio?: string;
  text?: string;
}

// Import from youtube.ts to match existing interfaces
import type { VideoFormat, AudioFormat, VideoMetadata } from "./youtube";

/**
 * Get video information from URL
 */
export async function getVideoInfo(url: string): Promise<VideoMetadata> {
  try {
    // For YouTube, we can get basic info from the URL
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Use YouTube oEmbed API for basic info (no bot detection)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch video info");
    }

    const data = await response.json();

    // Standard qualities available through Cobalt
    const videoFormats: VideoFormat[] = [
      {
        formatId: "2160",
        ext: "mp4",
        resolution: "2160p",
        quality: "2160p",
        hasAudio: true,
        hasVideo: true,
        vcodec: "h264",
        acodec: "aac",
      },
      {
        formatId: "1440",
        ext: "mp4",
        resolution: "1440p",
        quality: "1440p",
        hasAudio: true,
        hasVideo: true,
        vcodec: "h264",
        acodec: "aac",
      },
      {
        formatId: "1080",
        ext: "mp4",
        resolution: "1080p",
        quality: "1080p",
        hasAudio: true,
        hasVideo: true,
        vcodec: "h264",
        acodec: "aac",
      },
      {
        formatId: "720",
        ext: "mp4",
        resolution: "720p",
        quality: "720p",
        hasAudio: true,
        hasVideo: true,
        vcodec: "h264",
        acodec: "aac",
      },
      {
        formatId: "480",
        ext: "mp4",
        resolution: "480p",
        quality: "480p",
        hasAudio: true,
        hasVideo: true,
        vcodec: "h264",
        acodec: "aac",
      },
      {
        formatId: "360",
        ext: "mp4",
        resolution: "360p",
        quality: "360p",
        hasAudio: true,
        hasVideo: true,
        vcodec: "h264",
        acodec: "aac",
      },
    ];

    const audioFormats: AudioFormat[] = [
      {
        formatId: "mp3-best",
        ext: "mp3",
        quality: "best",
        acodec: "mp3",
        abr: 320,
      },
      {
        formatId: "ogg-best",
        ext: "ogg",
        quality: "best",
        acodec: "opus",
      },
      {
        formatId: "wav-best",
        ext: "wav",
        quality: "best",
        acodec: "pcm",
      },
    ];

    return {
      id: videoId,
      title: data.title || "Unknown Title",
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0, // oEmbed doesn't provide duration
      durationFormatted: "N/A",
      channel: data.author_name || "Unknown Channel",
      channelUrl: data.author_url,
      formats: videoFormats,
      audioFormats: audioFormats,
    };
  } catch (error) {
    console.error("[Cobalt] Error fetching video info:", error);
    throw error;
  }
}

/**
 * Download video using Cobalt API
 */
export async function downloadVideo(
  url: string,
  quality: string = "1080"
): Promise<string> {
  try {
    const response = await fetch(COBALT_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        vCodec: "h264",
        vQuality: quality,
        aFormat: "mp3",
        isAudioOnly: false,
        filenamePattern: "basic",
        downloadMode: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error(`Cobalt API error: ${response.statusText}`);
    }

    const data: CobaltVideoInfo = await response.json();

    if (data.status === "error") {
      throw new Error(data.text || "Failed to process video");
    }

    if (data.status === "rate-limit") {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // If picker is returned (multiple qualities), return the first video
    if (data.picker && data.picker.length > 0) {
      const videoItem = data.picker.find((item) => item.type === "video");
      if (videoItem) {
        return videoItem.url;
      }
    }

    // Direct URL
    if (data.url) {
      return data.url;
    }

    throw new Error("No download URL found");
  } catch (error) {
    console.error("[Cobalt] Download error:", error);
    throw error;
  }
}

/**
 * Download audio using Cobalt API
 */
export async function downloadAudio(
  url: string,
  format: string = "mp3"
): Promise<string> {
  try {
    const response = await fetch(COBALT_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        isAudioOnly: true,
        aFormat: format,
        filenamePattern: "basic",
        downloadMode: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error(`Cobalt API error: ${response.statusText}`);
    }

    const data: CobaltVideoInfo = await response.json();

    if (data.status === "error") {
      throw new Error(data.text || "Failed to process audio");
    }

    if (data.status === "rate-limit") {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // Audio URL
    if (data.url) {
      return data.url;
    }

    throw new Error("No download URL found");
  } catch (error) {
    console.error("[Cobalt] Audio download error:", error);
    throw error;
  }
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
