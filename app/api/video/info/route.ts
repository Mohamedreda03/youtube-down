/**
 * Video Info API Route
 * POST /api/video/info
 *
 * Fetches video metadata using yt-dlp
 *
 * Example yt-dlp command:
 * yt-dlp -j --no-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidYouTubeUrl } from "@/lib/youtube";
import { getVideoMetadata } from "@/lib/ytdlp";
import { checkAllLimits } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkAllLimits(request);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Sanitize URL to prevent command injection
    const sanitizedUrl = url.trim().replace(/[;&|`$(){}[\]<>]/g, "");

    // Fetch metadata
    const metadata = await getVideoMetadata(sanitizedUrl);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Video info error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch video info";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
