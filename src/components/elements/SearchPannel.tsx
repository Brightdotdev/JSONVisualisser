

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { JsonValue } from "@/types/JsonTypes";
import { useCallback, useEffect } from 'react';
import { SearchMatch } from '@/types/Search';
import { useJsonSearch } from "@/hooks/useJsonSearch";


interface AdvancedSearchPanelProps {
  jsonData: JsonValue;
  onSearchResults: (matches: SearchMatch[]) => void;
  onHighlightedNodes: (nodeIds: Set<string>) => void;
  onClearSearch: () => void;
}

export const AdvancedSearchPanel = ({
  jsonData,
  onSearchResults,
  onHighlightedNodes,
  
  onClearSearch,
}: AdvancedSearchPanelProps) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResult,
    isSearching,
    searchHistory,
    clearSearch,
    searchFromHistory,
    hasResults
  } = useJsonSearch({
    jsonData,
    debounceMs: 250,
    minScore: 0.2,
    maxResults: 50
  });

  // Notify parent of search results
  useEffect(() => {
    if (searchResult) {
      onSearchResults(searchResult.matches);
      const nodeIds = new Set(searchResult.matches.map(match => match.nodeId));
      onHighlightedNodes(nodeIds);
    } else {
      onSearchResults([]);
      onHighlightedNodes(new Set());
    }
  }, [searchResult, onSearchResults, onHighlightedNodes]);

  const handleClear = useCallback(() => {
    clearSearch();
    onClearSearch();
  }, [clearSearch, onClearSearch]);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  
  return (
    <div className="fixed top-5 left-5 z-50 bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg min-w-80 max-w-96 max-h-[80vh] overflow-hidden">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            JSON LOOKUP
            {isSearching && (
              <span className="text-sm text-muted-foreground animate-pulse">
                Searching...
              </span>
            )}
          </h3>
          {searchResult && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {searchResult.metadata.totalMatches} results
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Search keys, values, types, paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {(searchTerm || hasResults) && (
            <Button 
              onClick={handleClear} 
              variant="outline" 
              size="sm"
              disabled={isSearching}
            >
              ✕
            </Button>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !searchTerm && (
          <div className="text-xs">
            <div className="text-muted-foreground mb-1">Recent searches:</div>
            <div className="flex flex-wrap gap-1">
              {searchHistory.slice(0, 3).map((term, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => searchFromHistory(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search Metadata */}
        {searchResult && (
          <div className="border-t pt-3 space-y-3">
            {/* Metadata Summary */}
            <div className="text-sm space-y-2">

                <span>Search time: {searchResult.metadata.searchTime.toFixed(2)}ms</span>



            </div>



            {/* Results List */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {searchResult.matches.map((match, index) => (
                <div
                  key={`${match.nodeId}-${index}`}
                  className="p-2 text-xs border rounded cursor-pointer hover:bg-accent/50 transition-colors"
                >
                 
                 
                  <div className="text-muted-foreground truncate mb-1">{match.path}</div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {match.metadata.matchedIn.slice(0, 2).map((source, i) => (
                      <span 
                        key={i}
                        className="bg-secondary text-secondary-foreground px-1 rounded text-xs"
                      >
                        {source}
                      </span>
                    ))}
                    {match.metadata.matchedIn.length > 2 && (
                      <span className="text-muted-foreground text-xs">
                        +{match.metadata.matchedIn.length - 2}
                      </span>
                    )}
                  </div>
                  {match.metadata.context && (
                    <div className="text-muted-foreground italic truncate">
                      {match.metadata.context}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Tips */}
        {!searchTerm && !hasResults && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Search tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Match scores show relevance (0-100%)</li>
              <li>Search in keys, values, paths, and types</li>
              <li>Exact matches get highest scores</li>
              <li>Results sorted by relevance</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};