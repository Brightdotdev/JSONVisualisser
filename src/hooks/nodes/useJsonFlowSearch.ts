import { useState, useCallback } from 'react';
import { SearchMatch } from '@/types/Search';

export const useJsonFlowSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  const handleSearchResults = useCallback((results: SearchMatch[]) => {
    setSearchResults(results);
  }, []);

  const handleHighlightedNodes = useCallback((nodeIds: Set<string>) => {
    setHighlightedNodes(nodeIds);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setHighlightedNodes(new Set());
  }, []);

  return {
    searchResults,
    highlightedNodes,
    handleSearchResults,
    handleHighlightedNodes,
    handleClearSearch,
  };
};