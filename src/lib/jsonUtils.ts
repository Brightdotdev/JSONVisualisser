import { JsonObject, JsonTab } from "@/types/JsonTypes";

// Helper: count nesting depth
export const getDepth = (obj: JsonObject): number => {
  const calculateDepth = (currentObj: any, currentLevel = 0): number => {
    if (currentObj === null || typeof currentObj !== "object") {
      return currentLevel;
    }
    
    const depths = Object.values(currentObj).map(value => 
      calculateDepth(value, currentLevel + 1)
    );
    
    return depths.length > 0 ? Math.max(...depths) : currentLevel;
  };
  
  return calculateDepth(obj);
};
// Helper: count keys
export const getTotalKeys = (obj: Record<string, any>): number => {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    return (
      Object.keys(obj).length +
      Object.values(obj).reduce((sum, value) => {
        // Only recurse into actual objects, not primitives
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          return sum + getTotalKeys(value);
        }
        return sum;
      }, 0)
    );
  }
  return 0;
};
// Generate unique owner ID
export const generateOwnerId = (): string => {
  return `owner_${crypto.randomUUID()}`;
}

// Generate tab ID
export const generateTabId = (): string => {
  return `tab_${crypto.randomUUID()}`;
}

// Calculate JSON metadata
export const calculateJsonMetadata = (json: JsonObject) => {
  const jsonString = JSON.stringify(json, null, 2);
  const jsonObject = JSON.parse(jsonString);
  return {
    lines: jsonString.split("\n").length,
    keys : getTotalKeys(jsonObject),
    depth: getDepth(json),
    size: new Blob([jsonString]).size,
  };
}




// Enhanced helper const
export  const getUniqueFileName = (fileName: string, tabs: JsonTab[]): string => {
    const cleanFileName = (name: string) => name.replace(/\.json$/i, '');
    const baseName = cleanFileName(fileName);
    
    const existingFiles = tabs.map(tab => ({
        name: tab.fileName,
        clean: cleanFileName(tab.fileName)
    }));
    
    // Check if exact filename exists
    const exactMatch = existingFiles.find(f => f.name.toLowerCase() === fileName.toLowerCase());
    if (!exactMatch) {
        return fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    }
    
    // Find all files with the same base name
    const sameBaseFiles = existingFiles.filter(f => 
        f.clean.toLowerCase().startsWith(baseName.toLowerCase())
    );
    
    // Extract numbers from existing files
    const existingNumbers = sameBaseFiles.map(f => {
        const match = f.clean.match(new RegExp(`^${baseName}\\s*\\((\\d+)\\)$`, 'i'));
        return match ? parseInt(match[1]) : 0;
    }).filter(n => n > 0);
    
    // Find the next available number
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    
    return `${baseName} (${nextNumber}).json`;
};

