// JsonSearchCommand.tsx
import { useJsonSearch } from '@/hooks/useJsonSearch';
import { SearchOptions, SearchResult } from '@/types/Search';
import React, { JSX, useCallback, useEffect, useId, useState } from 'react';
import { Button } from '../ui/button';
import { BarChart3, CaseSensitive, Key, MessageSquare, Search } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from '../ui/command';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';


interface JsonSearchCommandProps {
  data: any;
  onResultClick?: (result: SearchResult) => void;

}

interface SearchFiltersProps {
  options: {
    caseSensitive?: boolean;
    fuzzyMatch?: boolean;
    searchInKeys?: boolean;
    searchInValues?: boolean;
  };
  onOptionChange: (newOptions: Partial<SearchOptions>) => void;
}


const SearchFilters = ({ options, onOptionChange }: SearchFiltersProps) => {
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
    <div className="space-y-2 py-4 px-2 border-b">      
      <div className="grid grid-cols-4 gap-2">
        {filterItems.map((item) => (
          <div
            key={`${id}-${item.key}`}
            className="relative flex cursor-pointer flex-col gap-3 rounded-md border border-input p-2 shadow-xs outline-none transition-colors hover:border-primary/30 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5"
          >
            <div className="flex justify-between gap-2">
              <Checkbox
                id={`${id}-${item.key}`}
                checked={options[item.key] ?? item.defaultChecked}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(item.key, checked === true)
                }
                className="order-1 after:absolute after:inset-0"
              />
              <item.Icon className="opacity-60" size={16} aria-hidden="true" />
            </div>
            
            <div className="space-y-1">
              <Label 
                htmlFor={`${id}-${item.key}`}
                className="text-sm font-medium cursor-pointer"
              >
                {item.label}
              </Label>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};




export const JsonSearchCommand: React.FC<JsonSearchCommandProps> = ({
  data,
  onResultClick}) => {
  const {
    searchResults,
    search,
    searchQuery,
    isSearching,
    options,
    updateOptions,
    dataTypes
  } = useJsonSearch(data);
  const [searchOpen, setSearchOpen] = useState(false);

  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);
    useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Toggle search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);




  const highlightMatch = (text: string, query: string): JSX.Element => {
    if (!query) return <>{text}</>;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className=" px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };


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
  
    
    
  
    // Copy helpers
    const copyToClipboard = useCallback((text: string) => {
      navigator.clipboard.writeText(text);
    }, []);
  

    

  return (
    <>
  
      {
        !searchOpen && (
               <Button
        variant="outline"
        size="sm"
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 fixed top-5 left-5 z-50 shadow-sm"
        aria-label="Open JSON search (Cmd/Ctrl+K)"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search JSON</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
        )
      }


      {/* Search Options */}
     


      
          <CommandDialog  open={searchOpen} onOpenChange={setSearchOpen} className="min-w-[80vw] ">

    <CommandInput
            placeholder="Search keys, values, paths, or types..."
            value={searchQuery}
            onValueChange={(value: string) => search(value)}
          />

    
      <SearchFilters 
    options={options}
    onOptionChange={updateOptions}
  />
    
    
    
  <CommandList className="max-h-[60vh] ">



    {isSearching && (
    <CommandEmpty className="py-4">
      <div className="space-y-2">
          {skeletonItems.map((i) => (
      <div key={i} className="h-10 rounded bg-muted/40 animate-pulse" />
    ))}
  </div>
</CommandEmpty>
  )}


{!isSearching && !searchQuery && (
  <CommandEmpty className="py-8 text-center">
    <div className="flex flex-col items-center gap-2">
      <Search className="h-8 w-8 text-muted-foreground" />
      <p>Start typing to search JSON</p>
      <p className="text-sm text-muted-foreground">Search keys, values, paths, and types</p>
    </div>
    
  </CommandEmpty>
)}
      {!isSearching && searchQuery && searchResults.length === 0 && (
                  <CommandEmpty className="py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p>No results found for <strong>{searchQuery}</strong></p>
                    </div>
                  </CommandEmpty>
        )}

      {/* Results */}
      <div className="">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            Results ({searchResults.length})
          </h3>
    
        </div>



        <div className="space-y-2">
          {searchResults.map((result, index) => (
            <div
              key={`${result.fullPath}-${index}`}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onResultClick?.(result)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono text-sm">
                  {highlightMatch(result.fullPath, searchQuery)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.isKeyMatch 
                      ? ' text-blue-800' 
                      : ' text-green-800'
                  }`}>
                    {result.isKeyMatch ? 'Key Match' : 'Value Match'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs">
                    {result.dataType}
                  </span>
                  <span className="text-xs">
                    Score: {result.matchScore.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <strong>Value:</strong> {String(result.value)}
              </div>
              
              {result.path && (
                <div className="text-xs mt-1">
                  Path: {result.path}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
  </CommandList>

          </CommandDialog>



    </>
  );
};