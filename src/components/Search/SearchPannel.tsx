// components/elements/EnhancedSearchPanel.tsx
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { JsonValue } from "@/types/JsonTypes";
import { useCallback, useEffect, useState } from 'react';
import { SearchMatch } from '@/types/Search';
import { useJsonSearch } from "@/hooks/useJsonSearch";
import { SearchResultsModal } from "./SearchResultsModal";

interface EnhancedSearchPanelProps {
  jsonData: JsonValue;
  onSearchResults: (matches: SearchMatch[]) => void;
  onHighlightedNodes: (nodeIds: Set<string>) => void;
  onClearSearch: () => void;
  onZoomToNode: (nodeId: string) => void;
}

export const EnhancedSearchPanel = ({
  jsonData,
  onSearchResults,
  onHighlightedNodes,
  onClearSearch,
  onZoomToNode,
}: EnhancedSearchPanelProps) => {
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

  const [showResultsModal, setShowResultsModal] = useState(false);

  // Notify parent of search results for highlighting
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
    setShowResultsModal(false);
  }, [clearSearch, onClearSearch]);

  const handleSearchSubmit = useCallback(() => {
    if (hasResults) {
      setShowResultsModal(true);
    }
  }, [hasResults]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hasResults) {
      setShowResultsModal(true);
    }
  }, [hasResults]);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="fixed top-5 left-5 z-50 bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg min-w-80 max-w-96">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🔍 JSON Search
              {isSearching && (
                <span className="text-sm text-muted-foreground animate-pulse">
                  Searching...
                </span>
              )}
            </h3>
            {searchResult && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowResultsModal(true)}
                disabled={!hasResults}
              >
                View All ({searchResult.metadata.totalMatches})
              </Button>
            )}
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search keys, values, types, paths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
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

          {/* Quick Results Preview */}
          {searchResult && searchResult.matches.length > 0 && (
            <div className="border-t pt-3">
              <div className="text-sm font-medium mb-2">Top Results:</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {searchResult.matches.slice(0, 3).map((match, index) => (
                  <div
                    key={`${match.nodeId}-${index}`}
                    className="p-2 text-xs border rounded cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onZoomToNode(match.nodeId)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium truncate flex-1">{match.key}</div>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${getScoreColor(match.matchScore)}`}>
                        {(match.matchScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {match.path}
                    </div>
                  </div>
                ))}
                {searchResult.matches.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => setShowResultsModal(true)}
                  >
                    View {searchResult.matches.length - 3} more results...
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Search Tips */}
          {!searchTerm && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">💡 Search Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Press Enter to view all results</li>
                <li>Click results to navigate instantly</li>
                <li>Search in keys, values, paths, and types</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Results Modal */}
      <SearchResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        searchResults={searchResult?.matches || []}
        searchTerm={searchTerm}
        jsonData={jsonData}
        onZoomToNode={onZoomToNode}
      />
    </>
  );
};