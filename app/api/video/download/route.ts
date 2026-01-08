/**
 * Video Download API Route
 * GET /api/video/download
 *
 * Downloads video using yt-dlp and streams to user
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidYouTubeUrl, sanitizeFilename } from "@/lib/youtube";
import { downloadVideo } from "@/lib/ytdlp";
import { checkAllLimits, startDownload, endDownload } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const formatId = searchParams.get("formatId");
  const needsAudioMerge = searchParams.get("needsAudioMerge") === "true";
  const title = searchParams.get("title") || "video";

  // Rate limiting with download check
  const rateLimit = checkAllLimits(request, true);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  // Validate inputs
  if (!url || !formatId) {
    return NextResponse.json(
      { error: "URL and formatId are required" },
      { status: 400 }
    );
  }

  if (!isValidYouTubeUrl(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  // Sanitize inputs to prevent command injection
  const sanitizedUrl = url.trim().replace(/[;&|`$(){}[\]<>]/g, "");
  const sanitizedFormatId = formatId.replace(/[^a-zA-Z0-9+_-]/g, "");

  // Track concurrent downloads
  startDownload(rateLimit.ip);

  try {
    // Start download process
    const ytdlpProcess = downloadVideo(
      sanitizedUrl,
      sanitizedFormatId,
      needsAudioMerge
    );

    // Create filename
    const filename = `${sanitizeFilename(title)}.mp4`;

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
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          filename
        )}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    endDownload(rateLimit.ip);
    console.error("Download error:", error);

    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
