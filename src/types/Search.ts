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