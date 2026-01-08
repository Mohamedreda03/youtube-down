"use client";

import Image from "next/image";
import { Clock, User, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VideoMetadata } from "@/lib/youtube";

interface VideoInfoCardProps {
  metadata: VideoMetadata;
  showViewCount?: boolean;
}

function formatViewCount(count?: number): string {
  if (!count) return "";

  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B views`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M views`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K views`;
  }
  return `${count} views`;
}

export function VideoInfoCard({
  metadata,
  showViewCount = true,
}: VideoInfoCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full md:w-80 shrink-0 aspect-video bg-muted group">
            {metadata.thumbnail ? (
              <Image
                src={metadata.thumbnail}
                alt={metadata.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No thumbnail
              </div>
            )}
            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {metadata.durationFormatted}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <h3 className="font-bold text-xl md:text-2xl leading-tight mb-3 line-clamp-2 text-foreground">
              {metadata.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{metadata.channel}</span>
              </div>

              {showViewCount && metadata.viewCount && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {formatViewCount(metadata.viewCount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
