"use client"


import { getUniqueFileName } from "@/lib/jsonUtils";
import { JsonObject, JsonTab } from "@/types/JsonTypes"
import { generateJsonSlug } from "@/utils/slugGenerator";
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner";

export const useJsonTabs = () => {
  const [isLoading, setLoading] =useState(false)
  const [jsonTabs, setJsonTabs] = useState<JsonTab[]>(() => {
  if (typeof window === "undefined") return []; 
  try {
    setLoading(true)
    const userJsonTabs = localStorage.getItem("json-tabs");
    return userJsonTabs ? JSON.parse(userJsonTabs) : [];

  } catch (error) {
     toast.error(`Failed to parse JSON tabs`);
   

     return [];
  }finally{
   setLoading(false)
  }
});




useEffect(() => {
  localStorage.setItem("json-tabs", JSON.stringify(jsonTabs));
}, [jsonTabs]);

const addJsonTab = useCallback((jsonData: JsonObject, fileName: string): JsonTab | { error: string } => {
    const jsonSlug = generateJsonSlug(jsonData);    
    // Check for duplicate content first
    const existingTabByContent = jsonTabs.find(tab => tab.slug === jsonSlug);
    if (existingTabByContent) {
        return existingTabByContent;
    }

  
    // Generate unique filename only if needed
    const uniqueFileName = getUniqueFileName(fileName, jsonTabs);
    
    const jsonTab: JsonTab = {
        id: `my-tab-${jsonSlug}`,
        slug: jsonSlug,
        fileName: uniqueFileName,
        jsonData: jsonData,
        createdAt: new Date(),
    };

    setJsonTabs(prevTabs => [...prevTabs, jsonTab]);
   
    return jsonTab;
}, [jsonTabs]);



  const getJsonTab = useCallback((identifier: string): JsonTab | undefined => {
    console.log("getJsonTab called with identifier:", identifier);
    console.log("Json tabs", jsonTabs);
    const json = jsonTabs.find(tab => 
      tab.slug === identifier || 
      tab.id === identifier
    );
    console.log("Found json", JSON.stringify(json))
   

    return json
  }, [jsonTabs]);

  const getJsonTabBySlug = useCallback((slug: string): JsonTab | undefined => {
    
    return jsonTabs.find(tab => tab.slug === slug);
  }, [jsonTabs]);

  const getJsonTabById = useCallback((id: string): JsonTab | undefined => {
    return jsonTabs.find(tab => tab.id === id);
  }, [jsonTabs]);

  const getJsonTabs = useCallback((identifiers: string[]): JsonTab[] => {
    return jsonTabs.filter(tab => 
      identifiers.includes(tab.slug) || 
      identifiers.includes(tab.id)
    );
  }, [jsonTabs]);

  const tabExists = useCallback((identifier: string): boolean => {
    return jsonTabs.some(tab => 
      tab.slug === identifier || 
      tab.id === identifier
    );
  }, [jsonTabs]);

  const getTabIndex = useCallback((identifier: string): number => {
    return jsonTabs.findIndex(tab => 
      tab.slug === identifier || 
      tab.id === identifier
    );
  }, [jsonTabs]);

  const removeTab = useCallback((identifier: string): void => {
    setJsonTabs(prevTabs => 
      prevTabs.filter(tab => tab.slug !== identifier && tab.id !== identifier)
    );
  }, []);

  const updateTab = useCallback((identifier: string, updates: Partial<JsonTab>): void => {
    setJsonTabs(prevTabs =>
      prevTabs.map(tab =>
        (tab.slug === identifier || tab.id === identifier)
          ? { ...tab, ...updates }
          : tab
      )
    );
  }, []);

  const clearAllTabs = useCallback((): void => {
    setJsonTabs([]);
    localStorage.removeItem("json-tabs");
  }, []);

  return {
    jsonTabs,
    setJsonTabs,
    addJsonTab,
    getJsonTab,
    getJsonTabBySlug,
    getJsonTabById,
    getJsonTabs,
    tabExists,
    getTabIndex,
    removeTab,
    updateTab,
    clearAllTabs,
    isLoading
  };
};