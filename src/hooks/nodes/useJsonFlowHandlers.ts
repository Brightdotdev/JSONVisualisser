import { useCallback, useState, useRef } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';
import { ExtraDataTypes, JsonValue, JsonObject } from '@/types/JsonTypes';
import { ReactFlowNode } from '@/types/JsonNodeTypes';

export const useJsonFlowHandlers = (
  reactFlowInstance: ReturnType<typeof useReactFlow>,
  nodes: ReactFlowNode[],
  edges: Edge[],
  jsonData: JsonValue,
  onNodeExpand: (jsonData: any, parentPath: string, nodeKey: string, nodeType: ExtraDataTypes) => void,
  detectEnhancedType: (data: any) => ExtraDataTypes,
  setNodes: (nodes: ReactFlowNode[]) => void,
  applyTreeLayout: (nodes: ReactFlowNode[], edges: Edge[]) => ReactFlowNode[]
) => {
  const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);
  // Track which nodes the user has manually moved
  const userModifiedNodes = useRef<Set<string>>(new Set());

  // Track when user drags a node
  const handleNodeDrag = useCallback((event: any, node: ReactFlowNode) => {
    userModifiedNodes.current.add(node.id);
  }, []);

  const handleZoomToNode = useCallback((nodeId: string) => {
    if (!reactFlowInstance) return;

    try {
      const node = reactFlowInstance.getNode(nodeId);
      if (!node) {
        console.log(`Node ${nodeId} not found for zoom`);
        return;
      }

      console.log(`Zooming to node: ${nodeId}`, node.position);

      // Get the viewport dimensions
      const viewport = reactFlowInstance.getViewport();
      const container = reactFlowInstance.getViewport();
      
      // Calculate the center of the node with some padding
      const nodeWidth = node.width || 250;
      const nodeHeight = node.height || 120;
      const nodeCenterX = node.position.x + nodeWidth / 2;
      const nodeCenterY = node.position.y + nodeHeight / 2;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate zoom level that shows the node comfortably
      const zoomX = viewportWidth / (nodeWidth * 1.8);
      const zoomY = viewportHeight / (nodeHeight * 1.8);
      const targetZoom = Math.min(0.9, Math.max(0.4, Math.min(zoomX, zoomY)));

      // Calculate the position to center the node
      const targetX = -nodeCenterX + (viewportWidth / 2) / targetZoom;
      const targetY = -nodeCenterY + (viewportHeight / 2) / targetZoom;

      reactFlowInstance.setViewport(
        { x: targetX, y: targetY, zoom: targetZoom },
        { duration: 800 }
      );

    } catch (error) {
      console.error('Error zooming to node:', error);
      // Fallback to fitView
      reactFlowInstance.fitView({
        nodes: [{ id: nodeId }],
        duration: 600,
        padding: 0.4,
      });
    }
  }, [reactFlowInstance]);

 // In useJsonFlowHandlers.ts - update handleFocusNode to return boolean
