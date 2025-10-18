// types.ts
export interface SearchResult {
  path: string;
  key: string;
  value: any;
  fullPath: string;
  dataType: string;
  isKeyMatch: boolean;
  isValueMatch: boolean;
  matchScore: number;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
  maxResults?: number;
  searchInKeys?: boolean;
  searchInValues?: boolean;
  minMatchScore?: number;
}


export interface SearchFiltersProps {
  options: {
    caseSensitive?: boolean;
    fuzzyMatch?: boolean;
    searchInKeys?: boolean;
    searchInValues?: boolean;
  };
  onOptionChange: (newOptions: Partial<SearchOptions>) => void;
}

export interface SearchResultsProps {
  searchResults: SearchResult[];
  searchQuery: string;
}

export interface ResultDetailsProps {
  result: SearchResult | null;
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
}