// utils/slugGenerator.ts
import { JsonValue } from '@/types/JsonTypes';
import { createHash } from 'crypto';

/**
 * Generate URL-friendly slug from any JSON data
 */
export function generateJsonSlug(jsonData: JsonValue): string {
  // Handle empty cases
  if (!jsonData) return 'json-empty';
  
  const obj = typeof jsonData === 'string' ? safeJsonParse(jsonData) : jsonData;
  
  // Strategy 1: Try common identifier fields first
  const commonIdFields = ['name', 'title', 'id', 'slug', 'username', 'key'];
  for (const field of commonIdFields) {
    if (obj?.[field] && typeof obj[field] === 'string') {
      const slug = slugify(obj[field]);
      if (slug) return slug;
    }
  }
  
  // Strategy 2: Try any string value in first level
  if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && value.trim()) {
        const slug = slugify(value);
        if (slug) return slug;
      }
    }
  }
  
  // Strategy 3: Fallback to content-based hash
  const jsonString = typeof jsonData === 'string' 
    ? jsonData 
    : JSON.stringify(jsonData);
  
  const hash = createHash('md5').update(jsonString).digest('hex').substring(0, 8);
  return `json-${hash}`;
}

/**
 * Convert string to URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s-]+/g, '-')      // Replace spaces and hyphens with single hyphen
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    .substring(0, 40);            // Limit length
}

function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}