// JsonSearch.ts
import { SearchResult, SearchOptions } from "@/types/Search";

export class JsonSearch {
  private data: any;
  private options: Required<SearchOptions>;

  constructor(data: any, options: SearchOptions = {}) {
    this.data = data;
    this.options = {
      caseSensitive: false,
      fuzzyMatch: true,
      maxResults: 50,
      searchInKeys: true,
      searchInValues: true,
      minMatchScore: 0.3,
      ...options
    };
  }

  public search(query: string): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const results: SearchResult[] = [];
    this.traverseObject(this.data, '', results, query);
    
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, this.options.maxResults)
      .filter(result => result.matchScore >= this.options.minMatchScore);
  }

  private traverseObject(
    obj: any, 
    path: string, 
    results: SearchResult[], 
    query: string
  ): void {
    if (obj === null || obj === undefined) {
      return;
    }

    if (typeof obj === 'object') {
      // Check if it's an array
      if (Array.isArray(obj)) {
        for (let index = 0; index < obj.length; index++) {
          const value = obj[index];
          const currentPath = path ? `${path}[${index}]` : `[${index}]`;
          
          // For arrays, we can search in values but not in "keys" (indices)
          if (this.options.searchInValues && typeof value !== 'object') {
            const stringValue = String(value);
            const valueMatch = this.calculateMatch(stringValue, query);
            if (valueMatch.score > 0) {
              results.push({
                path,
                key: `[${index}]`,
                value,
                fullPath: currentPath,
                dataType: this.getDataType(value),
                isKeyMatch: false,
                isValueMatch: true,
                matchScore: valueMatch.score
              });
            }
          }

          // Recursively traverse nested objects and arrays within the array
          if (typeof value === 'object' && value !== null) {
            this.traverseObject(value, currentPath, results, query);
          }
        }
      } else {
        // It's a regular object
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            // Search in keys
            if (this.options.searchInKeys) {
              const keyMatch = this.calculateMatch(key, query);
              if (keyMatch.score > 0) {
                results.push({
                  path,
                  key,
                  value,
                  fullPath: currentPath,
                  dataType: this.getDataType(value),
                  isKeyMatch: true,
                  isValueMatch: false,
                  matchScore: keyMatch.score
                });
              }
            }

            // Search in values
            if (this.options.searchInValues && typeof value !== 'object') {
              const stringValue = String(value);
              const valueMatch = this.calculateMatch(stringValue, query);
              if (valueMatch.score > 0) {
                results.push({
                  path,
                  key,
                  value,
                  fullPath: currentPath,
                  dataType: this.getDataType(value),
                  isKeyMatch: false,
                  isValueMatch: true,
                  matchScore: valueMatch.score
                });
              }
            }

            // Recursively traverse nested objects and arrays
            if (typeof value === 'object' && value !== null) {
              this.traverseObject(value, currentPath, results, query);
            }
          }
        }
      }
    }
  }

  private calculateMatch(text: string, query: string): { score: number; matched: boolean } {
    const searchText = this.options.caseSensitive ? text : text.toLowerCase();
    const searchQuery = this.options.caseSensitive ? query : query.toLowerCase();

    // Exact match
    if (searchText === searchQuery) {
      return { score: 1.0, matched: true };
    }

    // Contains match
    if (searchText.includes(searchQuery)) {
      return { score: 0.8, matched: true };
    }

    // Fuzzy match
    if (this.options.fuzzyMatch) {
      const fuzzyScore = this.fuzzyMatch(searchText, searchQuery);
      if (fuzzyScore > this.options.minMatchScore) {
        return { score: fuzzyScore, matched: true };
      }
    }

    return { score: 0, matched: false };
  }

  private fuzzyMatch(text: string, query: string): number {
    let textIndex = 0;
    let queryIndex = 0;
    let matches = 0;

    while (textIndex < text.length && queryIndex < query.length) {
      if (text[textIndex] === query[queryIndex]) {
        matches++;
        queryIndex++;
      }
      textIndex++;
    }

    if (matches === query.length) {
      return 0.6; // All characters matched in order
    }

    return matches / query.length;
  }

  private getDataType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  // Utility method to get all unique data types in the JSON
  public getDataTypes(): string[] {
    const types = new Set<string>();
    this.collectDataTypes(this.data, types);
    return Array.from(types);
  }

  private collectDataTypes(obj: any, types: Set<string>): void {
    if (obj === null || obj === undefined) {
      types.add('null');
      return;
    }

    if (typeof obj === 'object') {
      types.add(Array.isArray(obj) ? 'array' : 'object');
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value !== 'object') {
            types.add(typeof value);
          } else {
            this.collectDataTypes(value, types);
          }
        }
      }
    } else {
      types.add(typeof obj);
    }
  }
}