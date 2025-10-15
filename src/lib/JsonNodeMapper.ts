// import { EnhancedAnalysis, ExtraDataTypes, JsonArray, JsonNode, JsonNodeMetadata, JsonObject, JsonParseResult, JsonValue } from "@/types/JsonTypes";





 type JsonPrimitive = string | number | boolean | null;
 type JsonValue = JsonPrimitive | JsonObject | JsonArray;
 interface JsonObject { [key: string]: JsonValue; }
 interface JsonArray extends Array<JsonValue> {}

// Enhanced data types for better categorization
 type ExtraDataTypes = 
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


   interface JsonNodeMetadata  {
    dataType : ExtraDataTypes;
    jsonValue : any
  }
// Structure for each analyzed node
 type JsonNode = {
  index: number;
  key: string;
  jsonType: string;
  metadata : JsonNodeMetadata;
  path: string;
  depth: number;
  parentPath?: string;
  isLeaf: boolean;

};

 type JsonParseResult = {
  nodes: JsonNode[];
  summary: {
    totalNodes: number;
    byType: Record<ExtraDataTypes, number>;
    maxDepth: number;
    structure: any;
  };
};


 type EnhancedAnalysis = {
  summary: {
    totalNodes: number;
    maxDepth: number;
    byType: Record<string, number>;
  };
  detailedNodes: Array<{
    Index: number;
    Key: string | null;
    Type: string;
    Path: string;
    Depth: number;
    JSONValue: any;
    JSONType: string;
    IsLeaf: boolean;
    ParentPath: string;
  }>;
  originalStructure: any;
  error?: string; // In case parsing failed
};


 interface JsonTab {
  id : string;
  slug : string;
  fileName : string;
  jsonData : JsonObject
  createdAt : Date
} 

const exampleJsonString ={
  "name": "json-vissualizer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@xyflow/react": "^12.8.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.23.22",
    "lucide-react": "^0.544.0",
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-haiku": "^2.4.1",
    "react-icons": "^5.5.0",
    "react-syntax-highlighter": "^15.6.6",
    "react-textarea-autosize": "^8.5.9",
    "reactflow": "^11.11.4",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/react-syntax-highlighter": "^15.5.13",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}

// =============================================================================
// CORE ANALYSIS FLOW FUNCTIONS
// =============================================================================

/**
 * MAIN ENTRY POINT: Analyzes JSON input and returns comprehensive analysis
 */
function processJsonData(input: string | object): JsonParseResult | { error: string } {
  // Step 1: Parse and validate input
  const parseResult = parseAndValidateInput(input);
  if ('error' in parseResult) {
    return parseResult as JsonParseResult | { error: string; }; // cast the return value to the expected type
  }

  // Step 2: Analyze the JSON structure
  const analysisState = analyzeJsonStructure(parseResult);

  // Step 3: Generate summary statistics
  const summary = generateSummary(analysisState.nodes, analysisState.maxDepth, parseResult);

  return {
    nodes: analysisState.nodes,
    summary
  };
}
/**
 * Step 1: Parse JSON input and validate it's an object
 * convert it to object really
 */function parseAndValidateInput(input: string | object): JsonObject | { error: string } {
  let parsedData: JsonValue;
  
  // Parse input if it's a string
  if (typeof input === 'string') {
    try {
      parsedData = JSON.parse(input);
    } catch (error) {
      return { error: 'Invalid JSON format' };
    }
  } else {
    parsedData = input as JsonValue;
  }

  // Validate that root is a JSON object (not primitive or array)
  if (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)) {
    return { error: 'Root must be a JSON object :: invalid json provided' };
  }

  return parsedData as JsonObject;  // Return the object directly
}
/**
 * Step 2: Analyze JSON structure and build node tree
 */
function analyzeJsonStructure(parsedData: JsonObject): { nodes: JsonNode[]; maxDepth: number } {
  
  const nodes: JsonNode[] = [];
  const analysisState = {
    currentIndex: 0,
    maxDepth: 0
  };

  // Start recursive analysis from root
  // pass the nodes and then like poppulate it with the metadata of the json
  // starting with root cause it is the first node, as you must guess current index and maxdepth is zero too cause it is root
  analyzeValueRecursive(parsedData, 'root', 'root', 0, undefined, nodes, analysisState);

  return { nodes, maxDepth: analysisState.maxDepth };
}

