
import { Node, NodeProps } from "@xyflow/react";
import { ExtraDataTypes, JsonObject, JsonValue } from "./JsonTypes";
import { JsonNode } from "@/components/nodes/JsonNode";

export type NodeType = "jsonNode" | "arrayNode" | "primitiveNode";





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
  metadata: {
    dataType: ExtraDataTypes;
    jsonValue: any;
    isLeaf: boolean;
    childCount?: number;
  };
}

export const nodeTypes = {
  jsonNode: JsonNode,
  arrayNode: JsonNode,
  primitiveNode: JsonNode
};



export type ReactFlowNode  = Node <{processedJsonData: LevelAnalysisResult, 
    onNodeExpand?: (nodeData: any, parentPath: string, nodeKey: string, nodeType: ExtraDataTypes) => void;
  isNewNode?: boolean;
}>



export interface ReactFlowStateTab {
  tabSlug: string;
  jsonSlug: string;
  fileName  : string;
  jsonData: JsonValue;
  nodes: ReactFlowNode[];
  edges: any[];
}




