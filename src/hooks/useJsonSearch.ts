// hooks/useJsonSearch.ts
import { useState, useEffect, useCallback, useRef } from 'react';

import { JsonValue } from '@/types/JsonTypes';
import { SearchResult } from '@/types/Search';
import { JsonSearch } from "../utils/jsonSearch";



interface UseJsonSearchProps {
  jsonData: JsonValue;
  debounceMs?: number;
  minScore?: number;
  maxResults?: number;
}

export const useJsonSearch = ({
  jsonData,
  debounceMs = 300,
  minScore = 0.1,
  maxResults = 100
}: UseJsonSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const result = JsonSearch.search(jsonData, term, {
        minScore,
        maxResults
      });
      
      setSearchResult(result);
      
      // Update search history
      setSearchHistory(prev => {
        const newHistory = [term, ...prev.filter(t => t !== term)].slice(0, 10);
        return newHistory;
      });
    } catch (error) {
      console.error('Advanced search error:', error);
      setSearchResult({
        matches: [],
        metadata: {
          totalMatches: 0,
          searchTerm: term,
          searchTime: 0,
          breakdown: { byType: {}, byRelevance: {}, byMatchType: {} },
          suggestions: ['Search failed - please try again']
        }
      });
    } finally {
      setIsSearching(false);
    }
  }, [jsonData, minScore, maxResults]);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchTerm.trim()) {
      setIsSearching(true);
      timeoutRef.current = setTimeout(() => {
        performSearch(searchTerm);
      }, debounceMs);
    } else {
      setSearchResult(null);
      setIsSearching(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, performSearch, debounceMs]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResult(null);
    setIsSearching(false);
  }, []);

  const searchFromHistory = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResult,
    isSearching,
    searchHistory,
    clearSearch,
    searchFromHistory,
    hasResults: searchResult ? searchResult.matches.length > 0 : false
  };
};