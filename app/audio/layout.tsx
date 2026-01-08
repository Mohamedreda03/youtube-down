import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audio Downloader",
  description:
    "Extract high-quality audio from YouTube videos. Convert YouTube to MP3 or M4A format instantly with TubeDown.",
  openGraph: {
    title: "Audio Downloader",
    description:
      "Extract high-quality audio from YouTube videos. Convert YouTube to MP3 or M4A format instantly with TubeDown.",
  },
};

export default function AudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
