"use client";

import { useState, memo, useCallback, useEffect, useRef, useMemo } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { X, Upload } from "lucide-react";
import { useJsonFormatter } from "@/hooks/useJsonFormatter";
import { Alert, AlertTitle } from "./alert";
import { Spinner } from "./spinner";
import { useJsonTabs } from "@/hooks/useJsonTabs";
import { Button } from "./button";

// Memoized metadata display component
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
    {/* File header */}
    <div className="flex items-center justify-between">
      <p className="font-mono">{fileName}</p>
      <Button
        type="button"
        variant="ghost"
        onClick={onClear}
        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded-full p-1"
      >
        <X size={16} />
      </Button>
    </div>

    {/* Metadata */}
    <div className="flex flex-col gap-1 text-xs">
      <span>Lines: {metadata?.lines ?? 0}</span>
      <span>Keys: {metadata?.keys ?? 0}</span>
      <span>Depth: {metadata?.depth ?? 0}</span>
    </div>
  </Card>
));

JsonMetadataDisplay.displayName = "JsonMetadataDisplay";

// Memoized error display component with debounced visibility
const ErrorDisplay = memo(({ error, isVisible }: { error: string; isVisible: boolean }) => {
  if (!isVisible) return null;
  
  return (
    <Alert variant="destructive" className="flex items-center bg-none text-destructive-foreground border-none">
      <AlertTitle className="flex items-center gap-2 rounded-xs">
        {error}
      </AlertTitle>
    </Alert>
  );
});

ErrorDisplay.displayName = "ErrorDisplay";

export default function JsonFormatterInput() {
  const { addTempJson, tempJsonData, error, clearTempJson,jsonMetadata } = useJsonFormatter();
  const {addJsonTab} = useJsonTabs()
 
 
  const [inputError, setInputError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("untitled.json");
  const [dragOver, setDragOver] = useState(false);
  const [isSubmiting, setSubmiting] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Clear error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Stable error display management - FIXED: useCallback with proper dependencies
  const showError = useCallback((message: string) => {
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setInputError(message);
    setErrorVisible(true);

    // Auto-hide error after 5 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setErrorVisible(false);
      // Keep the error message for a bit longer before clearing completely
      setTimeout(() => setInputError(null), 300);
    }, 5000);
  }, []); // No dependencies needed since we're only using refs

  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setErrorVisible(false);
    setInputError(null);
  }, []); // No dependencies needed

 

  // Handle hook-level errors - FIXED: Only depend on error
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]); // REMOVED: showError

  // Memoized file picker function
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Memoized file change handler - FIXED: Remove clearError from dependencies
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
          // Validate JSON before adding
          JSON.parse(result);
          addTempJson(result);
          setFileName(file.name);
          clearError();
        } catch (err) {
          showError("Invalid JSON file. Please check the file contents.");
        }
      }
    };
    reader.onerror = () => {
      showError("Failed to read the file.");
    };
    reader.readAsText(file);
  }, [addTempJson, showError]); // REMOVED: clearError

  // Memoized paste handler - FIXED: Remove clearError from dependencies
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    e.preventDefault();
    
    // Basic validation before processing
    if (!pasted.trim()) {
      showError("No content pasted.");
      return;
    }
    
    try {
      // Quick JSON validation
      JSON.parse(pasted);
      addTempJson(pasted);
      setFileName("clipboard.json");
      setText("");
      clearError();
    } catch (err) {
      showError("Invalid JSON pasted. Please check your json source");
    }
  }, [addTempJson, showError]); // REMOVED: clearError

  // Memoized keydown handler - FIXED: Remove clearError from dependencies
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      
      if (!text.trim()) {
        showError("Please enter some JSON data.");
        return;
      }
      
      try {
        // Quick JSON validation
        JSON.parse(text);
        addTempJson(text);
        setFileName("manual.json");
        setText("");
        clearError();
      } catch (err) {
        showError("Invalid JSON entered. Please check your input.");
      }
    }
  }, [text, addTempJson, showError]); // REMOVED: clearError

  // Memoized file handler for drag & drop - FIXED: Remove clearError from dependencies
  const handleFile = useCallback((file: File) => {
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
        } catch (err) {
          showError("Invalid JSON file. Please check the file contents.");
        }
      }
    };
    reader.onerror = () => {
      showError("Failed to read the file.");
    };
    reader.readAsText(file);
  }, [addTempJson, showError]); // REMOVED: clearError

  // Memoized drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (tempJsonData) {
      showError("Please clear current JSON before loading a new file.");
      return;
    }
    
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [tempJsonData, handleFile, showError]);

  // Memoized clear function - FIXED: Proper error clearing
  const handleClear = useCallback(() => {
    clearTempJson();
    setFileName("untitled.json");
  }, [clearTempJson, clearError]);

  // Memoized text change handler - FIXED: No rapid error clearing on typing
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Don't clear error immediately on typing - let user see the error
  }, []);

  // Memoized submit handler - FIXED: Add proper logic
  const handleSubmit = useCallback(() => {
    if (!tempJsonData) {
      showError("No JSON data to submit. Please load or paste JSON first.");
      return;
    }
    
    console.log("Submitting JSON:", tempJsonData);
    const newTab = addJsonTab(tempJsonData,fileName);
    setSubmiting(true)
    if("error" in newTab){
      setSubmiting(false)
     return alert(newTab.error)
    }

    alert("Yeah it worked")
    alert(newTab.slug)
    alert(newTab.id)
    setSubmiting(false)
    clearTempJson()
  }, [tempJsonData, showError]);

  // Memoized container class
  const containerClass = useMemo(() => 
    `grid w-full md:max-w-2xl max-w-[90vw] md:gap-8 gap-4 border-2 border-dashed rounded-xl md:p-4 p-2 transition-colors ${
      dragOver ? "border-primary bg-muted/30" : "border-muted-foreground/30"
    }`,
    [dragOver]
  );

  // Memoized current error
  const currentError = useMemo(() => {
    return inputError || error || null;
  }, [inputError, error]);

  return (
    <div
      className={containerClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <InputGroup className="rounded-xl bg-background shadow-sm transition focus-within:ring-1 focus-within:ring-primary">
        {tempJsonData ? (
          <JsonMetadataDisplay 
            fileName={fileName}
            metadata={jsonMetadata}
            onClear={handleClear}
          />
        ) : (
          <TextareaAutosize
            data-slot="input-group-control"
            className="flex md:min-h-16 min-h-8 w-full resize-none rounded-md bg-transparent px-3 py-3  md:text-sm text-xs font-mono leading-relaxed placeholder:text-muted-foreground focus:outline-none"
            placeholder="Paste JSON here, type and press Enter, or drag & drop a file..."
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            value={text}
            onChange={handleTextChange}
          />
        )}

        <InputGroupAddon align="block-end" className="mt-4 flex gap-2">
            <>
              <InputGroupButton
                className="ml-auto"
                size="sm"
                variant="default"
                onClick={handleSubmit}
                disabled={isSubmiting}
              >
{
                isSubmiting ? <>
                <Spinner /> Processing your json
                </> :
                <>
                Submit
                </>
}
              </InputGroupButton>
              
                {!tempJsonData && (
              <label className="cursor-pointer">
                <InputGroupButton
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={openFilePicker}
                  >
                  <Upload size={14} className="mr-1 md:text-sm text-xs" /> Upload
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
     
      {/* Stable error display */}
      {currentError && (
        <ErrorDisplay error={currentError} isVisible={errorVisible} />
      )}
 
      
    </div>
  );
}