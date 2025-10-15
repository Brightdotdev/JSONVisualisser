import { Background, BackgroundVariant, Controls, Edge, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExtraDataTypes, JsonArray, JsonObject, JsonTab, JsonValue } from "@/types/JsonTypes";
import { useJsonState } from "@/hooks/useJsonState";
import { Button } from "../ui/button";
import PerformanceDebugger from "../elements/PerformanceDebugger";
import { JsonNode } from "../nodes/JsonNode";
import { detectEnhancedType } from "@/lib/utitlityTypeDetectors";
import { ReactFlowNode } from "@/types/JsonNodeTypes";

import { AdvancedSearchPanel } from "../elements/SearchPannel";
import { SearchMatch } from "@/types/Search";


export const ReactFlowGraphCanvas = ({ jsonTab }: { jsonTab: JsonTab }) => {
  const { 
    jsonData,
    currentNodes, 
    currentEdges, 
    addProcessedChildNode, 
    removeJsonState,
    applyTreeLayout,
  } = useJsonState(jsonTab.slug);

  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);
  
  // Search state
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  // Use hook state directly
  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(currentEdges);

  const nodeTypes = useMemo(() => ({
    jsonNode: JsonNode,
    arrayNode: JsonNode,
    primitiveNode: JsonNode,
  }), []);

  // Sync with current state
  useEffect(() => {
    if (currentNodes.length !== nodes.length || currentEdges.length !== edges.length) {
      setNodes(currentNodes);
      setEdges(currentEdges);
    }
  }, [currentNodes, currentEdges, nodes.length, edges.length]);

  // Apply initial layout on mount
  useEffect(() => {
    if (nodes.length > 0 && !isLayoutAnimating) {
      const timer = setTimeout(() => {
        const laidOutNodes = applyTreeLayout(nodes, edges);
        setNodes(laidOutNodes);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleReLayout = useCallback(() => {
    setIsLayoutAnimating(true);
    const newlyLaidOutNodes = applyTreeLayout(nodes, edges);
    setNodes(newlyLaidOutNodes);
    
    setTimeout(() => {
      reactFlowInstance?.fitView({ 
        duration: 800,
        padding: 0.15 
      });
      setIsLayoutAnimating(false);
    }, 600);
  }, [nodes, edges, applyTreeLayout, reactFlowInstance]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ 
        duration: 400,
        padding: 0.1 
      });
    }
  }, [reactFlowInstance]);

  const handleNodeExpand = useCallback(async (
    jsonData: any, 
    parentPath: string, 
    nodeKey: string, 
    nodeType: ExtraDataTypes
  ) => {
    setIsLayoutAnimating(true);
    
    try {
      // 1. Add the new node first
      const newNode = addProcessedChildNode(jsonData, parentPath, nodeKey, nodeType);
      const newNodeId = newNode.id;
      
      // 2. Wait for React to process the state update
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 3. Get the latest nodes and edges from state instead of closure
      const updatedNodes = [...currentNodes, newNode];
      const updatedEdges = [...currentEdges];
      
      // 4. Apply layout to all nodes
      const laidOutNodes = applyTreeLayout(updatedNodes, updatedEdges);
      setNodes(laidOutNodes);
      
      // 5. Wait for React Flow to render and layout to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 6. Use fitView instead of setCenter for better centering
      if (reactFlowInstance) {
        // Focus on the new node specifically
        reactFlowInstance.fitView({
          nodes: [{ id: newNodeId }],
          duration: 800,
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.2
        });
      }
    } catch (error) {
      console.error('Error expanding node:', error);
    } finally {
      setIsLayoutAnimating(false);
    }
  }, [addProcessedChildNode, currentNodes, currentEdges, applyTreeLayout, reactFlowInstance, setNodes]);

  const handleJsonRemove = () => {
    removeJsonState();
    handleFitView();
  }

  // Search handlers
  const handleSearchResults = useCallback((results: SearchMatch[]) => {
    setSearchResults(results);
  }, []);

  const handleHighlightedNodes = useCallback((nodeIds: Set<string>) => {
    setHighlightedNodes(nodeIds);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setHighlightedNodes(new Set());
  }, []);

  const handleZoomToNode = useCallback((nodeId: string) => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({
        nodes: [{ id: nodeId }],
        duration: 600,
        padding: 0.3,
      });
    }
  }, [reactFlowInstance]);

  const handleExpandToNode = useCallback((path: string) => {
    const pathParts = path.split('.').filter(part => part !== 'root');
    if (jsonData === null) return;

    let currentPath = 'root';
    let currentData: JsonValue = jsonData;
    
    const expandPath = async (index: number) => {
      if (index >= pathParts.length) return;
      
      const currentPart = pathParts[index];
      currentPath = `${currentPath}.${currentPart}`;
      
      const canAccessProperty = (data: JsonValue, key: string): data is JsonObject | JsonArray => {
        if (data === null) return false;
        if (typeof data === 'object') {
          if (Array.isArray(data)) {
            const index = parseInt(key, 10);
            return !isNaN(index) && index >= 0 && index < data.length;
          } else {
            return key in data;
          }
        }
        return false;
      };

      if (canAccessProperty(currentData, currentPart)) {
        const nextData = Array.isArray(currentData) 
          ? currentData[parseInt(currentPart, 10)]
          : (currentData as JsonObject)[currentPart];
        
        if (nextData !== undefined) {
          const nodeType = detectEnhancedType(nextData);
          addProcessedChildNode(nextData, currentPath.replace(`.${currentPart}`, ''), currentPart, nodeType);
          currentData = nextData;
          setTimeout(() => expandPath(index + 1), 300);
        }
      }
    };
    
    expandPath(0);
  }, [jsonData, addProcessedChildNode]);

  // Enhanced nodes with search highlighting
  const enhancedNodes = useMemo(() => {
    if (!nodes.length) return [];

    return nodes.map(node => {
      const nodeSearchResults = searchResults.filter(result => result.nodeId === node.id);
      const searchMatches = nodeSearchResults.flatMap(result => result.matches);
      const isHighlighted = highlightedNodes.has(node.id);
      
      // Calculate if this node is an ancestor of any highlighted node
      const isAncestorHighlighted = Array.from(highlightedNodes).some(highlightedId => 
        highlightedId !== node.id && highlightedId.startsWith(node.id)
      );

      return {
        ...node,
        data: {
          ...node.data,
          processedJsonData: node.data.processedJsonData,
          onNodeExpand: handleNodeExpand,
          isHighlighted,
          isAncestorHighlighted,
          searchMatches,
          isNewNode: node.data?.isNewNode || false
        }
      } as ReactFlowNode;
    });
  }, [nodes, searchResults, highlightedNodes, handleNodeExpand]);

  return (
    <div ref={containerRef} className="h-[100vh] w-[100vw] relative">
      <ReactFlow
        colorMode="dark"
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={true}
        panOnScroll={true}
        panOnScrollSpeed={0.8}
        zoomOnScroll={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: "simplebezier",
          style: { 
            stroke: '#3b82f6',
            strokeWidth: 1.5,
          },
        }}
      >
        {/* Advanced Search Panel */}
        <AdvancedSearchPanel
          jsonData={jsonData}
          onSearchResults={handleSearchResults}
          onHighlightedNodes={handleHighlightedNodes}  
          onClearSearch={handleClearSearch}
        
          />

        {/* Control Buttons */}
        <div className="fixed top-5 right-5 z-50 flex gap-2">
          <Button 
            onClick={handleFitView}
            variant="outline"
            size="sm"
            disabled={isLayoutAnimating}
          >
            {isLayoutAnimating ? "⏳" : "🔍"} Fit View
          </Button>
          <Button 
            onClick={handleReLayout}
            variant="outline"
            size="sm"
            disabled={isLayoutAnimating}
          >
            {isLayoutAnimating ? "🔄 Arranging..." : "📐 Arrange"}
          </Button>
          <Button 
            onClick={handleJsonRemove} 
            variant="destructive"
            size="sm"
          >
            🗑️ Clear
          </Button>
        </div>

        <Background variant={BackgroundVariant.Dots} gap={30} />
        <Controls position="bottom-right" />
      </ReactFlow>

      {isLayoutAnimating && (
        <div className="fixed top-20 right-5 z-50 bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Arranging...
        </div>
      )}

  

      <PerformanceDebugger nodes={nodes} edges={edges} />
    </div>
  );
};