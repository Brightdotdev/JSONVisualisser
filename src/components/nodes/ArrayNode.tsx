// components/nodes/ArrayNode.tsx
import { NodeProps } from "@xyflow/react";

export const ArrayNode = ({ data }: NodeProps) => {
  // Similar to JsonNode but with array-specific styling
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-green-800">Array: {data.nodeKey}</h3>
      {/* Array-specific content */}
    </div>
  );
};