import { Button } from "../ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { ReactFlowNode } from "@/types/JsonNodeTypes";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { memo, useMemo } from "react";
import { Copy } from "lucide-react";

const RenderMetadata = memo(({ value, path }: { value: any; path: string }) => {
  const isObject = value && typeof value === "object";
  const dataType = Array.isArray(value) ? "array" : typeof value;
  const keys = isObject ? Object.keys(value).length : "-";
  const depth = isObject ? 1 : 0;

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      <p className="flex gap-2 items-center justify-start text-sm text-foreground/80">
        <span className="truncate">{path}</span>
        <span
          role="button"
          className="p-1 rounded-md hover:bg-muted cursor-pointer transition-colors"
          title="Copy Value Reference Path"
          onClick={() => navigator.clipboard.writeText(path)}
        >
          <Copy size={14} />
        </span>
      </p>
      <div className="flex gap-3 flex-wrap">
        <p>Type: <span className="font-medium text-foreground">{dataType}</span></p>
        {depth > 0 && isObject && (
          <p>Depth: <span className="font-medium text-foreground">{depth}</span></p>
        )}
        {keys !== "-" && isObject && (
          <p>Keys: <span className="font-medium text-foreground">{keys}</span></p>
        )}
      </div>
    </div>
  );
});
RenderMetadata.displayName = "RenderMetadata";


const RenderValue = memo(({ value, path }: { value: any; path: string }) => {
  const isObject = value && typeof value === "object";
  return (
    <div className="space-y-1">
      {!isObject && (
        <p className="break-all text-sm text-foreground">
          Value: <span className="font-medium">{String(value)}</span>
        </p>
      )}
      <RenderMetadata value={value} path={path} />
    </div>
  );
});

RenderValue.displayName = "RenderValue";


const NodeItem = memo(
  ({
    node,
    pathName,
    onNodeExpand,
  }: {
    node: any;
    pathName: string;
    onNodeExpand: any;
  }) => {
    const handleExpand = () => {
      onNodeExpand?.(node.metadata.jsonValue, pathName, node.key, node.metadata.dataType);
    };

    const hasExpandableContent =
      node.metadata.dataType === "object" || node.metadata.dataType === "array";
    const itemCount = node.metadata.childCount ?? 0;

    if (!hasExpandableContent) {
      return (
        <div className="p-2 border rounded-md border-border/50 hover:bg-muted/50 transition-all duration-200">
          <RenderValue value={node.metadata.jsonValue} path={node.path} />
        </div>
      );
    }

    return (
      <AccordionItem
        value={node.key}
        className="border rounded-sm border-border/50 overflow-hidden bg-card/70 backdrop-blur-sm transition-all duration-200"
      >
        <AccordionTrigger className="py-3 px-2 hover:no-underline data-[state=open]:bg-muted/50 rounded-sm">
          <div className="flex flex-col justify-between items-start w-full">
            <p className="text-sm font-medium text-foreground/90 truncate">{node.path}</p>
            <span className="text-xs text-muted-foreground">{itemCount} items</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3 pt-1 space-y-3">
          <RenderValue value={node.metadata.jsonValue} path={node.path} />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExpand}
              className="text-xs"
            >
              {node.metadata.dataType === "array" ? "Expand Array" : "Expand Object"}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }
);

NodeItem.displayName = "NodeItem";


export const JsonNode = memo(({ data, id }: NodeProps<ReactFlowNode>) => {
  const pathName = data.processedJsonData.parentPath ?? "root";
  const parentOutput = `${id}-output`;
  const parentInput = `${id}-input`;

  const shouldCollapseByDefault = data.processedJsonData.nodes.length > 3;

  const nodeContent = useMemo(() => {
    const nodes = data.processedJsonData.nodes;
    const expandableNodes = nodes.filter(
      (node) => node.metadata.dataType === "object" || node.metadata.dataType === "array"
    );
    const primitiveNodes = nodes.filter(
      (node) => node.metadata.dataType !== "object" && node.metadata.dataType !== "array"
    );

    return (
      <>
        {primitiveNodes.map((node: any) => (
          <NodeItem
            key={node.key}
            node={node}
            pathName={pathName}
            onNodeExpand={data.onNodeExpand}
          />
        ))}

        {expandableNodes.length > 0 && (
          <Accordion
            type="multiple"
            defaultValue={shouldCollapseByDefault ? [] : expandableNodes.map((n) => n.key)}
            className="flex flex-col gap-2"
          >
            {expandableNodes.map((node: any) => (
              <NodeItem
                key={node.key}
                node={node}
                pathName={pathName}
                onNodeExpand={data.onNodeExpand}
              />
            ))}
          </Accordion>
        )}
      </>
    );
  }, [data.processedJsonData.nodes, pathName, data.onNodeExpand, shouldCollapseByDefault]);

  const nodeStats = useMemo(
    () => ({
      totalItems: data.processedJsonData.nodes.length,
      hasChildren: data.processedJsonData.hasChildren ? "Yes" : "No",
      expandableItems: data.processedJsonData.nodes.filter(
        (node: any) =>
          node.metadata.dataType === "object" || node.metadata.dataType === "array"
      ).length,
      primitiveItems: data.processedJsonData.nodes.filter(
        (node: any) =>
          node.metadata.dataType !== "object" && node.metadata.dataType !== "array"
      ).length,
    }),
    [data.processedJsonData.nodes, data.processedJsonData.hasChildren]
  );

  return (
    <div
      className="
        bg-card border border-border/90 rounded-lg p-5 shadow-md 
        min-w-[420px] max-w-[700px] transition-all duration-300 ease-out
      "
    >
      <Handle type="source" position={Position.Right} id={parentOutput} />
      <Handle type="target" position={Position.Left} id={parentInput} />

      <div className="border-b border-border/40 pb-3 mb-3">
        <h3 className="font-semibold text-lg text-foreground truncate">{pathName}</h3>
        {data.processedJsonData.parentPath && (
          <p className="text-sm text-muted-foreground truncate">Key: {pathName}</p>
        )}
      </div>

      <div
        className="
          space-y-3  overflow-y-auto  
          scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent 
          hover:scrollbar-thumb-muted-foreground/40
        "
        style={{ scrollbarWidth: "none" }}
      >
        {nodeContent}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Total: {nodeStats.totalItems}</span>
          <span>Children: {nodeStats.hasChildren}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Expandable: {nodeStats.expandableItems}</span>
          <span>Primitive: {nodeStats.primitiveItems}</span>
        </div>
      
      </div>
    </div>
  );
});

JsonNode.displayName = "JsonNode";
