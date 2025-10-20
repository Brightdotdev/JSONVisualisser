"use client";

import { ReactFlowGraphCanvas } from '@/components/screens/ReactFlowGraphCanvas'
import { useJsonTabs } from '@/hooks/useJsonTabs';
import { notFound } from 'next/navigation';
import React from 'react'

export default function Page({ params }: { params: Promise<{ tabId: string }> }) {
   const { tabId } = React.use(params);

 
    

  if (!tabId) return notFound();

  return (
    <ReactFlowGraphCanvas jsonSlug={tabId} />
  )
}

