"use client";

import { useState, memo, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation"; // ✅ for redirect
import TextareaAutosize from "react-textarea-autosize";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { X, Upload } from "lucide-react";
import { useJsonFormatter } from "@/hooks/useJsonFormatter";
import { Alert, AlertTitle } from "./alert";
import { Spinner } from "./spinner";
import { useJsonTabs } from "@/hooks/useJsonTabs";
import { Button } from "./button";


// =============== JSON Metadata Display ===============
const JsonMetadataDisplay = memo(({ 
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


// =============== Error Display ===============
const ErrorDisplay = memo(({ error, isVisible }: { error: string; isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <Alert variant="destructive" className="flex items-center bg-none text-destructive-foreground border-none">
      <AlertTitle className="flex items-center gap-2">{error}</AlertTitle>
    </Alert>
  );
});
ErrorDisplay.displayName = "ErrorDisplay";


// =============== Main JSON Formatter Input ===============
export default function JsonFormatterInput() {
  const router = useRouter(); // ✅ Next.js redirect hook
  const { addTempJson, tempJsonData, error, clearTempJson, jsonMetadata } = useJsonFormatter();
  const { addJsonTab } = useJsonTabs();

  // ---- Local State ----
  const [inputError, setInputError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("untitled.json");
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Cleanup error timeout on unmount ----
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // ---- Show error (debounced + auto-hide) ----
  const showError = useCallback((message: string) => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setInputError(message);
    setErrorVisible(true);
    errorTimeoutRef.current = setTimeout(() => {
      setErrorVisible(false);
      setTimeout(() => setInputError(null), 300);
    }, 5000);
  }, []);

  // ---- Clear error immediately ----
  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setErrorVisible(false);
    setInputError(null);
  }, []);

  // ---- Handle global hook errors ----
  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  // ---- File Picker ----
  const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

  // ---- File Upload Handler ----
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        showError("Please select a valid JSON file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          try {
            JSON.parse(result);
            addTempJson(result);
            setFileName(file.name);
            clearError();
          } catch {
            showError("Invalid JSON file. Please check contents.");
          }
        }
      };
      reader.onerror = () => showError("Failed to read file.");
      reader.readAsText(file);
    },
    [addTempJson, showError, clearError]
  );

  // ---- Paste Handler ----
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pasted = e.clipboardData.getData("text");
      e.preventDefault();

      if (!pasted.trim()) {
        showError("No content pasted.");
        return;
      }

      try {
        JSON.parse(pasted);
        addTempJson(pasted);
        setFileName("clipboard.json");
        setText("");
        clearError();
      } catch {
        showError("Invalid JSON pasted. Please verify your source.");
      }
    },
    [addTempJson, showError, clearError]
  );

  // ---- Submit (Keyboard Shortcut) ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
        e.preventDefault();
        if (!text.trim()) {
          showError("Please enter some JSON data.");
          return;
        }

        try {
          JSON.parse(text);
          addTempJson(text);
          setFileName("manual.json");
          setText("");
          clearError();
        } catch {
          showError("Invalid JSON entered.");
        }
      }
    },
    [text, addTempJson, showError, clearError]
  );

  // ---- Drag & Drop ----
  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        showError("Please upload a valid JSON file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          try {
            JSON.parse(result);
            addTempJson(result);
            setFileName(file.name);
            clearError();
          } catch {
            showError("Invalid JSON file.");
          }
        }
      };
      reader.onerror = () => showError("Failed to read the file.");
      reader.readAsText(file);
    },
    [addTempJson, showError, clearError]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (tempJsonData) {
        showError("Please clear current JSON before loading a new file.");
        return;
      }
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    },
    [tempJsonData, handleFile, showError]
  );

  // ---- Clear ----
  const handleClear = useCallback(() => {
    clearTempJson();
    setFileName("untitled.json");
  }, [clearTempJson]);

  // ---- Submit ----
  const handleSubmit = useCallback(async () => {
    if (!tempJsonData) {
      showError("No JSON data to submit. Please load or paste JSON first.");
      return;
    }

    setSubmitting(true);
    const newTab =  addJsonTab(tempJsonData, fileName);
    setSubmitting(false);

    if ("error" in newTab) {
      showError(newTab.error);
      return;
    }

    // ✅ Redirect to new tab
    router.push(`/tabs/${newTab.slug}`);
    clearTempJson();
  }, [tempJsonData, fileName, addJsonTab, router, clearTempJson, showError]);

  // ---- Dynamic Classes ----
  const containerClass = useMemo(
    () =>
      `grid w-full md:max-w-2xl max-w-[90vw] md:gap-8 gap-4 border-2 border-dashed rounded-xl md:p-4 p-2 transition-colors ${
        dragOver ? "border-primary bg-muted/30" : "border-muted-foreground/30"
      }`,
    [dragOver]
  );

  const currentError = useMemo(() => inputError || error || null, [inputError, error]);

  // ---- Render ----
  return (
    <div className={containerClass} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <InputGroup className="rounded-xl bg-background shadow-sm transition focus-within:ring-1 focus-within:ring-primary">
        {tempJsonData ? (
          <JsonMetadataDisplay fileName={fileName} metadata={jsonMetadata} onClear={handleClear} />
        ) : (
          <TextareaAutosize
            data-slot="input-group-control"
            className="flex md:min-h-16 min-h-8 w-full resize-none rounded-md bg-transparent px-3 py-3 md:text-sm text-xs font-mono leading-relaxed placeholder:text-muted-foreground focus:outline-none"
            placeholder="Paste JSON here, type and press Enter, or drag & drop a file..."
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}

        <InputGroupAddon align="block-end" className="mt-4 flex gap-2">
          <>
            <InputGroupButton
              className="ml-auto"
              size="sm"
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Processing JSON...
                </>
              ) : (
                <>Submit</>
              )}
            </InputGroupButton>

            {!tempJsonData && (
              <label className="cursor-pointer">
                <InputGroupButton size="sm" variant="secondary" type="button" onClick={openFilePicker}>
                  <Upload size={14} className="mr-1" /> Upload
                </InputGroupButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </>
        </InputGroupAddon>
      </InputGroup>

      {currentError && <ErrorDisplay error={currentError} isVisible={errorVisible} />}
    </div>
  );
}