/**
 * Step 3: Generate summary statistics from analyzed nodes
 */
function generateSummary(
  nodes: JsonNode[], 
  maxDepth: number, 
  structure: JsonObject
): JsonParseResult['summary'] {
  const byType: Record<ExtraDataTypes, number> = {} as Record<ExtraDataTypes, number>;
  
  nodes.forEach(node => {
    byType[node.metadata.dataType] = (byType[node.metadata.dataType] || 0) + 1;
  });

  return {
    totalNodes: nodes.length,
    byType,
    maxDepth,
    structure
  };
}

// =============================================================================
// RECURSIVE ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Recursively analyzes any JSON value and builds the node tree
 */
function analyzeValueRecursive(
  value: JsonValue,
  path: string,
  key: string,
  depth: number,
  parentPath: string | undefined,
  nodes: JsonNode[],
  state: { currentIndex: number; maxDepth: number }
): void {
  // Create analysis node for current value
  const node = createJsonNode(value, path, key, depth, parentPath, state.currentIndex);
  nodes.push(node);
  
  // Update global state
  state.currentIndex++;
  state.maxDepth = Math.max(state.maxDepth, depth);

  // If value is complex (object/array), analyze its children recursively
  if (!node.isLeaf) {
    analyzeChildrenRecursive(value, path, depth, nodes, state);
  }
}

/**
 * Creates a single analysis node for a JSON value
 */
function createJsonNode(
  value: JsonValue,
  path: string,
  key: string,
  depth: number,
  parentPath: string | undefined,
  index: number
): JsonNode {
  const enhancedType = detectEnhancedType(value, key);
  const isLeaf = checkIfLeafNode(value);

  return {
    index,
    key,
    jsonType: enhancedType,
    metadata : generateJsonMetadata(value, enhancedType),
    path,
    depth,
    parentPath,
    isLeaf
  };
}

/**
 * Analyzes children of objects and arrays recursively
 */
function analyzeChildrenRecursive(
  value: JsonValue,
  parentPath: string,
  depth: number,
  nodes: JsonNode[],
  state: { currentIndex: number; maxDepth: number }
): void {
  if (value === null || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    // Analyze array elements
    analyzeArrayElements(value, parentPath, depth, nodes, state);
  } else {
    // Analyze object properties
    analyzeObjectProperties(value as JsonObject, parentPath, depth, nodes, state);
  }
}

/**
 * Analyzes all elements in an array
 */
function analyzeArrayElements(
  array: JsonArray,
  parentPath: string,
  depth: number,
  nodes: JsonNode[],
  state: { currentIndex: number; maxDepth: number }
): void {
  array.forEach((item, index) => {
    analyzeValueRecursive(
      item,
      `${parentPath}[${index}]`,
      index.toString(),
      depth + 1,
      parentPath,
      nodes,
      state
    );
  });
}

/**
 * Analyzes all properties in an object
 */
function analyzeObjectProperties(
  obj: JsonObject,
  parentPath: string,
  depth: number,
  nodes: JsonNode[],
  state: { currentIndex: number; maxDepth: number }
): void {
  Object.entries(obj).forEach(([childKey, childValue]) => {
    analyzeValueRecursive(
      childValue,
      `${parentPath}.${childKey}`,
      childKey,
      depth + 1,
      parentPath,
      nodes,
      state
    );
  });
}

// =============================================================================
// TYPE DETECTION FUNCTIONS
// =============================================================================

/**
 * Main type detection function - determines the enhanced type of any JSON value
 */
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

/**
 * Detects enhanced types for primitive values (string, number, boolean)
 */
function detectPrimitiveType(value: string | number | boolean, key: string): ExtraDataTypes {
  const stringValue = String(value);
  const keyLower = key.toLowerCase();

  // Check for specific patterns in order of priority
  const detectedType = 
    detectUrlType(stringValue) ||
    detectEmailType(stringValue) ||
    detectUuidType(stringValue) ||
    detectDateTimeType(value, stringValue) ||
    detectColorType(stringValue) ||
    detectVersionType(stringValue, keyLower) ||
    detectNetworkType(stringValue) ||
    detectEncodingType(stringValue) ||
    detectPersonalDataType(stringValue) ||
    detectPathType(stringValue, keyLower);

  // Return detected specific type or fall back to basic type
  return detectedType || (typeof value as 'string' | 'number' | 'boolean');
}

