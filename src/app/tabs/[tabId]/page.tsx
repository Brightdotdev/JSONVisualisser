"use client";


import { useJsonTabs } from "@/hooks/useJsonTabs";
import { notFound } from "next/navigation";
import React from "react";





export default function Page({ params }: { params: Promise<{ tabId: string }> }) {
  const { tabId } = React.use(params);

    const { getJsonTab } = useJsonTabs();
 
    
  const jsonTab = getJsonTab(tabId);

  if (!jsonTab) {
    notFound();
  }

  // return <SingleJsonTabPage jsonTab={jsonTab} />;
  // return <ReactFlowAppp />
}
