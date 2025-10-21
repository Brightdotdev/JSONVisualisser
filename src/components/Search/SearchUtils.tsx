import { ResultDetailsProps, SearchFiltersProps, SearchOptions, SearchResult, SearchResultsProps } from "@/types/Search";
import { BarChart3, CaseSensitive, Check, Copy, ExternalLink, FileText, Key, MapPin, MessageSquare, Search, Type } from "lucide-react";
import { useId, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";



// utitlities

  const highlightMatches = (text: string, term: string) => {
    if (!term) return text;
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedTerm})`, "ig");
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark 
          key={i} 
          className="bg-alt1 px-0.5 rounded"
          aria-label="matched text"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 0.7) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getValuePreview = (value: any): string => {
    if (value === null) return "null";
    if (typeof value === "object") {
      if (Array.isArray(value)) return `Array[${value.length}]`;
      return `Object{${Object.keys(value || {}).length}}`;
    }
    if (typeof value === "string") return value.length > 120 ? `${value.slice(0, 120)}...` : value;
    return String(value);
  };





  
  
  const ResultDetails = ({ result, searchQuery, isOpen, onClose }: ResultDetailsProps) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    

  
    const getValuePreview = (value: any): string => {
      if (value === null) return "null";
      if (typeof value === "object") {
        if (Array.isArray(value)) return `Array with ${value.length} items`;
        return `Object with ${Object.keys(value || {}).length} properties`;
      }
      if (typeof value === "string") return value.length > 200 ? `${value.slice(0, 200)}...` : value;
      return String(value);
    };
  
    const highlightMatches = (text: string, term: string) => {
      if (!term) return text;
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedTerm})`, "ig");
      const parts = String(text).split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-alt1 px-0.5 rounded" aria-label="matched text">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    };
  
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
    };
  
    const content = result ? (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              {result.isKeyMatch && <Key className="h-5 w-5 text-blue-600" aria-hidden="true" />}
              {result.isValueMatch && <MessageSquare className="h-5 w-5 text-green-600" aria-hidden="true" />}
              <DialogTitle className="text-lg font-semibold">
                {result.key}
              </DialogTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={getScoreColor(result.matchScore)}>
                Match: {(result.matchScore * 100).toFixed(0)}%
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                {result.dataType}
              </Badge>
              {result.isKeyMatch && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Key Match
                </Badge>
              )}
              {result.isValueMatch && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Value Match
                </Badge>
              )}
            </div>
          </div>
         
        </div>
  
        <Separator />
  
        {/* Path Information */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            JSON Path
          </h3>
          <div className="p-3 bg-muted rounded-lg font-mono text-sm">
            {highlightMatches(result.fullPath, searchQuery)}
          </div>
      
            <CopyButton text={result.fullPath} />
        </div>
  
        {/* Value Preview */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Value
          </h3>
          <ScrollArea className="h-32">
            <div className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
              {typeof result.value === 'string' 
                ? highlightMatches(result.value, searchQuery)
                : getValuePreview(result.value)
              }
            </div>
          </ScrollArea>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(String(result.value))}
            className="flex items-center gap-2"
          >
            <Copy className="h-3 w-3" />
            Copy Value
          </Button>
        </div>
  
        {/* Metadata */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Match Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Match Type:</span>
              <div className="mt-1 space-y-1">
                {result.isKeyMatch && (
                  <Badge variant="outline" className="text-xs">
                    Key
                  </Badge>
                )}
                {result.isValueMatch && (
                  <Badge variant="outline" className="text-xs">
                    Value
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium">Data Type:</span>
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  {result.dataType}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  
    if (isDesktop) {
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            className="max-w-2xl max-h-[80vh]" 
            aria-labelledby="result-details-title"
          >
            <DialogHeader>
              <DialogTitle id="result-details-title">
                Result for "{searchQuery}"
              </DialogTitle>
       
            </DialogHeader>
            <ScrollArea className="flex-1 px-1">
              {content}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      );
    }
  
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Result for "{searchQuery}"</DrawerTitle>
         
          </DrawerHeader>
          <ScrollArea className="px-4 max-h-[70vh]">
            <div className="pb-4">
              {content}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  };
  


  
const CopyButton   = ({text} :  { text : string }) => {
  // State to track if the copy animation is active
  const [copied, setCopied] = useState(false);

  // Function to copy text to clipboard
  const copyToClipboard = (text : string) => {
    navigator.clipboard.writeText(text);
    setCopied(true); // Trigger animation
    setTimeout(() => setCopied(false), 1500); 
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text)}
      className={`flex items-center gap-2 transition-all duration-300 ${
        copied ? " border-green-700 border-2" : ""
      }`}
    >
      {/* Icon changes with animation */}
      {copied ? (
        <Check className="h-3 w-3 animate-scale" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {/* Text changes smoothly */}
      <span className={`transition-opacity duration-300 ${copied ? "opacity-80" : "opacity-100"}`}>
        {copied ? "Copied!" : "Copy Path"}
      </span>
    </Button>
  );
}






export const SearchFilters = ({ options, onOptionChange }: SearchFiltersProps) => {
  const id = useId();

  const filterItems = [
    { 
      key: 'caseSensitive' as const,
      label: "Case Sensitive", 
      Icon: CaseSensitive, 
      defaultChecked: false,
      description: "Match exact casing"
    },
    { 
      key: 'fuzzyMatch' as const,
      label: "Fuzzy Match", 
      Icon: Search, 
      defaultChecked: true,
      description: "Allow approximate matches"
    },
    { 
      key: 'searchInKeys' as const,
      label: "Search Keys", 
      Icon: Key, 
      defaultChecked: true,
      description: "Search in property names"
    },
    { 
      key: 'searchInValues' as const,
      label: "Search Values", 
      Icon: MessageSquare, 
      defaultChecked: true,
      description: "Search in property values"
    },
  ];
 const handleCheckboxChange = (key: keyof SearchOptions, value: boolean) => {
    onOptionChange({ [key]: value });
  };



  return (
    <div className="flex flex-col gap-2 md:py-4 py-2 px-2 border-b">      
      <div className="grid grid-cols-4 gap-2">
        {filterItems.map((item) => (
          <div
            key={`${id}-${item.key}`}
            className="relative flex cursor-pointer flex-col gap-3 rounded-md border border-input p-2 shadow-xs outline-none transition-colors hover:border-primary/30 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5"
            aria-checked={options[item.key] ?? item.defaultChecked}
            title={item.description}
          >
            <div className="flex justify-between gap-2">
              <Checkbox
                id={`${id}-${item.key}`}
                checked={options[item.key] ?? item.defaultChecked}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(item.key, checked === true)
                }
                className="order-1 after:absolute after:inset-0 "
              />
              <item.Icon className="opacity-60 size-4"  aria-hidden="true" />
            </div>
            
            <div className="md:flex hidden flex-col gap-2">
              <Label 
                htmlFor={`${id}-${item.key}`}
                className="md:text-sm text-xs font-medium cursor-pointer"
              >
                {item.label}
              </Label>
              <p className="text-xs text-muted-foreground md:flex hidden">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};








export const SearchResults = ({ searchResults, searchQuery }: SearchResultsProps) => {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
 
  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedResult(null);
  };
  if (searchResults.length === 0) {

    return null;
  }


  return (
    <>
      <div 
        role="listbox" 
        aria-label="Search results" 
        className="flex flex-col"
      >
        {searchResults.map((result, index) => (
          <div
            key={`${result.fullPath}-${index}`}
            role="option"
            aria-selected={selectedResult?.fullPath === result.fullPath}
            tabIndex={0}
            onClick={() => handleResultSelect(result)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleResultSelect(result);
              }
            }}
            className="flex flex-col gap-2 px-2 py-1  cursor-pointer border-b  hover:border-primary/50 hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`Search result: ${result.key} with ${(result.matchScore * 100).toFixed(0)}% match score`}
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {result.isKeyMatch && (
                    <Key 
                      className="h-4 w-4 text-blue-600 flex-shrink-0" 
                      aria-label="Key match"
                    />
                  )}
                  {result.isValueMatch && (
                    <MessageSquare 
                      className="h-4 w-4 text-green-600 flex-shrink-0" 
                      aria-label="Value match"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div 
                      className="font-medium truncate text-base"
                      aria-label={`Key: ${result.key}`}
                    >
                      {highlightMatches(result.key, searchQuery)}
                    </div>
                    <div 
                      className="text-sm text-muted-foreground truncate font-mono mt-1"
                      aria-label={`Path: ${result.path}`}
                    >
                      {highlightMatches(result.fullPath, searchQuery)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="secondary" 
                  className={`text-xs border ${getScoreColor(result.matchScore)}`}
                  aria-label={`Match score: ${(result.matchScore * 100).toFixed(0)} percent`}
                >
                  {(result.matchScore * 100).toFixed(0)}%
                </Badge>
                <ExternalLink 
                  className="h-3 w-3 text-muted-foreground" 
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Value Preview */}
            <div 
              className="text-sm text-muted-foreground break-words"
              aria-label={`Value preview: ${getValuePreview(result.value)}`}
            >
              {getValuePreview(result.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Result Details Modal/Drawer */}
      <ResultDetails
        result={selectedResult}
        searchQuery={searchQuery}
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
      />
    </>
  );
};
