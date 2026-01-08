/**
 * YouTube URL validation and utility functions
 */

// Regex patterns for YouTube URLs
const YOUTUBE_PATTERNS = [
  /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /^(https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
];

/**
 * Validates if a string is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmedUrl = url.trim();
  return YOUTUBE_PATTERNS.some((pattern) => pattern.test(trimmedUrl));
}

/**
 * Extracts video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmedUrl = url.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      // The video ID is in the last capture group
      return match[match.length - 1] || null;
    }
  }

  return null;
}

/**
 * Sanitizes a filename to be safe for filesystem
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, "") // Remove invalid characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 200); // Limit length
}

/**
 * Formats duration from seconds to human readable format
 */
export function formatDuration(seconds: number): string {
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

/**
 * Format file size from bytes to human readable
 */
export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || isNaN(bytes)) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Video format interface
export interface VideoFormat {
  formatId: string;
  ext: string;
  resolution: string;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  fps?: number;
  quality: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

// Audio format interface
export interface AudioFormat {
  formatId: string;
  ext: string;
  abr?: number; // audio bitrate
  acodec?: string;
  filesize?: number;
  quality: string;
}

// Video metadata interface
export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
  channel: string;
  channelUrl?: string;
  viewCount?: number;
  uploadDate?: string;
  description?: string;
  formats: VideoFormat[];
  audioFormats: AudioFormat[];
}
