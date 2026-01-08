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

export interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  formats: VideoFormat[];
  audioFormats?: AudioFormat[];
}

export interface VideoFormat {
  quality: string;
  format: string;
  filesize?: string;
}

export interface AudioFormat {
  quality: string;
  format: string;
  filesize?: string;
}

/**
 * Get video information from URL
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
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

    return {
      title: data.title || "Unknown Title",
      duration: "N/A", // oEmbed doesn't provide duration
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      formats: [
        { quality: "2160p", format: "mp4" },
        { quality: "1440p", format: "mp4" },
        { quality: "1080p", format: "mp4" },
        { quality: "720p", format: "mp4" },
        { quality: "480p", format: "mp4" },
        { quality: "360p", format: "mp4" },
      ],
      audioFormats: [
        { quality: "best", format: "mp3" },
        { quality: "best", format: "ogg" },
        { quality: "best", format: "wav" },
      ],
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
