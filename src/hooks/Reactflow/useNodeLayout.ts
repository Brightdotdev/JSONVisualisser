import { ReactFlowNode } from "@/types/JsonNodeTypes";
import { TreeLayout } from "@/utils/treelayout";
import { Edge, ReactFlowInstance } from "@xyflow/react";
import { useCallback, useState } from "react";



interface ContainerSize {
    width: number;
    height: number;
}

export const useNodeLayout  =({nodes, edges,containerSize,reactFlowInstance,setNodes} :
     {nodes : ReactFlowNode[],setNodes : (nodes : ReactFlowNode[]) => void , edges : Edge[], containerSize : ContainerSize, reactFlowInstance : ReactFlowInstance}) =>{


    const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);



      const handleReLayout = useCallback(() => {
        setIsLayoutAnimating(true);
        const newlyLaidOutNodes = TreeLayout.calculateResponsiveLayout(nodes, edges, containerSize);
        setNodes(newlyLaidOutNodes);
        
        setTimeout(() => {
          reactFlowInstance?.fitView({ 
            duration: 800,
            padding: 0.15 
          });
          setIsLayoutAnimating(false);
        }, 600);
      }, [nodes, edges, reactFlowInstance]);
    

        const handleFitView = useCallback(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ 
              duration: 400,
              padding: 0.1 
            });
          }
        }, [reactFlowInstance]);




      return{handleReLayout , isLayoutAnimating, setIsLayoutAnimating,handleFitView};
}