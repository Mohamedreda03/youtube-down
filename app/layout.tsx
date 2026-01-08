import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TubeDown",
    template: "%s | TubeDown",
  },
  description:
    "Download YouTube videos in 4K, 1080p, and extract audio in MP3/M4A formats. Fast, free, and secure with TubeDown. No software installation required.",
  keywords: [
    "youtube downloader",
    "video downloader",
    "audio extractor",
    "youtube to mp3",
    "youtube to mp4",
    "4k video downloader",
    "free youtube downloader",
    "tubedown",
  ],
  authors: [{ name: "TubeDown" }],
  creator: "TubeDown",
  publisher: "TubeDown",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tubedown.com",
    title: "TubeDown",
    description:
      "Download YouTube videos in 4K, 1080p, and extract audio in MP3/M4A formats. Fast, free, and secure.",
    siteName: "TubeDown",
  },
  twitter: {
    card: "summary_large_image",
    title: "TubeDown",
    description:
      "Download YouTube videos in 4K, 1080p, and extract audio in MP3/M4A formats. Fast, free, and secure.",
    creator: "@tubedown",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            <p>
              TubeDown &copy; {new Date().getFullYear()} - For personal use only
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
