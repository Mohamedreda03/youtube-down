/**
 * Audio Download API Route
 * GET /api/audio/download
 *
 * Downloads audio using Cobalt API and redirects to download URL
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidYouTubeUrl } from "@/lib/youtube";
import { downloadAudio } from "@/lib/cobalt";
import { checkAllLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Allowed formats
const ALLOWED_FORMATS = ["mp3", "ogg", "wav"] as const;
type AudioFormat = (typeof ALLOWED_FORMATS)[number];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const format = searchParams.get("format") as AudioFormat | null;

  // Rate limiting
  const rateLimit = checkAllLimits(request);
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

  try {
    // Get download URL from Cobalt API
    const downloadUrl = await downloadAudio(url, audioFormat);

    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl, 302);
  } catch (error) {
    console.error("Audio download error:", error);

    const message =
      error instanceof Error ? error.message : "Download failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
