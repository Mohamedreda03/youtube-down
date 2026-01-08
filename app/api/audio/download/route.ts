/**
 * Audio Download API Route
 * GET /api/audio/download
 *
 * Downloads audio using yt-dlp with FFmpeg conversion
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidYouTubeUrl, sanitizeFilename } from "@/lib/youtube";
import { downloadAudio } from "@/lib/ytdlp";
import { checkAllLimits, startDownload, endDownload } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Allowed formats and qualities
const ALLOWED_FORMATS = ["mp3", "m4a"] as const;
const ALLOWED_QUALITIES = ["best", "medium", "low"] as const;

type AudioFormat = (typeof ALLOWED_FORMATS)[number];
type AudioQuality = (typeof ALLOWED_QUALITIES)[number];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const format = searchParams.get("format") as AudioFormat | null;
  const quality = searchParams.get("quality") as AudioQuality | null;
  const title = searchParams.get("title") || "audio";

  // Rate limiting with download check
  const rateLimit = checkAllLimits(request, true);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  // Validate inputs
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!isValidYouTubeUrl(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  // Validate format
  const audioFormat: AudioFormat =
    format && ALLOWED_FORMATS.includes(format) ? format : "mp3";

  // Validate quality
  const audioQuality: AudioQuality =
    quality && ALLOWED_QUALITIES.includes(quality) ? quality : "best";

  // Sanitize URL to prevent command injection
  const sanitizedUrl = url.trim().replace(/[;&|`$(){}[\]<>]/g, "");

  // Track concurrent downloads
  startDownload(rateLimit.ip);

  try {
    // Start audio download process
    const ytdlpProcess = downloadAudio(sanitizedUrl, audioFormat, audioQuality);

    // Create filename
    const filename = `${sanitizeFilename(title)}.${audioFormat}`;

    // MIME types for audio formats
    const mimeTypes: Record<AudioFormat, string> = {
      mp3: "audio/mpeg",
      m4a: "audio/mp4",
    };

    // Track if stream is closed to prevent double-close
    let isClosed = false;
    let downloadEnded = false;

    const cleanup = () => {
      if (!downloadEnded) {
        downloadEnded = true;
        endDownload(rateLimit.ip);
      }
    };

    // Create readable stream from process stdout
    const stream = new ReadableStream({
      start(controller) {
        if (!ytdlpProcess.stdout) {
          controller.close();
          cleanup();
          return;
        }

        ytdlpProcess.stdout.on("data", (chunk: Buffer) => {
          if (!isClosed) {
            try {
              controller.enqueue(new Uint8Array(chunk));
            } catch {
              // Controller might be closed
              isClosed = true;
            }
          }
        });

        ytdlpProcess.stdout.on("end", () => {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch {
              // Already closed
            }
          }
          cleanup();
        });

        ytdlpProcess.stdout.on("error", (err: Error) => {
          console.error("Stream error:", err);
          if (!isClosed) {
            isClosed = true;
            try {
              controller.error(err);
            } catch {
              // Already closed
            }
          }
          cleanup();
        });

        ytdlpProcess.on("error", (err: Error) => {
          console.error("Process error:", err);
          if (!isClosed) {
            isClosed = true;
            try {
              controller.error(err);
            } catch {
              // Already closed
            }
          }
          cleanup();
        });

        ytdlpProcess.on("close", (code: number | null) => {
          if (code !== 0 && code !== null) {
            console.error(`yt-dlp exited with code ${code}`);
          }
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch {
              // Already closed
            }
          }
          cleanup();
        });
      },
      cancel() {
        isClosed = true;
        try {
          ytdlpProcess.kill();
        } catch {
          // Process might already be dead
        }
        cleanup();
      },
    });

    // Return streaming response
    return new NextResponse(stream, {
      headers: {
        "Content-Type": mimeTypes[audioFormat],
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          filename
        )}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    endDownload(rateLimit.ip);
    console.error("Audio download error:", error);

    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
