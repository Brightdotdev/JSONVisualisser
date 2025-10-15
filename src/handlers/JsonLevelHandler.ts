import { detectPrimitiveType } from "@/lib/utitlityTypeDetectors";



export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue; }
export interface JsonArray extends Array<JsonValue> {}

// Example 1: Process root level


export type ExtraDataTypes = 
  | 'string' | 'number' | 'boolean' | 'null' 
  | 'object' | 'array'
  | 'url' | 'email' | 'uuid'
  | 'timestamp' | 'date' | 'datetime'
  | 'hex-color' | 'rgb-color' | 'rgba-color'
  | 'version' | 'semantic-version'
  | 'ip-address' | 'ipv4' | 'ipv6'
  | 'json' | 'base64'
  | 'phone' | 'credit-card'
  | 'file-path' | 'directory-path';

export interface LevelAnalysisResult {
  nodes: LevelNode[];
  parentPath?: string;
  hasChildren: boolean;
  processedDataType: ExtraDataTypes; // Add the data type of the processed data
}

export interface LevelNode {
  key: string;
  path: string;
  parentPath: string | null;
  relativeKey: string; // New field: key relative to parent
  metadata: {
    dataType: ExtraDataTypes;
    jsonValue: any;
    isLeaf: boolean;
    childCount?: number;
    processedValueType?: string; // Type of the actual processed value
  };
}

function detectEnhancedType(value: JsonValue, key: string = ''): ExtraDataTypes {
  // Handle null values
  if (value === null) return 'null';

  // Handle primitive values (strings, numbers, booleans)
  if (typeof value !== 'object') {
    return detectPrimitiveType(value, key);
  }

  // Handle complex types (objects and arrays)
  if (Array.isArray(value)) return 'array';
  return 'object';
}
function checkIfLeafNode(value: JsonValue): boolean {
  if (value === null) return true;
  if (typeof value !== 'object') return true;
  if (Array.isArray(value)) return value.length === 0;
  return Object.keys(value as JsonObject).length === 0;
}
/**
 * Processes a SINGLE level of JSON data and returns analysis with parent references
 */

/**
 * Enhanced function to process a SINGLE level of JSON data
 */
export function processJsonLevel(
  data: any, 
  parentPath: string = 'root', 
  parentKey: string = 'root'
): LevelAnalysisResult {
  // Validate input is valid JSON structure
  if (!isValidJsonValue(data)) {
    throw new Error('Invalid JSON value provided');
  }

  const nodes: LevelNode[] = [];
  let hasChildren = false;
  const processedDataType = detectEnhancedType(data, parentKey); // Data type of the processed data itself

  // Handle different data types at current level
  if (data === null || typeof data !== 'object') {
    // Primitive value - single node
    const node = createLevelNode(parentKey, data, parentPath, null);
    nodes.push(node);
  } else if (Array.isArray(data)) {
    // Array - process each element at current level
    hasChildren = data.length > 0;
    data.forEach((item, index) => {
      const node = createLevelNode(index.toString(), item, parentPath, parentPath);
      nodes.push(node);
    });
  } else {
    // Object - process each property at current level
    const keys = Object.keys(data);
    hasChildren = keys.length > 0;
    keys.forEach(key => {
      const node = createLevelNode(key, data[key], parentPath, parentPath);
      nodes.push(node);
    });
  }

  return {
    nodes,
    parentPath: parentPath === 'root' ? undefined : parentPath,
    hasChildren,
    processedDataType // Include the data type of the processed data
  };
}

/**
 * Enhanced function to create a single level node
 */
function createLevelNode(
  key: string, 
  value: any, 
  currentPath: string, 
  parentPath: string | null
): LevelNode {
  const dataType = detectEnhancedType(value, key);
  const isLeaf = checkIfLeafNode(value);
  
  // Build path based on data type and parent
  const path = buildPath(key, value, currentPath);
  
  // Calculate child count for complex types
  const childCount = getChildCount(value);

  // Generate relative key (key relative to parent)
  const relativeKey = generateRelativeKey(key, parentPath);

  return {
    key,
    path,
    parentPath,
    relativeKey, // New field
    metadata: {
      dataType,
      jsonValue: value,
      isLeaf,
      ...(childCount > 0 && { childCount }),
      processedValueType: typeof value // Type of the actual processed value
    }
  };
}

/**
 * Generates a key relative to the parent path
 */
function generateRelativeKey(key: string, parentPath: string | null): string {
  if (!parentPath || parentPath === 'root') {
    return key;
  }
  
  // For array indices, show as parent[index]
  if (/^\d+$/.test(key)) {
    return `${parentPath}[${key}]`;
  }
  
  // For object properties, show as parent.key
  return `${parentPath}.${key}`;
}

/**
 * Enhanced path building function
 */
function buildPath(key: string, value: any, parentPath: string): string {
  if (parentPath === 'root') {
    return `root.${key}`;
  }
  
  if (Array.isArray(value)) {
    return `${parentPath}[${key}]`;
  }
  
  return `${parentPath}.${key}`;
}

// utitlity methods

/**
 * Gets child count for complex types
 */
function getChildCount(value: any): number {
  if (value === null || typeof value !== 'object') return 0;
  if (Array.isArray(value)) return value.length;
  return Object.keys(value).length;
}

/**
 * Validates if value is a valid JSON type
 */
function isValidJsonValue(value: any): boolean {
  if (value === null) return true;
  
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') return true;
  
  if (type === 'object') {
    if (Array.isArray(value)) return true;
    // Check if it's a plain object (not Date, RegExp, etc.)
    return value.constructor === Object;
  }
  
  return false;
}



