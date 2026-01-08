/**
 * yt-dlp wrapper for extracting video metadata and downloading
 *
 * Prerequisites:
 * - yt-dlp must be installed and available in PATH
 * - FFmpeg must be installed and available in PATH
 *
 * Install yt-dlp:
 * - Windows: winget install yt-dlp or download from https://github.com/yt-dlp/yt-dlp/releases
 * - macOS: brew install yt-dlp
 * - Linux: pip install yt-dlp
 *
 * Install FFmpeg:
 * - Windows: winget install ffmpeg
 * - macOS: brew install ffmpeg
 * - Linux: apt install ffmpeg
 */

import { spawn, ChildProcess } from "child_process";
import {
  VideoMetadata,
  VideoFormat,
  AudioFormat,
  formatDuration,
  sanitizeFilename,
} from "./youtube";

// yt-dlp binary path (can be configured via environment variable)
const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";

/**
 * Raw format data from yt-dlp
 */
interface RawFormat {
  format_id: string;
  ext: string;
  resolution?: string;
  width?: number;
  height?: number;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  fps?: number;
  abr?: number;
  tbr?: number;
  vbr?: number;
  format_note?: string;
}

/**
 * Estimate file size based on bitrate and duration
 * Returns size in bytes
 */
function estimateFileSize(
  format: RawFormat,
  durationSeconds: number
): number | undefined {
  // If we have actual filesize, use it
  if (format.filesize && format.filesize > 0) return format.filesize;
  if (format.filesize_approx && format.filesize_approx > 0)
    return format.filesize_approx;

  // Estimate based on bitrate (tbr = total bitrate, vbr = video bitrate, abr = audio bitrate)
  const bitrate = format.tbr || format.vbr || format.abr || 0;
  if (bitrate > 0 && durationSeconds > 0) {
    // bitrate is in kbps, convert to bytes: (kbps * 1000 / 8) * seconds
    return Math.round(((bitrate * 1000) / 8) * durationSeconds);
  }

  // Estimate based on resolution if no bitrate info
  if (format.height && durationSeconds > 0) {
    const bitrateEstimates: Record<number, number> = {
      2160: 20000, // 4K ~20 Mbps
      1440: 10000, // 1440p ~10 Mbps
      1080: 5000, // 1080p ~5 Mbps
      720: 2500, // 720p ~2.5 Mbps
      480: 1500, // 480p ~1.5 Mbps
      360: 800, // 360p ~800 kbps
      240: 400, // 240p ~400 kbps
      144: 200, // 144p ~200 kbps
    };
    const estimatedBitrate = bitrateEstimates[format.height] || 1000;
    return Math.round(((estimatedBitrate * 1000) / 8) * durationSeconds);
  }

  return undefined;
}

/**
 * Raw metadata from yt-dlp
 */
interface RawMetadata {
  id: string;
  title: string;
  thumbnail?: string;
  thumbnails?: Array<{ url: string; width?: number; height?: number }>;
  duration?: number;
  channel?: string;
  uploader?: string;
  channel_url?: string;
  uploader_url?: string;
  view_count?: number;
  upload_date?: string;
  description?: string;
  formats?: RawFormat[];
}

/**
 * Execute yt-dlp command and return output
 */
function executeYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // Add common options to bypass bot detection
    const commonArgs = [
      '--extractor-args', 'youtube:player_client=android',
      '--user-agent', 'com.google.android.youtube/17.36.4 (Linux; U; Android 12; GB) gzip',
      ...args
    ];
    
    const process = spawn(YTDLP_PATH, commonArgs, {
      timeout: 60000, // 60 second timeout
    });

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });

    process.on("error", (err) => {
      reject(new Error(`Failed to execute yt-dlp: ${err.message}`));
    });
  });
}

/**
 * Get video metadata using yt-dlp
 *
 * Example yt-dlp command:
 * yt-dlp -j --no-download "https://www.youtube.com/watch?v=VIDEO_ID"
 */
