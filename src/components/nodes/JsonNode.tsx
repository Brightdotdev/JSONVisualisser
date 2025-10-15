import { Button } from "../ui/button";
import { ReactFlowNode } from "@/types/JsonNodeTypes";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { memo, useMemo, useEffect, useState } from "react";

// Memoize the helper components too
const RenderMetadata = memo(({ value }: { value: any }) => {
  const isObject = value && typeof value === "object";
  const dataType = Array.isArray(value) ? "array" : typeof value;
  const keys = isObject ? Object.keys(value).length : "-";
  const depth = isObject ? 1 : 0;

  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>Data type: <span className="font-medium">{dataType}</span></p>
      <p>Depth: <span className="font-medium">{depth}</span></p>
      <p>Keys: <span className="font-medium">{keys}</span></p>
    </div>
  );
});

const RenderValue = memo(({ value }: { value: any }) => {
  const isObject = value && typeof value === "object";

  if (isObject) {
    return (
      <div className="space-y-2">
        <RenderMetadata value={value} />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="break-all">{String(value)}</p>
      <RenderMetadata value={value} />
    </div>
  );
});

// Memoize individual node items for better performance
const NodeItem = memo(({ 
  node, 
  pathName, 
  onNodeExpand
}: { 
  node: any;
  pathName: string;
  onNodeExpand: any;
}) => {
  const handleExpand = () => {
    onNodeExpand?.(
      node.metadata.jsonValue, 
      pathName, 
      node.key, 
      node.metadata.dataType
    );
  };

  return (
    <div className='p-3 border rounded-md transition-all duration-300 border-border hover:bg-accent/50'>
      {/* Node Info Row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className='text-sm font-medium truncate'>
            {node.key}
            
          </p>
          <p className="text-xs text-muted-foreground">
            Path: {node.path}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
            node.metadata.dataType === 'object' ? 'bg-blue-100 text-blue-800' :
            node.metadata.dataType === 'array' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {node.metadata.dataType}
          </span>
        </div>
      </div>

      {/* Value Preview */}
      <div className="mb-3">
        <RenderValue value={node.metadata.jsonValue} />
      </div>

      
      

      {/* Expand Button for Objects/Arrays */}
      {(node.metadata.dataType === "object" || node.metadata.dataType === "array") && (
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {node.metadata.childCount ?? 0} items
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleExpand}>
            {node.metadata.dataType === "array" ? "Expand Array" : "Expand Object"}
          </Button>
        </div>
      )}
    </div>
  );
});

// Main JsonNode component with enhanced animations and search highlighting
export const JsonNode = memo(({ data, id }: NodeProps<ReactFlowNode>) => {
  const pathName = data.processedJsonData.parentPath ?? "root";
  const parentOutput = `${id}-output`;
  const parentInput = `${id}-input`;
  

  
  
  // Memoize the node content with search match detection
  const nodeContent = useMemo(() => 
    data.processedJsonData.nodes.map((node: any) => {
   
      
      return (
        <NodeItem 
          key={node.key} 
          node={node} 
          pathName={pathName}
          onNodeExpand={data.onNodeExpand}
        />
      );
    }),
    [data.processedJsonData.nodes, pathName, data.onNodeExpand]
  );

  // Memoize node stats
  const nodeStats = useMemo(() => ({
    totalItems: data.processedJsonData.nodes.length,
    hasChildren: data.processedJsonData.hasChildren ? 'Yes' : 'No',
  }), [data.processedJsonData.nodes.length, data.processedJsonData.hasChildren]);

  return (
     <div 
      className={`
        bg-card border rounded-lg p-4 shadow-sm min-w-[300px] relative
        transition-all duration-500 ease-out        
      ${data?.isHighlighted ? 'border-red-400 border-2' : ''}
      ${data?.isAncestorHighlighted ? 'border-blue-300 border-2' : ''}
        `}
    >

      <Handle
        type="source"
        position={Position.Right}
        id={parentOutput}
      />
      <Handle
        type="target" 
        position={Position.Left}
        id={parentInput}
      />
      
      {/* Node Header */}
      <div className="border-b border-border pb-2 mb-3">
        <h3 className="font-semibold text-foreground truncate" title={pathName}>
          {pathName}
        </h3>
        {data.processedJsonData.parentPath && (
          <p className="text-sm text-muted-foreground truncate">Key: {pathName}</p>
        )}
      </div>

      {/* Node Content */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {nodeContent}
      </div>

      {/* Node Footer */}
      <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
        <p>Total items: {nodeStats.totalItems}</p>
        <p>Has children: {nodeStats.hasChildren}</p>
  
      </div>
    
    </div>
  );
});

// Add display name for better debugging
JsonNode.displayName = 'JsonNode';