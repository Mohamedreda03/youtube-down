/**
 * Video Download API Route
 * GET /api/video/download
 *
 * Downloads video using Cobalt API and redirects to download URL
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidYouTubeUrl } from "@/lib/youtube";
import { downloadVideo } from "@/lib/cobalt";
import { checkAllLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const formatId = searchParams.get("formatId") || "1080";

  // Rate limiting
  const rateLimit = checkAllLimits(request);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  // Validate inputs
  if (!url) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  if (!isValidYouTubeUrl(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    // Get download URL from Cobalt API
    // formatId is like "1080", "720", etc.
    const downloadUrl = await downloadVideo(url, formatId);

    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl, 302);
  } catch (error) {
    console.error("Video download error:", error);

    const message =
      error instanceof Error ? error.message : "Download failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
