// useJsonSearch.ts
import { SearchOptions, SearchResult } from '@/types/Search';
import { JsonSearch } from '@/utils/JsonSearch';
import { useState, useMemo, useCallback } from 'react';


export const useJsonSearch = (data: any, initialOptions?: SearchOptions) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<SearchOptions>(initialOptions || {});
  const [isSearching, setIsSearching] = useState(false);

  const jsonSearch = useMemo(() => new JsonSearch(data, options), [data, options]);

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) {
      return [];
    }

    setIsSearching(true);
    const results = jsonSearch.search(searchQuery);
    setIsSearching(false);
    
    return results;
  }, [jsonSearch, searchQuery]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Add timeout to avoid blocking UI and add debugging
    setTimeout(() => {
     
      
      const results = jsonSearch.search(query);
      setIsSearching(false);
    }, 0);
  }, [jsonSearch]);

  const updateOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const dataTypes = useMemo(() => jsonSearch.getDataTypes(), [jsonSearch]);

  return {
    searchResults,
    search,
    searchQuery,
    isSearching,
    options,
    updateOptions,
    dataTypes
  };
};