export async function getVideoMetadata(url: string): Promise<VideoMetadata> {
  try {
    // Use -j flag to get JSON output, --no-download to skip downloading
    const output = await executeYtDlp([
      "-j",
      "--no-download",
      "--no-warnings",
      "--no-playlist",
      url,
    ]);

    const raw: RawMetadata = JSON.parse(output);
    const duration = raw.duration || 0;

    // Parse video formats (with video stream)
    const videoFormats: VideoFormat[] = [];
    const audioFormats: AudioFormat[] = [];
    const seenResolutions = new Map<string, VideoFormat>();
    const seenAudioQualities = new Set<string>();

    if (raw.formats) {
      for (const format of raw.formats) {
        const hasVideo = format.vcodec && format.vcodec !== "none";
        const hasAudio = format.acodec && format.acodec !== "none";

        // Video formats
        if (hasVideo && format.height) {
          const resolution = `${format.height}p`;
          const estimatedSize = estimateFileSize(format, duration);

          // Keep the format with the best size info for each resolution
          const existing = seenResolutions.get(resolution);
          if (
            !existing ||
            (estimatedSize &&
              (!existing.filesize || estimatedSize > existing.filesize))
          ) {
            seenResolutions.set(resolution, {
              formatId: format.format_id,
              ext: format.ext,
              resolution,
              filesize: estimatedSize,
              vcodec: format.vcodec,
              acodec: hasAudio ? format.acodec : undefined,
              fps: format.fps,
              quality: format.format_note || resolution,
              hasAudio: !!hasAudio,
              hasVideo: true,
            });
          }
        }

        // Audio-only formats
        if (hasAudio && !hasVideo) {
          const abr = format.abr || format.tbr || 0;
          const qualityKey = `${format.ext}-${Math.round(abr / 32) * 32}`;
          const estimatedSize = estimateFileSize(format, duration);

          if (!seenAudioQualities.has(qualityKey) && abr > 0) {
            seenAudioQualities.add(qualityKey);
            audioFormats.push({
              formatId: format.format_id,
              ext: format.ext,
              abr: Math.round(abr),
              acodec: format.acodec,
              filesize: estimatedSize,
              quality: `${Math.round(abr)}kbps`,
            });
          }
        }
      }
    }

    // Convert Map to array
    videoFormats.push(...seenResolutions.values());

    // Sort video formats by resolution (highest first)
    videoFormats.sort((a, b) => {
      const aHeight = parseInt(a.resolution) || 0;
      const bHeight = parseInt(b.resolution) || 0;
      return bHeight - aHeight;
    });

    // Sort audio formats by bitrate (highest first)
    audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));

    // Get best thumbnail
    let thumbnail = raw.thumbnail || "";
    if (!thumbnail && raw.thumbnails && raw.thumbnails.length > 0) {
      // Get highest resolution thumbnail
      const sorted = [...raw.thumbnails].sort(
        (a, b) =>
          (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
      );
      thumbnail = sorted[0]?.url || "";
    }

    return {
      id: raw.id,
      title: raw.title,
      thumbnail,
      duration: raw.duration || 0,
      durationFormatted: formatDuration(raw.duration || 0),
      channel: raw.channel || raw.uploader || "Unknown",
      channelUrl: raw.channel_url || raw.uploader_url,
      viewCount: raw.view_count,
      uploadDate: raw.upload_date,
      description: raw.description,
      formats: videoFormats,
      audioFormats,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to fetch video info: ${error.message}`
        : "Failed to fetch video info"
    );
  }
}

/**
 * Download video stream with yt-dlp
 * Returns a ChildProcess that can be piped to response
 *
 * Example yt-dlp command for video:
 * yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" --merge-output-format mp4 -o - "URL"
 *
 * Example for specific format:
 * yt-dlp -f FORMAT_ID+bestaudio --merge-output-format mp4 -o - "URL"
 */
export function downloadVideo(
  url: string,
  formatId: string,
  needsAudioMerge: boolean = true
): ChildProcess {
  const args: string[] = [
    "--no-warnings",
    "--no-playlist",
    "-o",
    "-", // Output to stdout
  ];

  if (needsAudioMerge) {
    // Merge with best audio and output as mp4
    args.push("-f", `${formatId}+bestaudio/best`);
    args.push("--merge-output-format", "mp4");
  } else {
    // Format already has audio
    args.push("-f", formatId);
  }

  args.push(url);

  return spawn(YTDLP_PATH, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * Download audio-only with yt-dlp
 *
 * Example yt-dlp command for audio:
 * yt-dlp -x --audio-format mp3 --audio-quality 0 -o - "URL"
 *
 * Audio quality options:
 * 0 = best, 5 = medium, 9 = worst
 */
export function downloadAudio(
  url: string,
  format: "mp3" | "m4a" = "mp3",
  quality: "best" | "medium" | "low" = "best"
): ChildProcess {
  // Map quality to yt-dlp audio quality (0-9, 0 is best)
  const qualityMap = {
    best: "0",
    medium: "5",
    low: "9",
  };

  const args: string[] = [
    "--no-warnings",
    "--no-playlist",
    "-x", // Extract audio
    "--audio-format",
    format,
    "--audio-quality",
    qualityMap[quality],
    "-o",
    "-", // Output to stdout
    url,
  ];

  return spawn(YTDLP_PATH, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * Get safe filename for download
 */
export function getSafeFilename(title: string, ext: string): string {
  return `${sanitizeFilename(title)}.${ext}`;
}

/**
 * Check if yt-dlp is installed
 */
export async function checkYtDlpInstalled(): Promise<boolean> {
  try {
    await executeYtDlp(["--version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if FFmpeg is installed
 */
export async function checkFfmpegInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn(FFMPEG_PATH, ["-version"]);
    process.on("close", (code) => resolve(code === 0));
    process.on("error", () => resolve(false));
  });
}
