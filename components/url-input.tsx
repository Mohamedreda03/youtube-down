"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidYouTubeUrl } from "@/lib/youtube";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function UrlInput({
  onSubmit,
  isLoading,
  placeholder = "Paste YouTube URL here...",
}: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(trimmedUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    onSubmit(trimmedUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          className="w-full h-14 pl-12 pr-32 text-lg rounded-full border-2 border-primary/20 focus-visible:border-primary focus-visible:ring-0 transition-all shadow-sm"
          disabled={isLoading}
        />
        <div className="absolute right-2">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="h-10 rounded-full px-6 font-bold transition-all"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start"}
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium text-center animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </form>
  );
}
