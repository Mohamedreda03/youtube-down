/**
 * Audio Download API Route
 * GET /api/audio/download
 *
 * Downloads audio using direct YouTube URLs from Innertube API
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidYouTubeUrl, extractVideoId } from "@/lib/youtube";
import { getFormatDownloadUrl } from "@/lib/youtube-api";
import { checkAllLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const formatId = searchParams.get("formatId");

  // Rate limiting
  const rateLimit = checkAllLimits(request);
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

  try {
    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Get download URL from cached format URLs
    const downloadUrl = getFormatDownloadUrl(videoId, formatId);
    
    if (!downloadUrl) {
      throw new Error("Download URL not found. Please fetch audio info first.");
    }

    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl, 302);
  } catch (error) {
    console.error("Audio download error:", error);

    const message =
      error instanceof Error ? error.message : "Download failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
