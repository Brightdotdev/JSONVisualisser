import { SearchResult, SearchMatch, SearchRelevance } from "@/types/Search";

export class JsonSearch {
  // --- match scoring helpers ---
  private static calculateMatchScore(content: string, searchTerm: string): number {
    const contentLower = content.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    if (contentLower === searchLower) return 1.0;
    if (contentLower.startsWith(searchLower)) return 0.9;
    if (contentLower.endsWith(searchLower)) return 0.8;
    
    const words = contentLower.split(/\W+/);
    if (words.includes(searchLower)) return 0.7;
    
    if (contentLower.includes(searchLower)) return 0.6;

    // Fuzzy matching fallback
    const similarity = this.calculateSimilarity(contentLower, searchLower);
    return similarity > 0.7 ? 0.5 + similarity * 0.3 : similarity * 0.3;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    return matches / longer.length;
  }

  private static getRelevance(score: number): SearchRelevance {
    if (score >= 0.9) return "exact";
    if (score >= 0.7) return "high";
    if (score >= 0.4) return "medium";
    return "low";
  }

  private static getContext(value: any, searchTerm: string): string {
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      const term = searchTerm.toLowerCase();
      const index = lower.indexOf(term);
      
      if (index >= 0) {
        const start = Math.max(0, index - 20);
        const end = Math.min(value.length, index + term.length + 20);
        const excerpt = value.slice(start, end);
        return `..."${excerpt}"...`;
      }
    }
    return String(value).slice(0, 100);
  }

  // --- recursive search ---
  static search(
    jsonData: any,
    searchTerm: string,
    options: { minScore?: number; maxResults?: number } = {}
  ): SearchResult {
    const start = performance.now();
    const { minScore = 0.1, maxResults = 100 } = options;
    const matches: SearchMatch[] = [];
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      return {
        matches: [],
        metadata: {
          totalMatches: 0,
          searchTerm,
          searchTime: 0,
          breakdown: { byType: {}, byRelevance: {}, byMatchType: {} },
        },
      };
    }

    const searchRecursive = (
      data: any,
      currentPath: string,
      key: string = '',
      depth: number = 0
    ) => {
      if (matches.length >= maxResults) return;
      if (data === null || data === undefined) return;

      const dataType = Array.isArray(data) ? 'array' : typeof data;
      const nodeId = currentPath || 'root';
      const currentKey = key || 'root';

      // Check current value if it's a primitive
      if (dataType !== 'object' && dataType !== 'array') {
        const valueStr = String(data);
        const valueScore = this.calculateMatchScore(valueStr, term);
        
        if (valueScore >= minScore) {
          matches.push({
            nodeId,
            path: currentPath,
            key: currentKey,
            value: data,
            dataType,
            matchType: 'value',
            matchScore: valueScore,
            matches: [`Value: ${valueStr}`],
            exactMatch: valueScore >= 0.9,
            metadata: {
              searchTerm,
              matchedIn: ['value'],
              relevance: this.getRelevance(valueScore),
              context: this.getContext(data, searchTerm),
            },
          });
        }
      }

      // Check key/path matches
      if (key) {
        const keyScore = this.calculateMatchScore(key, term);
        if (keyScore >= minScore) {
          matches.push({
            nodeId,
            path: currentPath,
            key: currentKey,
            value: data,
            dataType,
            matchType: 'key',
            matchScore: keyScore,
            matches: [`Key: ${key}`],
            exactMatch: keyScore >= 0.9,
            metadata: {
              searchTerm,
              matchedIn: ['key'],
              relevance: this.getRelevance(keyScore),
              context: this.getContext(data, searchTerm),
            },
          });
        }
      }

      // Check path matches
      const pathScore = this.calculateMatchScore(currentPath, term);
      if (pathScore >= minScore && currentPath !== 'root') {
        matches.push({
          nodeId,
          path: currentPath,
          key: currentKey,
          value: data,
          dataType,
          matchType: 'path',
          matchScore: pathScore,
          matches: [`Path: ${currentPath}`],
          exactMatch: pathScore >= 0.9,
          metadata: {
            searchTerm,
            matchedIn: ['path'],
            relevance: this.getRelevance(pathScore),
            context: this.getContext(data, searchTerm),
          },
        });
      }

      // Recursively search through objects and arrays
      if (dataType === 'object' && data !== null) {
        Object.keys(data).forEach(childKey => {
          const childValue = data[childKey];
          const childPath = currentPath === 'root' ? `root.${childKey}` : `${currentPath}.${childKey}`;
          searchRecursive(childValue, childPath, childKey, depth + 1);
        });
      } else if (dataType === 'array' && Array.isArray(data)) {
        data.forEach((item, index) => {
          const arrayKey = `[${index}]`;
          const childPath = currentPath === 'root' ? `root[${index}]` : `${currentPath}[${index}]`;
          searchRecursive(item, childPath, arrayKey, depth + 1);
        });
      }
    };

    // Start the search from root
    searchRecursive(jsonData, 'root', 'root');

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    const end = performance.now();

    // Generate breakdown
    const breakdown = {
      byType: this.countBy(matches, 'dataType'),
      byRelevance: this.countBy(matches, (m) => m.metadata.relevance),
      byMatchType: this.countBy(matches, 'matchType'),
    };

    // Generate suggestions
    const suggestions = this.generateSuggestions(matches, searchTerm);

    return {
      matches: matches.slice(0, maxResults),
      metadata: {
        totalMatches: matches.length,
        searchTerm,
        searchTime: end - start,
        breakdown,
        suggestions,
      },
    };
  }

  private static countBy<T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, number> {
    const fn = typeof key === 'function' ? key : (item: T) => String(item[key]);
    return arr.reduce<Record<string, number>>((acc, item) => {
      const k = fn(item);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }

  private static generateSuggestions(matches: SearchMatch[], searchTerm: string): string[] {
    const suggestions: string[] = [];
    
    const exactMatches = matches.filter(m => m.exactMatch);
    const highMatches = matches.filter(m => m.matchScore >= 0.7);

    if (exactMatches.length === 0 && highMatches.length === 0) {
      suggestions.push('Try a broader search term');
      suggestions.push('Check for typos in your search');
    }

    // Suggest based on data types found
    const dataTypes = new Set(matches.map(m => m.dataType));
    if (dataTypes.has('string')) {
      suggestions.push('String values found - search for specific text content');
    }
    
    if (dataTypes.has('number')) {
      suggestions.push('Numeric values found - try searching for specific numbers');
    }

    if (matches.some(m => m.dataType === 'object')) {
      suggestions.push('Objects found - expand to see nested properties');
    }

    if (matches.some(m => m.dataType === 'array')) {
      suggestions.push('Arrays found - expand to see items');
    }

    return suggestions.slice(0, 3);
  }
}