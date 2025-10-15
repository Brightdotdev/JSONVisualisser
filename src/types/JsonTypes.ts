


export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue; }
export interface JsonArray extends Array<JsonValue> {}

// Enhanced data types for better categorization
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


  export interface JsonNodeMetadata  {
    dataType : ExtraDataTypes;
    jsonValue : any
  }
// Structure for each analyzed node
export type JsonNode = {
  index: number;
  key: string;
  jsonType: string;
  metadata : JsonNodeMetadata;
  path: string;
  depth: number;
  parentPath?: string;
  isLeaf: boolean;

};

export type JsonParseResult = {
  nodes: JsonNode[];
  summary: {
    totalNodes: number;
    byType: Record<ExtraDataTypes, number>;
    maxDepth: number;
    structure: any;
  };
};


export type EnhancedAnalysis = {
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


export interface JsonTab {
  id : string;
  slug : string;
  fileName : string;
  jsonData : JsonValue
  createdAt : Date
} 