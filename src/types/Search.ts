// types/search.ts
export interface SearchMatch {
  nodeId: string;
  path: string;
  key: string;
  value: any;
  dataType: string;
  matchType: 'key' | 'value' | 'path' | 'type' | 'structure';
  matchScore: number; // 0-1 score for relevance
  matches: string[];
  exactMatch: boolean;
  metadata: {
    searchTerm: string;
    matchedIn: string[]; // Where the match was found
    relevance: 'exact' | 'high' | 'medium' | 'low';
    context?: string; // Additional context about the match
  };
}

export interface SearchResult {
  matches: SearchMatch[];
  metadata: {
    totalMatches: number;
    searchTerm: string;
    searchTime: number;
    breakdown: {
      byType: Record<string, number>;
      byRelevance: Record<string, number>;
      byMatchType: Record<string, number>;
    };
    suggestions?: string[];
  };
}

export type SearchRelevance = 'exact' | 'high' | 'medium' | 'low';