'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Create a wrapper that doesn't import CSS
const ReactFlowWrapper = dynamic(
  async () => {
    const {
      ReactFlow,
      MiniMap,
      Controls,
      Background,
    } = await import('reactflow');
    
    // Return a wrapper component that doesn't import CSS
    const Wrapper = (props: any) => (
      <ReactFlow {...props}>
        {props.children}
      </ReactFlow>
    );
    
    Wrapper.displayName = 'ReactFlowWrapper';
    
    return Wrapper;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading visualization...</p>
        </div>
      </div>
    ),
  }
);

export const MiniMapWrapper = dynamic(
  () => import('reactflow').then((mod) => mod.MiniMap),
  { ssr: false, loading: () => null }
);

export const ControlsWrapper = dynamic(
  () => import('reactflow').then((mod) => mod.Controls),
  { ssr: false, loading: () => null }
);

export const BackgroundWrapper = dynamic(
  () => import('reactflow').then((mod) => mod.Background),
  { ssr: false, loading: () => null }
);

export default ReactFlowWrapper;