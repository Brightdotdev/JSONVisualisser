// components/elements/SearchResultsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchMatch } from '@/types/Search';
import { JsonValue } from '@/types/JsonTypes';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: SearchMatch[];
  searchTerm: string;
  jsonData: JsonValue;
  onZoomToNode: (nodeId: string) => void;
}

export const SearchResultsModal = ({
  isOpen,
  onClose,
  searchResults,
  searchTerm,
  jsonData,
  onZoomToNode
}: SearchResultsModalProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getValuePreview = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `Array[${value.length}]`;
      }
      return `Object{${Object.keys(value).length}}`;
    }
    return String(value).slice(0, 100);
  };

  const navigateToPath = (path: string) => {
    // Extract the actual node ID from the path
    const nodeId = path; // or transform if needed
    onZoomToNode(nodeId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔍 Search Results for "{searchTerm}"
            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
              {searchResults.length} matches
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {searchResults.map((match, index) => (
              <div
                key={`${match.nodeId}-${index}`}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {match.key}
                      <span className={`px-2 py-1 text-xs rounded-full border ${getScoreColor(match.matchScore)}`}>
                        {(match.matchScore * 100).toFixed(0)}% match
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      Path: {match.path}
                    </p>
                  </div>
                </div>

                {/* Match Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Match Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Data Type:</span>
                        <span className="font-mono">{match.dataType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Value:</span>
                        <span className="font-mono text-xs max-w-[200px] truncate">
                          {getValuePreview(match.value)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Where Matched</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.metadata.matchedIn.map((source, i) => (
                        <span 
                          key={i}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Context Preview */}
                {match.metadata.context && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-2">Context</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {match.metadata.context}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    onClick={() => navigateToPath(match.path)}
                    className="flex-1"
                  >
                    🔍 Navigate to Node
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Copy path to clipboard
                      navigator.clipboard.writeText(match.path);
                    }}
                  >
                    📋 Copy Path
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Found {searchResults.length} results across the JSON structure
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};