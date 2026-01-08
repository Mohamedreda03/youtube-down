"use client";

import {
  Download,
  Loader2,
  Music,
  Check,
  FileAudio,
  Sliders,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AudioFormatType = "mp3" | "m4a";
export type AudioQualityType = "best" | "medium" | "low";

interface AudioQualitySelectorProps {
  selectedFormat: AudioFormatType;
  selectedQuality: AudioQualityType;
  onFormatChange: (format: AudioFormatType) => void;
  onQualityChange: (quality: AudioQualityType) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const formatOptions = [
  { value: "mp3", label: "MP3", description: "Most compatible" },
  { value: "m4a", label: "M4A", description: "Better quality" },
];

const qualityOptions = [
  { value: "best", label: "Best", description: "~320kbps" },
  { value: "medium", label: "Medium", description: "~192kbps" },
  { value: "low", label: "Low", description: "~128kbps" },
];

export function AudioQualitySelector({
  selectedFormat,
  selectedQuality,
  onFormatChange,
  onQualityChange,
  onDownload,
  isDownloading,
}: AudioQualitySelectorProps) {
  return (
    <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Music className="h-5 w-5" />
          </div>
          Audio Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Audio Format */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <FileAudio className="h-4 w-4" />
            Format
          </div>
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map((option) => {
              const isSelected = selectedFormat === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    onFormatChange(option.value as AudioFormatType)
                  }
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center group hover:border-primary/50 hover:bg-accent/50",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2"
                      : "border-border bg-card"
                  )}
                >
                  <span className="font-bold text-lg">{option.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Quality */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Sliders className="h-4 w-4" />
            Quality
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {qualityOptions.map((option) => {
              const isSelected = selectedQuality === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    onQualityChange(option.value as AudioQualityType)
                  }
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 text-center group hover:border-primary/50 hover:bg-accent/50",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2"
                      : "border-border bg-card"
                  )}
                >
                  <span className="font-bold">{option.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 mt-4"
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
              Download Audio
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
