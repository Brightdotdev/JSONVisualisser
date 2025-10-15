import { ReactFlowNode } from "@/types/JsonNodeTypes";
import { Edge } from "@xyflow/react";


export const handleNodeExpand = async (
    jsonData: any, 
    parentPath: string, 
    nodeKey: string, 
    nodeType: any,
    setIsLayoutAnimating : (value: boolean) => void,
    addProcessedChildNode : (jsonData: any, parentPath: string, nodeKey: string, nodeType: any) => any,
    applyTreeLayout : (nodes: ReactFlowNode[], edges: Edge[]) => ReactFlowNode[],
    handleZoomToNode : (nodeId: string) => void,
    nodes : ReactFlowNode[],
    edges : Edge[],
    setNodes : (nodes: ReactFlowNode[]) => void
  ) => {
    setIsLayoutAnimating(true);
    
    try {
      const newNode = addProcessedChildNode(jsonData, parentPath, nodeKey, nodeType);
      const newNodeId = newNode.id;
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges];
      const laidOutNodes = applyTreeLayout(updatedNodes, updatedEdges);
      setNodes(laidOutNodes);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      handleZoomToNode(newNodeId);
    } catch (error) {
      console.error('Error expanding node:', error);
    } finally {
      setIsLayoutAnimating(false);
    }
  }