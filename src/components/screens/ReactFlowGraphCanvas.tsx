import { Background, BackgroundVariant, Edge, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ExtraDataTypes,  JsonTab} from "@/types/JsonTypes";
import { useJsonState } from "@/hooks/Reactflow/useJsonState";

import { JsonNode } from "../nodes/JsonNode";
import { ReactFlowNode } from "@/types/JsonNodeTypes";

import { useNodeLayout } from "@/hooks/Reactflow/useNodeLayout";

import ControlsNav from "../ReactFlowElements/ControlsNav";
import { JsonSearchCommand } from "../Search/JsonSearchCommand";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "../ui/button";



export const ReactFlowGraphCanvas = ({ jsonSlug }: { jsonSlug: string }) => {

  const reactFlowInstance = useReactFlow();

  const {
    currentState, 
    jsonData,
    currentNodes, 
    currentEdges, 
    containerSize,
    addProcessedChildNode, 
    removeJsonState,
    applyTreeLayout,
  } = useJsonState(jsonSlug);

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use hook state directly
  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(currentEdges);


  const {handleReLayout, handleFitView , isLayoutAnimating, setIsLayoutAnimating} = useNodeLayout({nodes, edges,containerSize,reactFlowInstance,setNodes});


  
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




  const handleNodeExpand = useCallback(async (
    jsonData: any, 
    parentPath: string, 
    nodeKey: string, 
    nodeType: ExtraDataTypes
  ) => {
    setIsLayoutAnimating(true);
    
    try {
      // 1. Add the new node first
      const {newNode } = addProcessedChildNode(jsonData, parentPath, nodeKey, nodeType);
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
      toast.error(`Error expanding node: ${error}`);
    } finally {
      setIsLayoutAnimating(false);
    }
  }, [addProcessedChildNode, currentNodes, currentEdges, applyTreeLayout, reactFlowInstance, setNodes]);

  const handleJsonRemove = async () => {
    removeJsonState();
      await new Promise(resolve => setTimeout(resolve, 100));
    handleFitView();
  }

  
  // Enhanced nodes with search highlighting
  const enhancedNodes = useMemo(() => {
    if (!nodes.length) return [];

    return nodes.map(node => {

  
      
      return {
        ...node,
        data: {
          ...node.data,
          processedJsonData: node.data.processedJsonData,
          onNodeExpand: handleNodeExpand,
          isNewNode: node.data?.isNewNode || false
        }
      } as ReactFlowNode;
    });
  }, [nodes, handleNodeExpand]);

  return (
    <div ref={containerRef} className="h-screen w-screen relative bg-red-400">
      <ReactFlow
        colorMode="dark"
        className="min-h-screen w-screen"
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
     



<Button className="fixed top-5 left-5 flex gap-2 rounded-xs z-50 p-0"
variant="outline"
title="Click to close the tab"
onClick={() => {
  window.location.href = '/tabs';
}}
>

<X  />

  <h3 className="md:flex hidden lead-text">{currentState?.fileName.toLocaleUpperCase() ?? "nameless.json"  }</h3>
</Button>


<div className="flex items-center jsutify-center gap-2 fixed top-5 md:right-5 right-3 z-50">

<JsonSearchCommand data={jsonData} />



      <ControlsNav 
        handleFitView={handleFitView}
        handleReLayout={handleReLayout}
        handleJsonRemove={handleJsonRemove}
        isLayoutAnimating={isLayoutAnimating}
      />


</div>

    

    

        <Background variant={BackgroundVariant.Dots} gap={30} />
      </ReactFlow>

      {isLayoutAnimating && (
        <div className="fixed top-20 right-5 z-50 bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Arranging...
        </div>
      )}

  
  

      {/* 
        while this is a great feuture i am going to comment this out...the world not ready for it
      <PerformanceDebugger nodes={nodes} edges={edges} /> */}
    </div>
  );
};