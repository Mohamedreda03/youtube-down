"use client";

import { Download, Loader2, Film, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VideoFormat } from "@/lib/youtube";
import { formatFileSize } from "@/lib/youtube";

interface VideoQualitySelectorProps {
  formats: VideoFormat[];
  selectedFormat: string;
  onFormatChange: (formatId: string) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export function VideoQualitySelector({
  formats,
  selectedFormat,
  onFormatChange,
  onDownload,
  isDownloading,
}: VideoQualitySelectorProps) {
  const selectedFormatData = formats.find((f) => f.formatId === selectedFormat);

  return (
    <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Film className="h-5 w-5" />
          </div>
          Select Quality
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formats.map((format) => {
            const isSelected = selectedFormat === format.formatId;
            return (
              <button
                key={format.formatId}
                onClick={() => onFormatChange(format.formatId)}
                className={cn(
                  "relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:border-primary/50 hover:bg-accent/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2"
                    : "border-border bg-card"
                )}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {format.resolution}
                    </span>
                    {format.fps && format.fps > 30 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5 bg-secondary text-secondary-foreground"
                      >
                        {format.fps} FPS
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {formatFileSize(format.filesize)} • MP4
                  </span>
                </div>

                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  )}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onDownload}
          disabled={!selectedFormat || isDownloading}
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          size="lg"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Download Video
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
