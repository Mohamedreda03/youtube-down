import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Downloader",
  description:
    "Download YouTube videos in high quality (4K, 1080p, 720p) with TubeDown. Fast, free, and supports all formats.",
  openGraph: {
    title: "Video Downloader",
    description:
      "Download YouTube videos in high quality (4K, 1080p, 720p) with TubeDown. Fast, free, and supports all formats.",
  },
};

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
