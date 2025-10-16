import { ExtraDataTypes, JsonObject } from "@/types/JsonTypes";
import { useCallback, useEffect, useState } from "react";
import { useJsonTabs } from "./useJsonTabs";
import { generateJsonSlug } from "@/utils/slugGenerator";
import { processJsonLevel } from "@/handlers/JsonLevelHandler";
import { ReactFlowNode, ReactFlowStateTab } from "@/types/JsonNodeTypes";
import { Edge } from "@xyflow/react";
import { TreeLayout } from "@/utils/treelayout";



 const getNodeType = (type: ExtraDataTypes): string => {
    switch(type) {
      case "array": return "arrayNode";
      case "object": return "jsonNode";
      default: return "primitiveNode";
    }
  }

  

const processChildNode = (
  jsonData: any, 
  parentPath: string, 
  nodeKey: string, 
  childNodeType: ExtraDataTypes
) => {
  const childPath = `${parentPath}.${nodeKey}`;
  
  // Use the actual node IDs for handles
  const parentOutputHandle = `${parentPath}-output`;
  const childInputHandle = `${childPath}-input`; // ← Use child's input handle

  const processedChildNode = processJsonLevel(jsonData, childPath, childPath);

  const newNodeData: ReactFlowNode = {
    id: childPath,
    type: getNodeType(childNodeType),
    position: { x: Math.random() * 400, y: Math.random() * 400 },
    data: {
      processedJsonData: processedChildNode,
    }   
  };

  const newEdgeData: Edge = {
    id: `edge-${parentPath}-${nodeKey}`,
    source: parentPath,
    target: childPath,
    sourceHandle: parentOutputHandle,   
    targetHandle: childInputHandle  };


  return { newNode: newNodeData, newEdge: newEdgeData };
}

export const useJsonState = (tabSlug: string) => {
  const { getJsonTab } = useJsonTabs();

   const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });



  const [reactFlowState, setReactFlowState] = useState<ReactFlowStateTab[]>(() => {  
    if (typeof window === "undefined") return [];
    
    try {
      const jsonStates = localStorage.getItem("json-states");
      return jsonStates ? JSON.parse(jsonStates) : [];
    } catch (error) {
      console.error("Failed to parse JSON states from localStorage:", error);
      return [];
    }
  });

  // Persist to localStorage
   useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("json-states", JSON.stringify(reactFlowState));
    }, 500); // Debounce localStorage writes
    return () => clearTimeout(timeoutId);
  }, [reactFlowState]);

  // Initial mount persistence
  useEffect(() => {
    localStorage.setItem("json-states", JSON.stringify(reactFlowState));
  }, []);


 
  const addNodesAndEdges = useCallback((
    newNodes: ReactFlowNode[], 
    newEdges: Edge[]
  ) => {
    setReactFlowState(prevState =>
      prevState.map(state => {
        if (state.tabSlug !== tabSlug) return state;

        const existingNodeIds = new Set(state.nodes.map(node => node.id));
        const existingEdgeIds = new Set(state.edges.map(edge => edge.id));

        const filteredNewNodes = newNodes.filter(node => !existingNodeIds.has(node.id));
        const filteredNewEdges = newEdges.filter(edge => !existingEdgeIds.has(edge.id));

        return {
          ...state,
          nodes: [...state.nodes, ...filteredNewNodes],
          edges: [...state.edges, ...filteredNewEdges]
        };
      })
    );
  }, [tabSlug]);

  const addNodeWithEdge = useCallback((
    sourceNodeId: string, 
    newNode: ReactFlowNode, 
    edgeOptions?: Partial<Edge>
  ) => {
    const newEdge: Edge = {
      id: `edge-${sourceNodeId}-${newNode.id}`,
      source: sourceNodeId,
      target: newNode.id,
      sourceHandle: 'source',
      targetHandle: 'target',
      ...edgeOptions
    };
    
    addNodesAndEdges([newNode], [newEdge]);
  }, [addNodesAndEdges]);


