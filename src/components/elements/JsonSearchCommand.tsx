// components/elements/JsonSearchCommand.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useJsonSearch } from "@/hooks/useJsonSearch";
import { SearchMatch } from "@/types/Search";
import { JsonValue } from "@/types/JsonTypes";
import {
  Search,
  Copy,
  Focus,
  X,
  ExternalLink,
  Clock,
  BarChart3,
  Key,
  MessageSquare,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * JsonSearchCommand (upgraded)
 *
 * Features:
 * - Responsive: CommandDialog on desktop, Drawer on mobile
 * - Highlights matched substrings (key & value preview)
 * - Contextual preview extracted from match metadata
 * - Mobile UX: auto-close search on selection (optional)
 * - Performance: useMemo to limit & memoize results, skeleton loading
 * - UI polish: icons, badges, compact layout
 *
 * Note: This component displays whatever useJsonSearch returns.
 *       make sure your JsonSearch.search() returns matches with:
 *         - matches: string[] (which indicates matched fields like "key","value","path")
 *         - metadata.context (contextual snippet)
 *
 * Props:
 * - jsonData: the JSON root to search
 * - onZoomToNode?: optional callback to zoom/reactflow to a nodeId
 */
interface JsonSearchCommandProps {
  jsonData: JsonValue;
  onZoomToNode?: (nodeId: string) => void;
}

const MAX_RENDERED_RESULTS = 50; // limit the number of rendered results for performance

export const JsonSearchCommand = ({ jsonData, onZoomToNode }: JsonSearchCommandProps) => {
  // --- UI state: search dialog/drawer + detail panel ---
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<SearchMatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // --- responsive detection ---
  const isMobile = useMediaQuery("(max-width: 640px)");

  // --- search hook (debounce handled inside hook) ---
  const { searchTerm, setSearchTerm, searchResult, isSearching, clearSearch } = useJsonSearch({
    jsonData,
    debounceMs: 250,
    minScore: 0.2,
    maxResults: 250, // backend max; UI will limit rendered results
  });

  // --- keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Toggle search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
      // Close only detail with Escape (keeps search open)
      if (e.key === "Escape" && detailOpen) {
        setDetailOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailOpen]);

  // --- Helpers: styles and preview generation ---
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 0.7) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  // Create a preview for a value; keep it short
  const getValuePreview = (value: any): string => {
    if (value === null) return "null";
    if (typeof value === "object") {
      if (Array.isArray(value)) return `Array[${value.length}]`;
      return `Object{${Object.keys(value || {}).length}}`;
    }
    if (typeof value === "string") return value.length > 120 ? `${value.slice(0, 120)}...` : value;
    return String(value);
  };

  // Highlight matched substring(s) in a piece of text.
  // Returns React nodes with <mark> elements around matches.
  const highlightMatches = (text: string, term: string) => {
    if (!term) return text;
    const t = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex
    const re = new RegExp(`(${t})`, "ig");
    const parts = String(text).split(re);
    return parts.map((part, i) =>
      re.test(part) ? (
        <mark key={i} className="bg-primary/20 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Memoize processed result list for performance and to limit renders
  const processedMatches = useMemo(() => {
    const raw = searchResult?.matches ?? [];
    // Keep top N results only for UI
    const sliced = raw.slice(0, MAX_RENDERED_RESULTS);
    // Map to lightweight display objects
    return sliced.map((m) => ({
      nodeId: m.nodeId,
      path: m.path,
      key: m.key,
      dataType: m.dataType,
      valuePreview: getValuePreview(m.value),
      matchScore: m.matchScore,
      matchedIn: m.matches ?? m.metadata?.matchedIn ?? [],
      relevance: m.metadata?.relevance ?? "low",
      context: m.metadata?.context ?? "",
      exactMatch: m.exactMatch ?? false,
      raw: m,
    }));
  }, [searchResult]);

  // Copy helpers
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Result selection: open detail panel (keeps search dialog independent)
  const handleResultSelect = useCallback(
    (match: SearchMatch) => {
      setSelectedMatch(match);
      setDetailOpen(true);
      // mobile: close the search drawer when opening details to reduce stacking
      if (isMobile) setSearchOpen(false);
    },
    [isMobile]
  );

  // Navigate action (zoom to node in react-flow)
  const handleNavigateToNode = useCallback(
    (nodeId?: string) => {
      if (!nodeId) return;
      if (onZoomToNode) onZoomToNode(nodeId);
      // keep detail open so user can copy; optionally close
      if (isMobile) setDetailOpen(false); // on mobile navigate then close details
    },
    [onZoomToNode, isMobile]
  );

  // Small skeleton UI for loading: returns an array of placeholders
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  // --- Render ---
  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 fixed top-5 left-5 z-50 shadow-sm"
        aria-label="Open JSON search (Cmd/Ctrl+K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search JSON</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* --- Search UI (desktop: CommandDialog; mobile: Drawer) --- */}
      {!isMobile ? (
        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} className="max-w-2xl">
          <CommandInput
            placeholder="Search keys, values, paths, or types..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[60vh]">
            {/* Loading skeleton */}
            {isSearching && (
              <CommandEmpty className="py-4">
                <div className="space-y-2">
                  {skeletonItems.map((i) => (
                    <div key={i} className="h-10 rounded bg-muted/40 animate-pulse" />
                  ))}
                </div>
              </CommandEmpty>
            )}

            {/* Empty / no term */}
            {!isSearching && !searchTerm && (
              <CommandEmpty className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p>Start typing to search JSON</p>
                  <p className="text-sm text-muted-foreground">Search keys, values, paths, and types</p>
                </div>
              </CommandEmpty>
            )}

            {/* No results */}
            {!isSearching && searchTerm && processedMatches.length === 0 && (
              <CommandEmpty className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p>No results found for <strong>{searchTerm}</strong></p>
                </div>
              </CommandEmpty>
            )}

            {/* Render results */}
            {processedMatches.length > 0 && (
              <>
                <CommandGroup
                  heading={
                    <div className="flex items-center justify-between w-full">
                      <span>Results ({searchResult?.metadata?.totalMatches ?? processedMatches.length})</span>
                      {searchResult?.metadata && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {(searchResult.metadata.searchTime ?? 0).toFixed(0)}ms
                        </span>
                      )}
                    </div>
                  }
                >
                  {processedMatches.map((m, idx) => (
                    <CommandItem
                      key={`${m.nodeId}-${idx}`}
                      value={`${m.key} ${m.path}`}
                      onSelect={() => handleResultSelect(m.raw)}
                      className="flex flex-col gap-2 p-3 cursor-pointer border-b last:border-b-0"
                      aria-label={`Open details for ${m.key}`}
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Icon for whether key or value matched (simple heuristic) */}
                          <div className="flex items-center gap-2 min-w-0">
                            {m.matchedIn.includes("key") && <Key className="h-4 w-4 text-muted-foreground" />}
                            {m.matchedIn.includes("value") && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {highlightMatches(m.key || m.path, searchTerm)}
                              </div>
                              <div className="text-xs text-muted-foreground truncate font-mono">
                                {highlightMatches(m.path, searchTerm)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary" className={`text-xs border ${getScoreColor(m.matchScore)}`}>
                            {(m.matchScore * 100).toFixed(0)}%
                          </Badge>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Contextual preview / value preview */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs text-muted-foreground italic break-all max-w-[60%]">
                          {/* if metadata.context exists use that, else show value preview */}
                          {m.context ? (
                            <>
                              {highlightMatches(m.context, searchTerm)}
                            </>
                          ) : (
                            <>
                              {m.matchedIn.includes("value")
                                ? highlightMatches(m.valuePreview, searchTerm)
                                : m.valuePreview}
                            </>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex flex-wrap gap-1">
                            {m.matchedIn.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {m.matchedIn.length > 3 && <Badge variant="outline" className="text-xs">+{m.matchedIn.length - 3}</Badge>}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Actions">
                  <CommandItem onSelect={() => copyToClipboard(searchTerm)} className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Search Term
                  </CommandItem>
                  <CommandItem onSelect={() => clearSearch()} className="cursor-pointer">
                    <Focus className="mr-2 h-4 w-4" />
                    Clear Search
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </CommandDialog>
      ) : (
        // Mobile drawer
        <Drawer open={searchOpen} onOpenChange={setSearchOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Search JSON</DrawerTitle>
              <DrawerDescription>Search keys, values, paths, and types</DrawerDescription>
            </DrawerHeader>

            <div className="p-3">
              <CommandInput placeholder="Search keys, values, paths, or types..." value={searchTerm} onValueChange={setSearchTerm} />
              <div className="mt-3 max-h-[60vh] overflow-auto">
                {isSearching && (
                  <div className="space-y-2">
                    {skeletonItems.map((i) => (
                      <div key={i} className="h-12 rounded bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                )}

                {!isSearching && !searchTerm && (
                  <div className="py-8 text-center">Start typing to search JSON</div>
                )}

                {!isSearching && searchTerm && processedMatches.length === 0 && (
                  <div className="py-8 text-center">No results for "{searchTerm}"</div>
                )}

                {processedMatches.length > 0 && (
                  <div className="space-y-2">
                    {processedMatches.map((m, idx) => (
                      <div
                        key={`${m.nodeId}-${idx}`}
                        onClick={() => {
                          handleResultSelect(m.raw);
                          // on mobile we close search so detail drawer doesn't stack
                          setSearchOpen(false);
                        }}
                        className="p-3 rounded border hover:bg-accent/20 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{highlightMatches(m.key, searchTerm)}</div>
                            <div className="text-xs text-muted-foreground truncate font-mono">{highlightMatches(m.path, searchTerm)}</div>
                          </div>
                          <Badge className={`text-xs ${getScoreColor(m.matchScore)}`}>{(m.matchScore * 100).toFixed(0)}%</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">{m.context ? highlightMatches(m.context, searchTerm) : m.valuePreview}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* --- Detail UI: Dialog (desktop) or Drawer (mobile) --- */}
      {!isMobile ? (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Result Details
                </DialogTitle>

                <div className="ml-4 flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setDetailOpen(false)} className="h-6 w-6">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogDescription>Detailed information about the selected match</DialogDescription>
            </DialogHeader>

            {selectedMatch ? (
              <ScrollArea className="flex-1 px-1">
                <div className="space-y-6 p-1">
                  {/* Header */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {selectedMatch.key}
                        <Badge variant="outline">{selectedMatch.dataType}</Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono break-all">{selectedMatch.path}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Match Score:</span>
                        <Badge variant="secondary" className={`text-sm ${getScoreColor(selectedMatch.matchScore)}`}>
                          {(selectedMatch.matchScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Relevance:</span>
                        <Badge variant="outline" className="text-sm">
                          {selectedMatch.metadata.relevance}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Exact Match:</span>
                        <Badge variant={selectedMatch.exactMatch ? "default" : "outline"}>
                          {selectedMatch.exactMatch ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Match Type:</span>
                        <div className="flex gap-2">
                          {selectedMatch.matches.includes("key") && <Badge variant="outline" className="text-sm">Key</Badge>}
                          {selectedMatch.matches.includes("value") && <Badge variant="outline" className="text-sm">Value</Badge>}
                          {selectedMatch.matches.includes("path") && <Badge variant="outline" className="text-sm">Path</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Value preview */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Value Preview
                    </h4>
                    <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm break-all">
                      {/* highlight if value is a string and matched */}
                      {typeof selectedMatch.value === "string"
                        ? highlightMatches(selectedMatch.value, searchTerm)
                        : getValuePreview(selectedMatch.value)}
                    </div>
                  </div>

                  {/* Matched locations & All matches */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Match Locations</h4>
                      <div className="space-y-2">
                        {selectedMatch.metadata.matchedIn.map((location, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-sm">{location}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">All Matches</h4>
                      <div className="space-y-2">
                        {selectedMatch.matches.map((m, i) => (
                          <div key={i} className="p-2 bg-muted/30 rounded text-sm">
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* context */}
                  {selectedMatch.metadata.context && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Context</h4>
                      <div className="p-3 bg-muted/30 rounded-lg text-sm italic">{highlightMatches(selectedMatch.metadata.context, searchTerm)}</div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No selection</div>
            )}

            {/* actions */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={() => copyToClipboard(selectedMatch?.path || "")} className="flex-1 sm:flex-none">
                <Copy className="h-4 w-4 mr-2" />
                Copy Path
              </Button>
              <Button variant="outline" onClick={() => copyToClipboard(String(selectedMatch?.value ?? ""))} className="flex-1 sm:flex-none">
                <Copy className="h-4 w-4 mr-2" />
                Copy Value
              </Button>
              {onZoomToNode && (
                <Button onClick={() => handleNavigateToNode(selectedMatch?.nodeId)} className="flex-1 sm:flex-none">
                  <Focus className="h-4 w-4 mr-2" />
                  Navigate to Node
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        // Mobile drawer for details
        <Drawer open={detailOpen} onOpenChange={setDetailOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedMatch?.key ?? "Result"}</DrawerTitle>
              <DrawerDescription className="truncate">{selectedMatch?.path ?? ""}</DrawerDescription>
            </DrawerHeader>

            <div className="p-3 max-h-[80vh] overflow-auto space-y-4">
              {selectedMatch ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium">{selectedMatch.key}</div>
                        <div className="text-xs text-muted-foreground font-mono break-all">{selectedMatch.path}</div>
                      </div>
                      <Badge className={`text-xs ${getScoreColor(selectedMatch.matchScore)}`}>{(selectedMatch.matchScore * 100).toFixed(0)}%</Badge>
                    </div>

                    <div className="p-2 bg-muted/30 rounded font-mono text-sm">{selectedMatch.metadata.context ? highlightMatches(selectedMatch.metadata.context, searchTerm) : getValuePreview(selectedMatch.value)}</div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Matched In</h4>
                    <div className="flex flex-col gap-2">
                      {selectedMatch.metadata.matchedIn.map((mi, idx) => (
                        <div key={idx} className="p-2 bg-muted/30 rounded text-sm">{mi}</div>
                      ))}
                    </div>
                  </div>

                  {selectedMatch.metadata.context && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Context</h4>
                      <div className="p-2 bg-muted/30 rounded text-sm italic">{highlightMatches(selectedMatch.metadata.context, searchTerm)}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground">No selection</div>
              )}
            </div>

            <div className="p-3 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(selectedMatch?.path || "")}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Path
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(String(selectedMatch?.value ?? ""))}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Value
              </Button>
              {onZoomToNode && (
                <Button className="flex-1" onClick={() => handleNavigateToNode(selectedMatch?.nodeId)}>
                  <Focus className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};
