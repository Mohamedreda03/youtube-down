/**
 * YouTube Innertube API Client
 * Direct API access without bot detection
 */

import type { VideoFormat, AudioFormat, VideoMetadata } from "./youtube";

const INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const INNERTUBE_CLIENT_VERSION = "2.20240105.01.00";

interface InnertubeFormat {
  itag: number;
  url: string;
  mimeType: string;
  qualityLabel?: string;
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
  contentLength?: string;
  audioQuality?: string;
  audioSampleRate?: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
}

interface InnertubeResponse {
  videoDetails: {
    videoId: string;
    title: string;
    lengthSeconds: string;
    channelId: string;
    author: string;
    thumbnail: {
      thumbnails: Array<{ url: string; width: number; height: number }>;
    };
    viewCount?: string;
    shortDescription?: string;
  };
  streamingData: {
    formats: InnertubeFormat[];
    adaptiveFormats: InnertubeFormat[];
  };
}

/**
 * Get video information using YouTube Innertube API
 */
export async function getYouTubeVideoInfo(
  videoId: string
): Promise<VideoMetadata> {
  try {
    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: INNERTUBE_CLIENT_VERSION,
              hl: "en",
              gl: "US",
            },
          },
          videoId: videoId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video info from YouTube");
    }

    const data: InnertubeResponse = await response.json();

    if (!data.videoDetails) {
      throw new Error("Video not found or unavailable");
    }

    // Process formats
    const allFormats = [
      ...(data.streamingData?.formats || []),
      ...(data.streamingData?.adaptiveFormats || []),
    ];

    // Extract video formats (with video stream)
    const videoFormats: VideoFormat[] = allFormats
      .filter((f) => f.qualityLabel && f.mimeType?.includes("video"))
      .map((f) => {
        const resolution = f.qualityLabel || `${f.height}p`;
        const hasAudio = f.mimeType?.includes("audio") || false;
        
        return {
          formatId: f.itag.toString(),
          ext: "mp4",
          resolution: resolution,
          quality: resolution,
          filesize: f.contentLength ? parseInt(f.contentLength) : undefined,
          vcodec: f.mimeType?.includes("avc1") ? "h264" : "vp9",
          acodec: hasAudio ? "aac" : undefined,
          fps: f.fps,
          hasAudio: hasAudio,
          hasVideo: true,
        };
      })
      // Remove duplicates and sort by quality
      .filter(
        (format, index, self) =>
          index === self.findIndex((f) => f.resolution === format.resolution)
      )
      .sort((a, b) => {
        const aRes = parseInt(a.resolution);
        const bRes = parseInt(b.resolution);
        return bRes - aRes; // Descending order
      });

    // Extract audio formats
    const audioFormats: AudioFormat[] = allFormats
      .filter((f) => f.mimeType?.includes("audio"))
      .slice(0, 3) // Take top 3 audio formats
      .map((f, index) => ({
        formatId: f.itag.toString(),
        ext: f.mimeType?.includes("mp4") ? "m4a" : "webm",
        quality: f.audioQuality || "medium",
        acodec: f.mimeType?.includes("opus") ? "opus" : "aac",
        filesize: f.contentLength ? parseInt(f.contentLength) : undefined,
        abr: f.bitrate ? Math.round(f.bitrate / 1000) : undefined,
      }));

    const thumbnail =
      data.videoDetails.thumbnail.thumbnails.slice(-1)[0]?.url ||
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const duration = parseInt(data.videoDetails.lengthSeconds);
    const durationFormatted = formatDuration(duration);

    return {
      id: videoId,
      title: data.videoDetails.title,
      thumbnail: thumbnail,
      duration: duration,
      durationFormatted: durationFormatted,
      channel: data.videoDetails.author,
      channelUrl: `https://www.youtube.com/channel/${data.videoDetails.channelId}`,
      viewCount: data.videoDetails.viewCount
        ? parseInt(data.videoDetails.viewCount)
        : undefined,
      description: data.videoDetails.shortDescription,
      formats: videoFormats,
      audioFormats: audioFormats,
    };
  } catch (error) {
    console.error("[YouTube API] Error fetching video info:", error);
    throw error;
  }
}

/**
 * Format duration from seconds to human readable format
 */
function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