const handleFocusNode = useCallback((nodeId: string): boolean => {
  if (!reactFlowInstance) return false;

  try {
    const node = reactFlowInstance.getNode(nodeId);
    if (!node) {
      console.log(`Node ${nodeId} not found in React Flow instance`);
      return false;
    }

    console.log(`Focusing on node: ${nodeId}`, node.position);

    // Get the viewport dimensions
    const viewport = reactFlowInstance.getViewport();
    const container = reactFlowInstance.getViewport();
    
    // Calculate the center of the node with some padding
    const nodeWidth = node.width || 250;
    const nodeHeight = node.height || 120;
    const nodeCenterX = node.position.x + nodeWidth / 2;
    const nodeCenterY = node.position.y + nodeHeight / 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate zoom level that shows the node comfortably
    const zoomX = viewportWidth / (nodeWidth * 1.8);
    const zoomY = viewportHeight / (nodeHeight * 1.8);
    const targetZoom = Math.min(0.9, Math.max(0.4, Math.min(zoomX, zoomY)));

    // Calculate the position to center the node
    const targetX = -nodeCenterX + (viewportWidth / 2) / targetZoom;
    const targetY = -nodeCenterY + (viewportHeight / 2) / targetZoom;

    reactFlowInstance.setViewport(
      { x: targetX, y: targetY, zoom: targetZoom },
      { duration: 800 }
    );

    return true; // ✅ Return true when successful

  } catch (error) {
    console.error('Error focusing on node:', error);
    return false; // ✅ Return false when failed
  }
}, [reactFlowInstance]);

  const handleFitView = useCallback((options?: { duration?: number; padding?: number }) => {
    if (!reactFlowInstance) return;

    try {
      const fitOptions = {
        duration: options?.duration ?? 800,
        padding: options?.padding ?? 0.2,
        includeHiddenNodes: false,
        minZoom: 0.3,
        maxZoom: 1.2,
        ...options
      };

      reactFlowInstance.fitView(fitOptions);

    } catch (error) {
      console.error('Error fitting view:', error);
    }
  }, [reactFlowInstance]);

  const handleExpandToNode = useCallback(async (path: string) => {
    console.log(`Starting expansion to path: ${path}`);
    
    if (!jsonData || path === 'root') {
      handleZoomToNode(path);
      return;
    }

    const pathParts = path.split('.').filter(part => part !== 'root' && part !== '');
    let currentData: JsonValue = jsonData;
    let currentPath = 'root';

    // First try to zoom to existing node
    const nodeExists = nodes.some(node => node.id === path);
    if (nodeExists) {
      console.log(`Node ${path} already exists, zooming...`);
      handleZoomToNode(path);
      return;
    }

    console.log(`Node ${path} doesn't exist, expanding path...`);

    // Expand the path
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isArrayIndex = part.startsWith('[') && part.endsWith(']');
      const nodePath = currentPath === 'root' ? `root.${part}` : `${currentPath}.${part}`;
      
      const pathExists = nodes.some(node => node.id === nodePath);
      
      if (!pathExists) {
        console.log(`Expanding node: ${nodePath}`);
        
        let nodeData: JsonValue;
        if (isArrayIndex) {
          const index = parseInt(part.slice(1, -1), 10);
          nodeData = Array.isArray(currentData) ? currentData[index] ?? null : null;
        } else {
          nodeData = typeof currentData === 'object' && currentData !== null 
            ? (currentData as JsonObject)[part] ?? null
            : null;
        }

        if (nodeData !== undefined && nodeData !== null) {
          const nodeType = detectEnhancedType(nodeData);
          const parentPath = currentPath;
          
          await new Promise<void>(resolve => {
            onNodeExpand(nodeData, parentPath, part, nodeType);
            setTimeout(resolve, 300);
          });
        }
      }

      // Update for next iteration
      currentPath = nodePath;
      if (isArrayIndex) {
        const index = parseInt(part.slice(1, -1), 10);
        currentData = Array.isArray(currentData) ? currentData[index] : currentData;
      } else {
        currentData = typeof currentData === 'object' && currentData !== null 
          ? (currentData as JsonObject)[part] 
          : currentData;
      }
    }

    // Final zoom with retry
    let retryCount = 0;
    const maxRetries = 5;
    
    const finalZoom = () => {
      setTimeout(() => {
        const node = reactFlowInstance?.getNode(path);
        if (node) {
          console.log(`Final zoom to: ${path}`, node.position);
          handleZoomToNode(path);
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retry ${retryCount} for node: ${path}`);
          finalZoom();
        } else {
          console.warn(`Failed to find node after expansion: ${path}`);
          handleFitView();
        }
      }, 400);
    };

    finalZoom();
  }, [jsonData, nodes, handleZoomToNode, onNodeExpand, handleFitView, reactFlowInstance, detectEnhancedType]);

  // Smart layout that preserves user modifications
  const handleReLayout = useCallback(() => {
    setIsLayoutAnimating(true);
    
    try {
      // Apply layout to get new positions
      const layoutNodes = applyTreeLayout(nodes, edges);
      
      // Merge layout with user modifications
      const mergedNodes = nodes.map(node => {
        // If user modified this node, keep its position
        if (userModifiedNodes.current.has(node.id)) {
          return node;
        }
        // Otherwise use layout position
        const layoutNode = layoutNodes.find(n => n.id === node.id);
        return layoutNode ? { ...node, position: layoutNode.position } : node;
      });

      setNodes(mergedNodes);
      
      // Fit view after a delay to ensure nodes are rendered
      setTimeout(() => {
        handleFitView({ duration: 1000, padding: 0.15 });
        setIsLayoutAnimating(false);
      }, 800);
    } catch (error) {
      console.error('Error during layout:', error);
      setIsLayoutAnimating(false);
    }
  }, [nodes, edges, applyTreeLayout, setNodes, handleFitView]);

  // Reset user modifications (optional, for clear button)
  const resetUserModifications = useCallback(() => {
    userModifiedNodes.current.clear();
  }, []);

  return {
    isLayoutAnimating,
    setIsLayoutAnimating,
    handleZoomToNode,
    handleFocusNode,
    handleFitView,
    handleExpandToNode,
    handleReLayout,
    handleNodeDrag,
    resetUserModifications,
  };
};