
"use client";
import { RiFullscreenLine } from "react-icons/ri";
import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  Background,
  Panel,
  Handle,
  Position,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import {  Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ResizeButtons } from "./ReactFLowPageUtils";





const dummyJson = {
  name: "John Doe",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Anytown"
  },
  hobbies: ["reading", "gaming"]
};



type JsonNodeProps = {
  id: string;
  data: any;
};

// Helper to render metadata for any value
function renderMetadata(value: any) {
  const isObject = value && typeof value === "object";
  const dataType = Array.isArray(value) ? "array" : typeof value;
  const keys = isObject ? Object.keys(value).length : "-";
  const depth = isObject ? 1 : 0; // simple version: only first level depth

  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>Data type: <span className="font-medium">{dataType}</span></p>
      <p>Depth: <span className="font-medium">{depth}</span></p>
      <p>Keys: <span className="font-medium">{keys}</span></p>
    </div>
  );
}

// Helper to render value preview
function renderValue(value: any) {
  const isObject = value && typeof value === "object";

  if (isObject) {
    return (
      <div className="space-y-2">
        {renderMetadata(value)}
        <Button size="default" variant="outline" className="mt-1">
          Expand object/array
        </Button>
      </div>
    );
  }

  // Primitive
  return (
    <div className="space-y-1">
      <p className="break-all">{String(value)}</p>
      {renderMetadata(value)}
    </div>
  );
}

export const JsonNode = ({ id, data }: JsonNodeProps) => {
  return (
    <Card className="w-lg shadow-lg border-border relative py-4 px-3">
      <CardHeader className="flex flex-col px-0">
        <CardTitle className="lead-text font-semibold text-primary">
         
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          JSON Preview (first level)
        </p>
      </CardHeader>

      <CardContent className="p-3">
        {/* Accordion for JSON first-level keys */}
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(data.json || {}).map(([key, value]) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-xs font-medium capitalize">
                {key}
              </AccordionTrigger>
              <AccordionContent className="text-xs">
                {renderValue(value)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Spawn child button */}
        <Button
          size="sm"
          className="w-full mt-3"
          onClick={() => data.spawnNode(id)}
        >
          ➕ Add Child
        </Button>
      </CardContent>

      {/* React Flow handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

// Register in nodeTypes
const nodeTypes = {
  custom: JsonNode,
};

/* ------------------ Initial Graph ------------------ */
const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { json: dummyJson },
    type: "custom",
  },
];

const initialEdges: Edge[] = [];

/* ------------------ Main Flow ------------------ */
function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();

  const [nodeCount, setNodeCount] = useState(1);

  const onFitView = useCallback(() => {
    fitView({ padding: 0.2 });
  }, [fitView]);

  // 👇 Spawn node from inside a custom node
 const spawnNode = useCallback(
  (parentId: string) => {
    const newId = `${nodeCount + 1}`;
    const parent = nodes.find((n) => n.id === parentId);

    // count how many children the parent already has
    const childCount = edges.filter((e) => e.source === parentId).length;

    // progressive offset: each new child stacks vertically
    const position = parent
      ? {
          x: parent.position.x + 350, // push to the right
          y: parent.position.y + 150 + childCount * 150, // stagger vertically
        }
      : { x: nodeCount * 200, y: 150 };

    const newNode: Node = {
      id: newId,
      position,
      data: { label: `Child of ${parentId}`, spawnNode },
      type: "custom",
    };

    const newEdge: Edge = {
      id: `e${parentId}-${newId}`,
      source: parentId,
      target: newId,
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setNodeCount((c) => c + 1);

    // Smoothly pan to new node without forcing zoom
    setTimeout(() => {
      const currentZoom =
        (document.querySelector(".react-flow__viewport") as any)?._rf?.zoom ?? 1;
      setCenter(position.x, position.y, { zoom: currentZoom, duration: 500 });
    }, 0);
  },
  [nodeCount, nodes, edges, setNodes, setEdges, setCenter]
);


  // inject spawnNode into node data
  const nodesWithActions = nodes.map((n) => ({
    ...n,
    data: { ...n.data, spawnNode },
  }));

  return (
    <div className="h-[98vh] w-[100vw]">
      <ReactFlow
        colorMode="dark"
        nodes={nodesWithActions}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          type: "smoothstep",
          className: "opacity-25",
        }}
        minZoom={0.5}
        maxZoom={1}
        attributionPosition="bottom-left"
      >
        {/* Zoom Controls */}
        <Panel
          position="bottom-right"
          className="inline-flex -space-x-px rounded-sm shadow-xs rtl:space-x-reverse bg-primary"
        >
          {[
            { method: zoomIn, labelText: "Zoom in", icon: Plus },
            { method: zoomOut, labelText: "Zoom out", icon: Minus },
            { method: onFitView, labelText: "Fit view", icon: RiFullscreenLine },
          ].map(({ method, labelText, icon }) => (
            <ResizeButtons
              key={labelText}
              method={method}
              labelText={labelText}
              icon={icon}
            />
          ))}
        </Panel>

        <Background
          color="var(--color-muted-foreground)"
          bgColor="var(--color-background-lighter)"
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </div>
  );
}

export default function ReactFlowApp() {
  return <Flow />;
}
