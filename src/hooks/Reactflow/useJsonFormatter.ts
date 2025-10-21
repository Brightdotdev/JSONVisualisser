"use client";

import { parseAndValidateInput } from "@/lib/JsonNodeMapper";
import { calculateJsonMetadata } from "@/lib/jsonUtils";
import { JsonObject } from "@/types/JsonTypes";
import { useState, useEffect } from "react";

export const useJsonFormatter = () => {
  const [tempJsonData, setJsonData] = useState<JsonObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonMetadata, setJsonMetadata] = useState<{ lines: number; keys: number; depth: number } | null>(null);
  
  useEffect(() => {
    const temporaryJson = localStorage.getItem("tempJsonData");
    if (temporaryJson) {
      try {
        const parsed = JSON.parse(temporaryJson);
        setJsonData(parsed);
      } catch (e) {
        setError("Failed to parse stored JSON");
      }
    } else {
      setJsonData(null);
    }
  }, []);

  useEffect(() => {
    if (tempJsonData !== null) {
      const metadata = calculateJsonMetadata(tempJsonData);
      setJsonMetadata(metadata);
      setError(null);
    } else {
      setJsonMetadata(null);
    }
  }, [tempJsonData]);

  const addTempJson = (raw: string) => {
    const parsedJson = parseAndValidateInput(raw);
    if ('error' in parsedJson) {
      setError(parsedJson.error as string);
      return parsedJson.error;
    } else {
      setJsonData(parsedJson);
      localStorage.setItem("tempJsonData", JSON.stringify(parsedJson));
      setError(null);
      return null;
    }
  }

  const clearTempJson = () => {
    setJsonData(null);
    setJsonMetadata(null);
    setError(null);
    localStorage.removeItem("tempJsonData");
  }
  
  const calculateTempJsonMetadata = (): { lines: number; keys: number; depth: number } | { error: string } => {
    if (tempJsonData === null) return { error: "No Json Data Provided" };
    return calculateJsonMetadata(tempJsonData);
  }

  return { tempJsonData, error, addTempJson, clearTempJson, calculateTempJsonMetadata, jsonMetadata };
};