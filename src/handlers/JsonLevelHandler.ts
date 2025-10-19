// ─────────────────────────────────────────────────────────────
// JSON LEVEL ANALYZER & NODE BUILDER
// ─────────────────────────────────────────────────────────────

import { detectPrimitiveType } from "@/lib/utitlityTypeDetectors";
import { LevelAnalysisResult, LevelNode } from "@/types/JsonNodeTypes";
import { ExtraDataTypes, JsonObject, JsonValue } from "@/types/JsonTypes";

/**
 * Detects enhanced JSON data types.
 * - Handles primitives (string, number, boolean)
 * - Handles null, arrays, and objects distinctly
 */
function detectEnhancedType(value: JsonValue, key: string = ''): ExtraDataTypes {
  if (value === null) return 'null';               // Handle null
  if (typeof value !== 'object') {                 // Handle primitive types
    return detectPrimitiveType(value, key);
  }
  if (Array.isArray(value)) return 'array';        // Handle arrays
  return 'object';                                 // Handle objects
}

/**
 * Checks whether a node is a leaf node (no children).
 */
function checkIfLeafNode(value: JsonValue): boolean {
  if (value === null) return true;
  if (typeof value !== 'object') return true;
  if (Array.isArray(value)) return value.length === 0;
  return Object.keys(value as JsonObject).length === 0;
}

/**
 * Enhanced function to process a SINGLE level of JSON data.
 * It analyzes all keys/values at that level and produces LevelNodes.
 */
export function processJsonLevel(
  data: any, 
  parentPath: string = 'root', 
  parentKey: string = 'root'
): LevelAnalysisResult {
  if (!isValidJsonValue(data)) {
    throw new Error('Invalid JSON value provided');
  }

  const nodes: LevelNode[] = [];
  let hasChildren = false;
  const processedDataType = detectEnhancedType(data, parentKey);

  // ─── Handle each type of JSON data ─────────────────────────────
  if (data === null || typeof data !== 'object') {
    // Primitive node
    const node = createLevelNode(parentKey, data, parentPath, null, 'root');
    nodes.push(node);
  } else if (Array.isArray(data)) {
    // Array: iterate over elements
    hasChildren = data.length > 0;
    data.forEach((item, index) => {
      const node = createLevelNode(index.toString(), item, parentPath, parentPath, 'array');
      nodes.push(node);
    });
  } else {
    // Object: iterate over keys
    const keys = Object.keys(data);
    hasChildren = keys.length > 0;
    keys.forEach(key => {
      const node = createLevelNode(key, data[key], parentPath, parentPath, 'object');
      nodes.push(node);
    });
  }

  return {
    nodes,
    parentPath: parentPath === 'root' ? undefined : parentPath,
    hasChildren,
    processedDataType
  };
}

/**
 * Creates a single LevelNode for a given key-value pair.
 * - Builds the node path
 * - Detects data type
 * - Determines if it's a leaf
 * - Calculates child count
 */
function createLevelNode(
  key: string, 
  value: any, 
  currentPath: string, 
  parentPath: string | null,
  parentType: 'object' | 'array' | 'root' = 'object'
): LevelNode {
  const dataType = detectEnhancedType(value, key);
  const isLeaf = checkIfLeafNode(value);

  // Build the correct full path (using [] for arrays)
  const path = buildPath(key, value, currentPath, parentType);

  // Count children if the node has nested structures
  const childCount = getChildCount(value);

  // Generate relative key (e.g., users[0] or users.name)
  const relativeKey = generateRelativeKey(key, parentPath, parentType);

  return {
    key,
    path,
    parentPath,
    metadata: {
      dataType,
      jsonValue: value,
      isLeaf,
      ...(childCount > 0 && { childCount }),
    }
  };
}

/**
 * Generates a key relative to the parent path.
 * Example:
 * - Object: parent.key
 * - Array: parent[index]
 */
function generateRelativeKey(
  key: string,
  parentPath: string | null,
  parentType: 'object' | 'array' | 'root' = 'object'
): string {
  const isIndex = /^\d+$/.test(key);

  // For root
  if (!parentPath || parentPath === 'root') {
    return isIndex ? `root[${key}]` : `root.${key}`;
  }

  // For array parents, use bracket syntax
  if (parentType === 'array') {
    return `${parentPath}[${key}]`;
  }

  // For object parents
  return isIndex ? `${parentPath}[${key}]` : `${parentPath}.${key}`;
}

/**
 * Builds the correct full path for the current key.
 * Example outputs:
 * - root.users[0].name
 * - root.items[2].price
 * - root.details.address
 */
function buildPath(
  key: string,
  value: any,
  parentPath: string,
  parentType: 'object' | 'array' | 'root'
): string {
  const isIndex = /^\d+$/.test(key);

  // Root-level path
  if (parentPath === 'root' || parentType === 'root') {
    return isIndex ? `root[${key}]` : `root.${key}`;
  }

  // For array parent, always use bracket notation
  if (parentType === 'array') {
    return `${parentPath}[${key}]`;
  }

  // For object parent, use dot or bracket as appropriate
  return isIndex ? `${parentPath}[${key}]` : `${parentPath}.${key}`;
}

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Gets child count for complex types (arrays/objects)
 */
function getChildCount(value: any): number {
  if (value === null || typeof value !== 'object') return 0;
  if (Array.isArray(value)) return value.length;
  return Object.keys(value).length;
}

/**
 * Validates if a value is a valid JSON type
 */
function isValidJsonValue(value: any): boolean {
  if (value === null) return true;

  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') return true;

  if (type === 'object') {
    if (Array.isArray(value)) return true;
    return value.constructor === Object; // plain object only
  }

  return false;
}
