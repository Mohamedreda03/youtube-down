import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <p>
        <strong>Disclaimer:</strong> This tool is for personal use only. Users
        are responsible for complying with YouTube&apos;s Terms of Service. Do
        not use this tool to download copyrighted content without permission.
      </p>
    </div>
  );
}
