/**
 * Cobalt API Client for downloading videos
 * Free service that supports YouTube, Instagram, TikTok, Twitter and more
 * Docs: https://github.com/imputnet/cobalt
 */

// Import from youtube.ts to match existing interfaces
import type { VideoFormat, AudioFormat, VideoMetadata } from "./youtube";
import { getYouTubeVideoInfo } from "./youtube-api";
import { extractVideoId } from "./youtube";

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

/**
 * Get video information from URL
 * Uses YouTube Innertube API for detailed info with real file sizes and available qualities
 */
export async function getVideoInfo(url: string): Promise<VideoMetadata> {
  try {
    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Use YouTube Innertube API for detailed info
    return await getYouTubeVideoInfo(videoId);
  } catch (error) {
    console.error("[Cobalt] Error fetching video info:", error);
    throw error;
  }
}

/**
 * Download video using Cobalt API
 * formatId from YouTube API (itag) needs to be converted to quality for Cobalt
 */
export async function downloadVideo(
  url: string,
  formatId: string = "1080"
): Promise<string> {
  try {
    // Convert formatId to quality string for Cobalt
    // Common itags: 22=720p, 18=360p, 137=1080p, etc.
    // For simplicity, use formatId as quality if it's already a number like "1080", "720"
    let quality = formatId;
    
    // If formatId is an itag (3-digit number), map to quality
    const itagToQuality: Record<string, string> = {
      "22": "720",
      "18": "360",
      "137": "1080",
      "136": "720",
      "298": "720",
      "299": "1080",
    };
    
    if (itagToQuality[formatId]) {
      quality = itagToQuality[formatId];
    }

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
      const errorText = await response.text();
      console.error("[Cobalt] API Error:", errorText);
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