/**
 * Checks if a node is a leaf (has no children)
 */
function checkIfLeafNode(value: JsonValue): boolean {
  if (value === null) return true;
  if (typeof value !== 'object') return true;
  if (Array.isArray(value)) return value.length === 0;
  return Object.keys(value as JsonObject).length === 0;
}

/**
 * Formats display value based on detected type
 */
function generateJsonMetadata(value: JsonValue, type: ExtraDataTypes): JsonNodeMetadata {
  if (value === null) {
    return {
      jsonValue: null, // Keep as null, not string
      dataType: 'null',
    };
  }
  
  if (typeof value !== 'object') {
    switch (type) {
      case 'timestamp':
        return {
          jsonValue: new Date(value as number).toISOString(),
          dataType: 'timestamp',
        };
      default:
        return {
          jsonValue: value, // Keep original value
          dataType: type
        };
    }
  }

  // For objects and arrays, keep the actual structure
  return {
    jsonValue: value, // Don't stringify - keep as object/array
    dataType: type,
  };
}
// =============================================================================
// SPECIFIC TYPE DETECTION HELPERS
// =============================================================================

function detectUrlType(str: string): ExtraDataTypes | null {
  try {
    const url = new URL(str);
    return ['http:', 'https:', 'ftp:', 'ws:', 'wss:'].includes(url.protocol) ? 'url' : null;
  } catch {
    return null;
  }
}

function detectEmailType(str: string): ExtraDataTypes | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str) ? 'email' : null;
}

function detectUuidType(str: string): ExtraDataTypes | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? 'uuid' : null;
}

function detectDateTimeType(value: any, str: string): ExtraDataTypes | null {
  if (typeof value === 'number' && isTimestamp(value)) return 'timestamp';
  if (isDate(str)) return 'date';
  if (isDateTime(str)) return 'datetime';
  return null;
}

function detectColorType(str: string): ExtraDataTypes | null {
  if (isHexColor(str)) return 'hex-color';
  if (isRgbColor(str)) return 'rgb-color';
  if (isRgbaColor(str)) return 'rgba-color';
  return null;
}

function detectVersionType(str: string, keyLower: string): ExtraDataTypes | null {
  if (isVersion(str) || keyLower.includes('version')) return 'version';
  if (isSemanticVersion(str)) return 'semantic-version';
  return null;
}

function detectNetworkType(str: string): ExtraDataTypes | null {
  if (isIpAddress(str)) {
    return str.includes(':') ? 'ipv6' : 'ipv4';
  }
  return null;
}

function detectEncodingType(str: string): ExtraDataTypes | null {
  if (isBase64(str)) return 'base64';
  if (isJsonString(str)) return 'json';
  return null;
}

function detectPersonalDataType(str: string): ExtraDataTypes | null {
  if (isPhoneNumber(str)) return 'phone';
  if (isCreditCard(str)) return 'credit-card';
  return null;
}

function detectPathType(str: string, keyLower: string): ExtraDataTypes | null {
  if (isFilePath(str) || keyLower.includes('path')) return 'file-path';
  if (isDirectoryPath(str)) return 'directory-path';
  return null;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

function isTimestamp(value: number): boolean {
  // Reasonable timestamp range (2000-01-01 to 2100-01-01)
  return value > 946684800000 && value < 4102444800000;
}

function isDate(str: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(str)) return false;
  const date = new Date(str);
  return !isNaN(date.getTime());
}

function isDateTime(str: string): boolean {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/;
  if (!dateTimeRegex.test(str)) return false;
  const date = new Date(str);
  return !isNaN(date.getTime());
}

function isHexColor(str: string): boolean {
  return /^#?([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(str);
}

function isRgbColor(str: string): boolean {
  return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(str);
}

function isRgbaColor(str: string): boolean {
  return /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(str);
}

function isVersion(str: string): boolean {
  return /^v?\d+(\.\d+)*([+-][\w.-]*)?$/i.test(str);
}

function isSemanticVersion(str: string): boolean {
  return /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(str);
}

function isIpAddress(str: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(str)) {
    const parts = str.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(str);
}

