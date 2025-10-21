// JsonSearchCommand.tsx
import { useJsonSearch } from '@/hooks/Reactflow/useJsonSearch';

import React, {  useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {  Search } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from '../ui/command';
import { SearchFilters, SearchResults } from './SearchUtils';



interface JsonSearchCommandProps {
  data: any
}







export const JsonSearchCommand: React.FC<JsonSearchCommandProps> = ({
  data}) => {
  const {
    searchResults,
    search,
    searchQuery,
    isSearching,
    options,
    updateOptions,
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
        className="flex items-center gap-2 shadow-sm rounded-xs"
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
     


      
          <CommandDialog  open={searchOpen} onOpenChange={setSearchOpen} className=" min-w-[80vw]">

    <CommandInput
            placeholder="Search keys, values, paths, or types..."
            value={searchQuery}
            onValueChange={(value: string) => search(value)}
          />

    
      <SearchFilters 
    options={options}
    onOptionChange={updateOptions}
  />
    
    
    
  <CommandList className="md:max-h-[60vh] max-h-[30vh] ">



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