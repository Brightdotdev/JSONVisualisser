import { useMemo } from 'react';
import { ReactFlowNode } from '@/types/JsonNodeTypes';
import { SearchMatch } from '@/types/Search';

export const useJsonFlowNodes = (
  nodes: ReactFlowNode[],
  searchResults: SearchMatch[],
  highlightedNodes: Set<string>,
  onNodeExpand: (jsonData: any, parentPath: string, nodeKey: string, nodeType: any) => void,
  isLayoutAnimating: boolean,
  onNodeDrag?: (event: any, node: ReactFlowNode) => void // Add drag handler
) => {
  const enhancedNodes = useMemo(() => {
    if (!nodes.length) return [];

    return nodes.map(node => {
      const nodeSearchResults = searchResults.filter(result => result.nodeId === node.id);
      const searchMatches = nodeSearchResults.flatMap(result => result.matches);
      const isHighlighted = highlightedNodes.has(node.id);
      
      const isAncestorHighlighted = Array.from(highlightedNodes).some(highlightedId => 
        highlightedId !== node.id && highlightedId.startsWith(node.id + '.')
      );

      return {
        ...node,
        // ALWAYS draggable - we'll handle layout conflicts differently
        draggable: true,
        data: {
          ...node.data,
          onNodeExpand,
          isHighlighted,
          isAncestorHighlighted,
          searchMatches,
          isNewNode: node.data?.isNewNode || false
        }
      } as ReactFlowNode;
    });
  }, [nodes, searchResults, highlightedNodes, onNodeExpand, isLayoutAnimating]);

  return { enhancedNodes };
};