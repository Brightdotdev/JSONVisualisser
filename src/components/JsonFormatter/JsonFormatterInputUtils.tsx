import {  X } from "lucide-react";
import { memo } from "react";
import { Alert, AlertTitle } from "../ui/alert";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Loader } from "../ui/loader";


// =============== Error Display ===============
export const ErrorDisplay = memo(({ error, isVisible }: { error: string; isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <Alert variant="destructive" className="flex items-center bg-none text-destructive-foreground border-none">
      <AlertTitle className="flex items-center gap-2">{error}</AlertTitle>
    </Alert>
  );
});
ErrorDisplay.displayName = "ErrorDisplay";


// =============== JSON Metadata Display ===============
export const JsonMetadataDisplay = memo(({ 
  fileName, 
  metadata, 
  onClear 
}: { 
  fileName: string;
  metadata: { lines: number; keys: number; depth: number } | null;
  onClear: () => void;
}) => (
  <Card className="w-full flex flex-col gap-3 p-2 bg-background/50 md:text-sm text-xs">
    <div className="flex items-center justify-between">
      <p className="font-mono truncate">{fileName}</p>
      <Button
        type="button"
        variant="ghost"
        onClick={onClear}
        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded-full p-1"
      >
        <X size={16} />
      </Button>
    </div>

    <div className="flex flex-col gap-1 text-xs">
      <span>Lines: {metadata?.lines ?? 0}</span>
      <span>Keys: {metadata?.keys ?? 0}</span>
      <span>Depth: {metadata?.depth ?? 0}</span>
    </div>
  </Card>
));
JsonMetadataDisplay.displayName = "JsonMetadataDisplay";


// =============== Loading Overlay Component ===============
export const LoadingOverlay = memo(({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
        <Loader size="lg" text="Creating your JSON tab..." />
        <p className="text-sm text-muted-foreground text-center">
          You'll be redirected automatically
        </p>
      </div>
    </div>
  );
});
LoadingOverlay.displayName = "LoadingOverlay";
