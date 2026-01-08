"use client";

import { useState } from "react";
import { Music, AlertCircle } from "lucide-react";
import { UrlInput } from "@/components/url-input";
import { VideoInfoCard } from "@/components/video-info-card";
import {
  AudioQualitySelector,
  type AudioFormatType,
  type AudioQualityType,
} from "@/components/audio-quality-selector";
import { Disclaimer } from "@/components/disclaimer";
import { Separator } from "@/components/ui/separator";
import type { VideoMetadata } from "@/lib/youtube";

export default function AudioDownloaderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [audioFormat, setAudioFormat] = useState<AudioFormatType>("mp3");
  const [audioQuality, setAudioQuality] = useState<AudioQualityType>("best");
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const handleFetchMetadata = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setMetadata(null);
    setCurrentUrl(url);

    try {
      const response = await fetch("/api/audio/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video info");
      }

      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!metadata || !currentUrl) return;

    setIsDownloading(true);
    setError(null);

    try {
      // Build download URL
      const params = new URLSearchParams({
        url: currentUrl,
        format: audioFormat,
        quality: audioQuality,
        title: metadata.title,
      });

      // Trigger download
      window.location.href = `/api/audio/download?${params.toString()}`;

      // Give some time for download to start
      setTimeout(() => {
        setIsDownloading(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-6 ring-1 ring-primary/20">
          <Music className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Audio Downloader
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Extract audio from YouTube videos in MP3 or M4A format.{" "}
          <br className="hidden sm:block" />
          Perfect for music, podcasts, and audiobooks.
        </p>
      </div>

      {/* URL Input */}
      <div className="mb-8">
        <UrlInput
          onSubmit={handleFetchMetadata}
          isLoading={isLoading}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Video Info & Audio Options */}
      {metadata && (
        <div className="space-y-6">
          <VideoInfoCard metadata={metadata} showViewCount={false} />

          <Separator />

          <AudioQualitySelector
            selectedFormat={audioFormat}
            selectedQuality={audioQuality}
            onFormatChange={setAudioFormat}
            onQualityChange={setAudioQuality}
            onDownload={handleDownload}
            isDownloading={isDownloading}
          />
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