function isBase64(str: string): boolean {
  if (str.length % 4 !== 0) return false;
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

function isJsonString(str: string): boolean {
  if (typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function isPhoneNumber(str: string): boolean {
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(str.replace(/\s/g, ''));
}

function isCreditCard(str: string): boolean {
  const cleaned = str.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  return luhnCheck(cleaned);
}

function luhnCheck(str: string): boolean {
  let sum = 0;
  let isEven = false;
  for (let i = str.length - 1; i >= 0; i--) {
    let digit = parseInt(str[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function isFilePath(str: string): boolean {
  return /^([a-zA-Z]:)?[\\/]?([^\\/:\*\?"<>\|]+\\)*[^\\/:\*\?"<>\|]+(\.[^\\/:\*\?"<>\|]+)?$/.test(str);
}

function isDirectoryPath(str: string): boolean {
  return /^([a-zA-Z]:)?[\\/]?([^\\/:\*\?"<>\|]+\\)+[^\\/:\*\?"<>\|]*$/.test(str);
}

// =============================================================================
// UTILITY FUNCTIONS FOR WORKING WITH RESULTS
// =============================================================================

 export function printEnhancedAnalysis(result: JsonParseResult | { error: string }): void {
  if ('error' in result) {
    console.error('Error:', result.error);
    return;
  }

  console.log('=== Enhanced JSON Analysis ===');
  console.log(`Total Nodes: ${result.summary.totalNodes}`);
  console.log(`Max Depth: ${result.summary.maxDepth}`);
  console.log('\nType Summary:');
  Object.entries(result.summary.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log('\nDetailed Nodes (first 10):');
  console.table(result.nodes.slice(0, 10).map(node => ({
    Index: node.index,
    Key: node.key,
    Type: node.metadata.dataType,
    Path: node.path,
    Depth: node.depth,
    'JSON Value': node.metadata.jsonValue,
    "JSON Type": node.metadata.dataType,
    'Is Leaf': node.isLeaf,
    'Parent Path': node.parentPath || 'N/A'
  })));

  console.log('\nOriginal Structure:');
  console.log(JSON.stringify(result.summary.structure, null, 2));
}

 function getNodesByType(result: JsonParseResult, type: ExtraDataTypes): JsonNode[] {
  return result.nodes.filter(node => node.metadata.dataType === type);
}

function findNodeByPath(result: JsonParseResult, path: string): JsonNode | undefined {
  return result.nodes.find(node => node.path === path);
}

function getEnhancedAnalysis(
  result: JsonParseResult | { error: string }
): EnhancedAnalysis {
  // Handle error case
  if ("error" in result) {
    return { 
      summary: { totalNodes: 0, maxDepth: 0, byType: {} }, 
      detailedNodes: [], 
      originalStructure: null,
      error: result.error 
    };
  }

  // Build structured analysis object
  const analysis: EnhancedAnalysis = {
    summary: {
      totalNodes: result.summary.totalNodes,
      maxDepth: result.summary.maxDepth,
      byType: result.summary.byType,
    },
    detailedNodes: result.nodes.slice(0, 10).map((node) => ({
      Index: node.index,
      Key: node.key,
      Type: node.metadata.dataType,
      Path: node.path,
      Depth: node.depth,
      JSONValue: node.metadata.jsonValue,
      JSONType: node.metadata.dataType,
      IsLeaf: node.isLeaf,
      ParentPath: node.parentPath || "N/A",
    })),
    originalStructure: result.summary.structure,
  };

  return analysis;
}


// =============================================================================
// USAGE EXAMPLE
// =============================================================================




console.log("=== Enhanced JSON Analysis ===");
const enhancedAnalysis = processJsonData(exampleJsonString);
printEnhancedAnalysis(enhancedAnalysis);

if (!('error' in enhancedAnalysis)) {
  console.log("\n=== Versions Found ===");
  const versions = getNodesByType(enhancedAnalysis, 'version');
  console.table(versions.map(version => ({ Path: version.path, Value: version.metadata.jsonValue })));

  console.log("\n=== URLs Found ===");
  const urls = getNodesByType(enhancedAnalysis, 'url');
  console.table(urls.map(url => ({ Path: url.path, Value: url.metadata.jsonValue })));
}



export {
  processJsonData,
  getNodesByType,
  findNodeByPath,
  getEnhancedAnalysis,
  parseAndValidateInput
}
