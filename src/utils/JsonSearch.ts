import { SearchMatch, SearchRelevance, SearchResult } from "@/types/Search";

// utils/JsonSearch.ts
export class JsonSearch {
  private static calculateMatchScore(
    content: string,
    searchTerm: string,
    matchType: SearchMatch['matchType']
  ): number {
    const contentLower = content.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    // Exact match (highest score)
    if (contentLower === searchLower) return 1.0;
    
    // Starts with search term
    if (contentLower.startsWith(searchLower)) return 0.9;
    
    // Ends with search term
    if (contentLower.endsWith(searchLower)) return 0.8;
    
    // Contains as whole word
    const words = contentLower.split(/\W+/);
    if (words.includes(searchLower)) return 0.7;
    
    // Contains as substring
    if (contentLower.includes(searchLower)) return 0.6;
    
    // Fuzzy matching - Levenshtein distance based
    const similarity = this.calculateSimilarity(contentLower, searchLower);
    if (similarity > 0.7) return 0.5 + (similarity * 0.3);
    
    // Very weak match
    return similarity * 0.3;
  }
  
  private static calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation (can be enhanced with more sophisticated algorithms)
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Check for common subsequences
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    return matches / longer.length;
  }
  
  private static getRelevance(score: number): SearchRelevance {
    if (score >= 0.9) return 'exact';
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }
  
  private static getContext(value: any, searchTerm: string): string {
    if (typeof value === 'string' && value.length > 50) {
      const index = value.toLowerCase().indexOf(searchTerm.toLowerCase());
      if (index >= 0) {
        const start = Math.max(0, index - 20);
        const end = Math.min(value.length, index + searchTerm.length + 20);
        const excerpt = value.slice(start, end);
        return `..."${excerpt}"...`;
      }
    }
    return String(value).slice(0, 100);
  }
  
  static search(
    jsonData: any,
    searchTerm: string,
    options: {
      minScore?: number;
      includeTypes?: string[];
      maxResults?: number;
    } = {}
  ): SearchResult {
    const startTime = performance.now();
    const {
      minScore = 0.1,
      includeTypes = ['key', 'value', 'path', 'type', 'structure'],
      maxResults = 100
    } = options;
    
    const matches: SearchMatch[] = [];
    const searchLower = searchTerm.toLowerCase().trim();
    
    if (!searchLower) {
      return {
        matches: [],
        metadata: {
          totalMatches: 0,
          searchTerm,
          searchTime: 0,
          breakdown: { byType: {}, byRelevance: {}, byMatchType: {} }
        }
      };
    }
    
    const searchRecursive = (
      data: any,
      currentPath: string,
      key: string = '',
      depth: number = 0
    ) => {
      if (matches.length >= maxResults) return;
      
      const nodeId = currentPath;
      const dataType = Array.isArray(data) ? 'array' : typeof data;
      const currentMatches: string[] = [];
      let bestScore = 0;
      let bestMatchType: SearchMatch['matchType'] = 'key';
      
      // Search in key
      if (includeTypes.includes('key') && key) {
        const keyScore = this.calculateMatchScore(key, searchLower, 'key');
        if (keyScore >= minScore) {
          currentMatches.push(`Key: ${key} (score: ${keyScore.toFixed(2)})`);
          if (keyScore > bestScore) {
            bestScore = keyScore;
            bestMatchType = 'key';
          }
        }
      }
      
      // Search in path
      if (includeTypes.includes('path')) {
        const pathScore = this.calculateMatchScore(currentPath, searchLower, 'path');
        if (pathScore >= minScore) {
          currentMatches.push(`Path: ${currentPath} (score: ${pathScore.toFixed(2)})`);
          if (pathScore > bestScore) {
            bestScore = pathScore;
            bestMatchType = 'path';
          }
        }
      }
      
      // Search in data type
      if (includeTypes.includes('type')) {
        const typeScore = this.calculateMatchScore(dataType, searchLower, 'type');
        if (typeScore >= minScore) {
          currentMatches.push(`Type: ${dataType} (score: ${typeScore.toFixed(2)})`);
          if (typeScore > bestScore) {
            bestScore = typeScore;
            bestMatchType = 'type';
          }
        }
      }
      
      // Search in structure (for objects/arrays)
      if (includeTypes.includes('structure') && (dataType === 'object' || dataType === 'array')) {
        const childKeys = Object.keys(data);
        const structureInfo = `${dataType} with ${childKeys.length} ${childKeys.length === 1 ? 'item' : 'items'}`;
        const structureScore = this.calculateMatchScore(structureInfo, searchLower, 'structure');
        if (structureScore >= minScore) {
          currentMatches.push(`Structure: ${structureInfo} (score: ${structureScore.toFixed(2)})`);
          if (structureScore > bestScore) {
            bestScore = structureScore;
            bestMatchType = 'structure';
          }
        }
      }
      
      // Search in value (for primitives)
      if (includeTypes.includes('value') && dataType !== 'object' && dataType !== 'array') {
        const stringValue = String(data);
        const valueScore = this.calculateMatchScore(stringValue, searchLower, 'value');
        if (valueScore >= minScore) {
          currentMatches.push(`Value: ${stringValue} (score: ${valueScore.toFixed(2)})`);
          if (valueScore > bestScore) {
            bestScore = valueScore;
            bestMatchType = 'value';
          }
        }
      }
      
      // Add to results if we have matches
      if (currentMatches.length > 0 && bestScore >= minScore) {
        matches.push({
          nodeId,
          path: currentPath,
          key,
          value: data,
          dataType,
          matchType: bestMatchType,
          matchScore: bestScore,
          matches: currentMatches,
          exactMatch: bestScore >= 0.9,
          metadata: {
            searchTerm,
            matchedIn: currentMatches.map(m => m.split(':')[0]),
            relevance: this.getRelevance(bestScore),
            context: this.getContext(data, searchLower)
          }
        });
      }
      
      // Recursively search children
      if (dataType === 'object' && data !== null) {
        Object.keys(data).forEach(childKey => {
          const newPath = `${currentPath}.${childKey}`;
          searchRecursive(data[childKey], newPath, childKey, depth + 1);
        });
      } else if (dataType === 'array' && Array.isArray(data)) {
        data.forEach((item, index) => {
          const newPath = `${currentPath}[${index}]`;
          searchRecursive(item, newPath, `[${index}]`, depth + 1);
        });
      }
    };
    
    // Start search from root
    searchRecursive(jsonData, 'root', 'root');
    
    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // Calculate metadata
    const breakdown = {
      byType: {} as Record<string, number>,
      byRelevance: {} as Record<string, number>,
      byMatchType: {} as Record<string, number>
    };
    
    matches.forEach(match => {
      // Count by data type
      breakdown.byType[match.dataType] = (breakdown.byType[match.dataType] || 0) + 1;
      
      // Count by relevance
      breakdown.byRelevance[match.metadata.relevance] = (breakdown.byRelevance[match.metadata.relevance] || 0) + 1;
      
      // Count by match type
      breakdown.byMatchType[match.matchType] = (breakdown.byMatchType[match.matchType] || 0) + 1;
    });
    
    const searchTime = performance.now() - startTime;
    
    // Generate suggestions based on search patterns
    const suggestions = this.generateSuggestions(matches, searchTerm);
    
    return {
      matches: matches.slice(0, maxResults),
      metadata: {
        totalMatches: matches.length,
        searchTerm,
        searchTime,
        breakdown,
        suggestions
      }
    };
  }
  
  private static generateSuggestions(matches: SearchMatch[], searchTerm: string): string[] {
    const suggestions: string[] = [];
    
    // Suggest based on common patterns
    const exactMatches = matches.filter(m => m.exactMatch);
    const highMatches = matches.filter(m => m.matchScore >= 0.7);
    
    if (exactMatches.length === 0 && highMatches.length === 0) {
      suggestions.push('Try a broader search term');
      suggestions.push('Check for typos in your search');
    }
    
    if (matches.some(m => m.dataType === 'object')) {
      suggestions.push('Objects found - expand to see nested properties');
    }
    
    if (matches.some(m => m.dataType === 'array')) {
      suggestions.push('Arrays found - expand to see items');
    }
    
    // Suggest based on data types found
    const dataTypes = new Set(matches.map(m => m.dataType));
    if (dataTypes.has('string')) {
      suggestions.push('String values found - search for specific text content');
    }
    
    if (dataTypes.has('number')) {
      suggestions.push('Numeric values found - try searching for specific numbers');
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
}