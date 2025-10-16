// React imports for state management, lifecycle, and memoization
import { useState, useEffect, useCallback, useRef } from 'react';

// Custom types
import { JsonValue } from '@/types/JsonTypes';
import { SearchResult } from '@/types/Search';

// Custom search utility that handles JSON traversal and scoring
import { JsonSearch } from "../utils/JsonSearch";

interface UseJsonSearchProps {
  jsonData: JsonValue;   // JSON to be searched
  debounceMs?: number;   // Wait time before search triggers
  minScore?: number;     // Minimum similarity score for match
  maxResults?: number;   // Max results returned
}

export const useJsonSearch = ({
  jsonData,
  debounceMs = 300,
  minScore = 0.1,
  maxResults = 100
}: UseJsonSearchProps) => {
  // Search term and result state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Ref for debouncing search calls
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Perform the actual search using JsonSearch utility
  const performSearch = useCallback((term: string) => {
    // Ignore empty terms
    if (!term.trim()) {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      // Call JsonSearch utility
      const result = JsonSearch.search(jsonData, term, {
        minScore,
        maxResults
      });

      // ✅ Expecting SearchResult structure
      // {
      //   matches: [],
      //   metadata: {
      //     totalMatches: number;
      //     searchTerm: string;
      //     searchTime: number;
      //     breakdown: {
      //       byType: Record<string, number>;
      //       byRelevance: Record<string, number>;
      //       byMatchType: Record<string, number>;
      //     };
      //     suggestions?: string[];
      //   }
      // }

      setSearchResult(result);
    } catch (error) {
      console.error('search error:', error);
      // Fallback to a safe empty SearchResult structure
      setSearchResult({
        matches: [],
        metadata: {
          totalMatches: 0,
          searchTerm: term,
          searchTime: 0,
          breakdown: {
            byType: {},
            byRelevance: {},
            byMatchType: {}
          },
          suggestions: ['Search failed - please try again']
        }
      });
    } finally {
      setIsSearching(false);
    }
  }, [jsonData, minScore, maxResults]);

  // 🔁 Debounced search logic
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (searchTerm.trim()) {
      setIsSearching(true);
      timeoutRef.current = setTimeout(() => performSearch(searchTerm), debounceMs);
    } else {
      setSearchResult(null);
      setIsSearching(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchTerm, performSearch, debounceMs]);

  // Clear current search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResult(null);
    setIsSearching(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResult,
    isSearching,
    clearSearch,
    hasResults: searchResult ? searchResult.matches.length > 0 : false
  };
};
