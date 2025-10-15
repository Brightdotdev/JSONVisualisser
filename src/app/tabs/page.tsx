"use client";

import { ReactFlowGraphCanvas } from '@/components/ReactFlowElements/ReactFlowGraphCanvas'
import ReactFlowApp from '@/components/ReactFlowElements/ReactFlowPage'
import { useJsonTabs } from '@/hooks/useJsonTabs';
import { notFound } from 'next/navigation';
import React from 'react'

export default function Page({ params }: { params: Promise<{ tabId: string }> }) {
   const { tabId } = React.use(params);

    const { getJsonTab } = useJsonTabs();
 
    
  const jsonTab = getJsonTab("my-tab-json-efd45c63");

  if (!jsonTab) {
    notFound();
  }
  return (
    <ReactFlowGraphCanvas jsonTab={jsonTab} />
  )
}

