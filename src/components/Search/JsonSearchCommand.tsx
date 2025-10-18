// JsonSearchCommand.tsx
import { useJsonSearch } from '@/hooks/useJsonSearch';
import { SearchOptions, SearchResult } from '@/types/Search';
import React, { JSX, useCallback, useEffect, useId, useState } from 'react';
import { Button } from '../ui/button';
import { BarChart3, CaseSensitive, Copy, ExternalLink, FileText, Focus, Key, MapPin, MessageSquare, Search, Type, X } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogContent } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../ui/drawer';
import { SearchFilters, SearchResults } from './SearchUtils';


interface JsonSearchCommandProps {
  data: any;
  onResultClick?: (result: SearchResult) => void;

}







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



  return (
    <>
  
      {
        !searchOpen && (
               <Button
        variant="outline"
        size="sm"
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 fixed top-5 md:left-5 left-3 z-50 shadow-sm rounded-xs"
        title="Search In Your Json File"
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




          {(searchQuery && searchResults.length > 0 && !isSearching )  && (
            <SearchResults searchQuery={searchQuery} searchResults={searchResults} />
          )} 

      </CommandList>
      
          </CommandDialog>



    </>
  );
};