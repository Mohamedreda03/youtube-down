/**
 * Audio Info API Route
 * POST /api/audio/info
 *
 * Fetches video metadata for audio extraction using Cobalt API
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidYouTubeUrl } from "@/lib/youtube";
import { getVideoInfo } from "@/lib/cobalt";
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

    // Fetch metadata using Cobalt API
    const metadata = await getVideoInfo(sanitizedUrl);

    // Return only audio-relevant data
    return NextResponse.json({
      id: metadata.id,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      duration: metadata.duration,
      durationFormatted: metadata.durationFormatted,
      audioFormats: metadata.audioFormats,
    });
  } catch (error) {
    console.error("Audio info error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch video info";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
