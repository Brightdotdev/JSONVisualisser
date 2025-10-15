// utils/treeLayout.ts

import { ReactFlowNode } from "@/types/JsonNodeTypes";
import { Edge } from "@xyflow/react";

export interface TreeNode {
  id: string;
  children: TreeNode[];
  depth: number;
  width: number;
  x?: number;
  y?: number;
  parent?: TreeNode;
}

export interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  direction: 'horizontal' | 'vertical';
}

export class TreeLayout {
  static calculateLayout(
    nodes: ReactFlowNode[],
    edges: Edge[],
    options: Partial<LayoutOptions> = {}
  ): ReactFlowNode[] {
    const config: LayoutOptions = {
      nodeWidth: 300,
      nodeHeight: 200,
      horizontalSpacing: 100,
      verticalSpacing: 150,
      direction: 'horizontal',
      ...options
    };

    // Build tree structure FROM EDGES
    const tree = this.buildTreeFromEdges(nodes, edges);
    
    if (!tree) {
      console.warn('No root node found for layout');
      return nodes; // Return original nodes if no tree structure
    }

    // Calculate positions
    this.calculateNodePositions(tree, config);
    
    // Map back to React Flow nodes
    return this.mapTreeToNodes(tree, nodes, config);
  }

  private static buildTreeFromEdges(nodes: ReactFlowNode[], edges: Edge[]): TreeNode | null {
    const nodeMap = new Map<string, TreeNode>();
    
    // Create tree nodes from all nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        children: [],
        depth: 0,
        width: 0
      });
    });

    // Build parent-child relationships FROM EDGES
    edges.forEach(edge => {
      const parent = nodeMap.get(edge.source);
      const child = nodeMap.get(edge.target);
      if (parent && child) {
        parent.children.push(child);
        child.parent = parent; // Set parent reference
      }
    });

    // Find root node (node with no incoming edges)
    const nodesWithParents = new Set<string>();
    edges.forEach(edge => nodesWithParents.add(edge.target));
    
    const rootNodes = nodes.filter(node => !nodesWithParents.has(node.id));
    const rootNode = rootNodes.length > 0 ? nodeMap.get(rootNodes[0].id) : null;

    if (rootNode) {
      // Calculate depths and widths starting from root
      this.calculateDepthsAndWidths(rootNode, 0);
      return rootNode;
    }

    return null;
  }

  private static calculateDepthsAndWidths(node: TreeNode, depth: number): number {
    node.depth = depth;
    
    if (node.children.length === 0) {
      node.width = 1;
      return 1;
    }

    let totalWidth = 0;
    node.children.forEach(child => {
      totalWidth += this.calculateDepthsAndWidths(child, depth + 1);
    });

    node.width = Math.max(1, totalWidth); // Ensure at least width 1
    return node.width;
  }
// utils/treeLayout.ts - Update the calculateNodePositions method

private static calculateNodePositions(tree: TreeNode, options: LayoutOptions): void {
  const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing, direction } = options;

  const traverse = (node: TreeNode, startX: number, startY: number): void => {
    if (direction === 'horizontal') {
      // Horizontal layout with better spacing
      node.x = startX;
      // Center the node vertically based on its subtree width with buffer
      node.y = startY + (node.width * (nodeHeight + verticalSpacing + 40)) / 2 - (nodeHeight / 2);
      
      let childY = startY;
      node.children.forEach(child => {
        traverse(child, startX + nodeWidth + horizontalSpacing + 50, childY);
        childY += child.width * (nodeHeight + verticalSpacing + 40); // Added buffer
      });
    } else {
      // Vertical layout with better spacing
      node.x = startX + (node.width * (nodeWidth + horizontalSpacing + 40)) / 2 - (nodeWidth / 2);
      node.y = startY;
      
      let childX = startX;
      node.children.forEach(child => {
        traverse(child, childX, startY + nodeHeight + verticalSpacing + 60); // Added buffer
        childX += child.width * (nodeWidth + horizontalSpacing + 40);
      });
    }
  };

  traverse(tree, 100, 100); // Start with some margin
}
  private static mapTreeToNodes(tree: TreeNode, originalNodes: ReactFlowNode[], options: LayoutOptions): ReactFlowNode[] {
    const positionedNodes: ReactFlowNode[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    // Collect all positions from the tree
    const collectPositions = (node: TreeNode) => {
      if (node.x !== undefined && node.y !== undefined) {
        nodePositions.set(node.id, { x: node.x, y: node.y });
      }
      node.children.forEach(collectPositions);
    };
    
    collectPositions(tree);

    // Apply positions to original nodes
    originalNodes.forEach(originalNode => {
      const position = nodePositions.get(originalNode.id);
      if (position) {
        positionedNodes.push({
          ...originalNode,
          position,
          style: {
            ...originalNode.style,
            transition: 'all 0.5s ease-in-out'
          }
        });
      } else {
        // Keep original position for nodes not in the tree
        positionedNodes.push(originalNode);
      }
    });

    return positionedNodes;
  }

  // Responsive layout based on container size
  static calculateResponsiveLayout(
    nodes: ReactFlowNode[],
    edges: Edge[],
    containerSize: { width: number; height: number }
  ): ReactFlowNode[] {
    const isWideScreen = containerSize.width > 1024;
    const isTablet = containerSize.width > 768;
    
    const options: Partial<LayoutOptions> = {
      direction: isWideScreen ? 'horizontal' : 'vertical',
      nodeWidth: isWideScreen ? 320 : isTablet ? 280 : 250,
      nodeHeight: isWideScreen ? 220 : isTablet ? 180 : 160,
      horizontalSpacing: isWideScreen ? 120 : isTablet ? 80 : 60,
      verticalSpacing: isWideScreen ? 100 : isTablet ? 80 : 60,
    };

    return this.calculateLayout(nodes, edges, options);
  }
}