//   add a new tab to thee state management
  const addToJsonState = useCallback((jsonState: ReactFlowStateTab) => {
    setReactFlowState(prevState => {
      const existingIndex = prevState.findIndex(state => state.tabSlug === jsonState.tabSlug);
      if (existingIndex >= 0) {
        const updated = [...prevState];
        updated[existingIndex] = jsonState;
        return updated;
      }
      return [...prevState, jsonState];
    });
  }, []);



  const getJsonState = useCallback((): ReactFlowStateTab | { error: string } => {
    const jsonState = reactFlowState.find(state => state.tabSlug === tabSlug);
    
    if (!jsonState) {
      const jsonTab = getJsonTab(tabSlug);
      
      if (!jsonTab) return { error: "Json Tab does not exist" };

    //   return initializeWithExpandedView(jsonTab.jsonData);


       const rootProcessed = processJsonLevel(jsonTab.jsonData, 'root', 'root');
    const rootNode: ReactFlowNode = {
      id: "root",
      type: "jsonNode",
      position: { x: 0, y: 0 },
      data: {
        processedJsonData: rootProcessed,
      }   
    };

    const newStateTab: ReactFlowStateTab = {
      tabSlug,
      jsonSlug: generateJsonSlug(jsonTab.jsonData),
      jsonData: jsonTab.jsonData,
      nodes: [rootNode], // Just the root node
      edges: [] // No edges for now
    };
    
    addToJsonState(newStateTab);
    return newStateTab;
  }
  
  

    return jsonState;   
  }, [reactFlowState, getJsonTab, tabSlug]);



  const updateTabNodes = useCallback((nodes: ReactFlowNode[]) => {
    setReactFlowState(prevState =>
      prevState.map(state =>
        state.tabSlug === tabSlug
          ? { ...state, nodes }
          : state
      )
    );
  }, [tabSlug]);


  const removeJsonState = useCallback(() => {
    setReactFlowState(prevState =>
      prevState.filter(state => state.tabSlug !== tabSlug)
    );
  }, [tabSlug]);


  // Apply tree layout to nodes
  const applyTreeLayout = useCallback((nodes: ReactFlowNode[], edges: Edge[]) => {
    return TreeLayout.calculateResponsiveLayout(nodes, edges, containerSize);
  }, [containerSize]);

  // Update node positions with layout
  const updateNodesWithLayout = useCallback((nodes: ReactFlowNode[], edges: Edge[]) => {
    const laidOutNodes = applyTreeLayout(nodes, edges);
    updateTabNodes(laidOutNodes);
    return laidOutNodes;
  }, [applyTreeLayout, updateTabNodes]);

const addProcessedChildNode = useCallback((
  jsonData: any, 
  parentPath: string, 
  nodeKey: string, 
  childNodeType: ExtraDataTypes
) => {
  const { newNode, newEdge } = processChildNode(
    jsonData, 
    parentPath, 
    nodeKey, 
    childNodeType
  );

  // Add the new node and edge
  addNodeWithEdge(parentPath, newNode, newEdge);
  
  // Return the new node ID for focusing
  return newNode;
}, [processChildNode, addNodeWithEdge]);

     

     

  const validateConnections = useCallback(() => {
    const state = getJsonState();
    if ('error' in state) return { valid: false, error: state.error };

    const issues: string[] = [];
    
    state.edges.forEach(edge => {
      const sourceExists = state.nodes.some(node => node.id === edge.source);
      const targetExists = state.nodes.some(node => node.id === edge.target);
      
      if (!sourceExists) {
        issues.push(`Edge ${edge.id}: Source node "${edge.source}" not found`);
      }
      if (!targetExists) {
        issues.push(`Edge ${edge.id}: Target node "${edge.target}" not found`);
      }
    });

    state.nodes.forEach(node => {
      const hasIncomingEdges = state.edges.some(edge => edge.target === node.id);
      const hasOutgoingEdges = state.edges.some(edge => edge.source === node.id);
      
      if (node.id !== 'root' && !hasIncomingEdges) {
        issues.push(`Node ${node.id}: No incoming edges (orphaned node)`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      stats: {
        nodes: state.nodes.length,
        edges: state.edges.length,
        orphanedNodes: state.nodes.filter(node => 
          node.id !== 'root' && !state.edges.some(edge => edge.target === node.id)
        ).length
      }
    };
  }, [getJsonState]);



  const getTabNodes = useCallback(() => {
    const jsonState = getJsonState();
    if ("error" in jsonState) return [];
    return jsonState.nodes;
  }, [getJsonState]);

  const getTabEdges = useCallback((): Edge[] => {
    const jsonState = getJsonState();
    if ("error" in jsonState) return [];
    return jsonState.edges;
  }, [getJsonState]);

  // ADD THESE MISSING METHODS:
  const getNodeEdges = useCallback((nodeId: string): Edge[] => {
    const edges = getTabEdges();
    return edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
  }, [getTabEdges]);

  const getConnectedNodes = useCallback((nodeId: string): string[] => {
    const edges = getNodeEdges(nodeId);
    const connectedNodes = new Set<string>();
    
    edges.forEach(edge => {
      if (edge.source === nodeId) connectedNodes.add(edge.target);
      if (edge.target === nodeId) connectedNodes.add(edge.source);
    });
    
    return Array.from(connectedNodes);
  }, [getNodeEdges]);

  // Get current state for easy access
  const currentState = getJsonState();
  const currentNodes = "error" in currentState ? [] : currentState.nodes;
  const currentEdges = "error" in currentState ? [] : currentState.edges;

  return {
    // Current state
    currentState: "error" in currentState ? null : currentState,
    currentNodes,
    currentEdges,
    currentError: "error" in currentState ? currentState.error : null,
      jsonData: currentState && !('error' in currentState) ? currentState.jsonData : null,

    // Core methods
    getJsonState,
    updateTabNodes,
    removeJsonState,
    
    // Node/Edge access
    getTabNodes,
    getTabEdges,
    getNodeEdges,
    getConnectedNodes,
    
    // Node/Edge management
    addNodesAndEdges,
    addNodeWithEdge,
    addProcessedChildNode,
    

    // Debugging
    validateConnections,
    // layout and stuff
    applyTreeLayout,
    updateNodesWithLayout,
setContainerSize,
containerSize,
    allStates: reactFlowState,
  };
};