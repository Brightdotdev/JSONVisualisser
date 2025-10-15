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
    onExpandToNode?: (path: string) => void | Promise<void>; // Allow both
  onFocusNode?: (nodeId: string) => boolean;
  onZoomToNode?: (nodeId: string) => void; // Add this missing prop
}

export const AdvancedSearchPanel = ({
  jsonData,
  onSearchResults,
  onHighlightedNodes,
  onClearSearch,
  onExpandToNode,
  onFocusNode,
  onZoomToNode, // Add this to destructuring
}: AdvancedSearchPanelProps) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResult,
    isSearching,
    searchHistory,
    clearSearch,
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

 const handleExpandOrFocus = useCallback((match: SearchMatch) => {
  console.log('Expand/Focus clicked:', match);
  
  // First try to focus on the node (if it already exists)
  onFocusNode?.(match.nodeId); // ✅ Just call it, no return value check
  
  // Always try to expand after a delay (removed the conditional logic)
  setTimeout(() => {
    onExpandToNode?.(match.path);
  }, 100);
}, [onFocusNode, onExpandToNode]);


  const handleQuickZoom = useCallback((match: SearchMatch) => {
    // Quick zoom without expansion
    onZoomToNode?.(match.nodeId);
  }, [onZoomToNode]);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'exact': return '🎯';
      case 'high': return '⭐';
      case 'medium': return '🔍';
      case 'low': return '💤';
      default: return '🔎';
    }
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



        {/* Search Metadata */}
        {searchResult && (
          <div className="border-t pt-3 space-y-3">
            {/* Metadata Summary */}
            <div className="text-sm space-y-2">
              <div className="flex justify-between text-xs">
                <span>Search time: {searchResult.metadata.searchTime.toFixed(2)}ms</span>
                <span>Term: "{searchResult.metadata.searchTerm}"</span>
              </div>

              {/* Breakdown */}
              {Object.keys(searchResult.metadata.breakdown.byRelevance).length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium">By Relevance</div>
                    {Object.entries(searchResult.metadata.breakdown.byRelevance).map(([rel, count]) => (
                      <div key={rel} className="flex justify-between">
                        <span>{getRelevanceIcon(rel)} {rel}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-medium">By Type</div>
                    {Object.entries(searchResult.metadata.breakdown.byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span>{type}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {searchResult.metadata.suggestions && searchResult.metadata.suggestions.length > 0 && (
              <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                <div className="font-medium text-blue-800 mb-1">💡 Suggestions:</div>
                {searchResult.metadata.suggestions.map((suggestion, index) => (
                  <div key={index} className="text-blue-700">• {suggestion}</div>
                ))}
              </div>
            )}

            {/* Results List */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {searchResult.matches.map((match, index) => (
                <div
                  key={`${match.nodeId}-${index}`}
                  className="p-2 text-xs border rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium truncate flex-1">{match.key}</div>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${getScoreColor(match.matchScore)}`}>
                      {(match.matchScore * 100).toFixed(0)}%
                    </span>
                  </div>
                 
                  <div className="text-muted-foreground truncate mb-1" title={match.path}>
                    {match.path}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-1">
                    {match.metadata.matchedIn.slice(0, 2).map((source, i) => (
                      <span 
                        key={i}
                        className="bg-secondary text-secondary-foreground px-1 rounded text-xs"
                      >
                        {source.split(' ')[0]} {/* Show just the type, e.g., "Key", "Value" */}
                      </span>
                    ))}
                    {match.metadata.matchedIn.length > 2 && (
                      <span className="text-muted-foreground text-xs">
                        +{match.metadata.matchedIn.length - 2}
                      </span>
                    )}
                  </div>
                  
                  {match.metadata.context && (
                    <div className="text-muted-foreground italic truncate" title={match.metadata.context}>
                      {match.metadata.context}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-xs"
                      onClick={() => handleExpandOrFocus(match)}
                    >
                      🔍 Expand & Focus
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs"
                      onClick={() => handleQuickZoom(match)}
                      title="Quick zoom to node"
                    >
                      ⚡
                    </Button>
                  </div>
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
              <li>Use ⚡ for quick zoom, 🔍 for expand & focus</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};