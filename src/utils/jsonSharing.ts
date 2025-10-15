// utils/jsonSharing.ts
import { createHash } from 'crypto';

export interface ShareableJsonLink {
  slug: string;
  shareableUrl: string;
  shortId: string;
  timestamp: number;
}

/**
 * Generate a unique shareable link for any JSON data
 */
export function generateJsonShareLink(
  jsonData: any, 
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): ShareableJsonLink {
  // Create content-based hash
  const jsonString = typeof jsonData === 'string' 
    ? jsonData 
    : JSON.stringify(jsonData, Object.keys(jsonData || {}).sort());
  
  const contentHash = createHash('sha256')
    .update(jsonString)
    .digest('hex')
    .substring(0, 16);
  
  // Generate short ID for URL (first 8 chars of hash)
  const shortId = contentHash.substring(0, 8);
  
  // Create slug from content (first meaningful string or hash)
  const slug = generateContentSlug(jsonData) || `json-${shortId}`;
  
  // URL encode the JSON data for the link
  const encodedData = Buffer.from(jsonString).toString('base64url');
  
  const shareableUrl = `${baseUrl}/share/json/${slug}-${shortId}?data=${encodedData}`;
  
  return {
    slug,
    shareableUrl,
    shortId,
    timestamp: Date.now()
  };
}

/**
 * Generate a readable slug from JSON content
 */
function generateContentSlug(jsonData: any): string {
  if (!jsonData || typeof jsonData !== 'object') return '';
  
  const obj = typeof jsonData === 'string' ? safeJsonParse(jsonData) : jsonData;
  
  // Look for common identifier fields
  const idFields = ['name', 'title', 'id', 'slug', 'username', 'email', 'key'];
  for (const field of idFields) {
    if (obj[field] && typeof obj[field] === 'string') {
      return slugify(obj[field]);
    }
  }
  
  // Look for any string value in first level
  for (const value of Object.values(obj)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return slugify(value);
    }
  }
  
  return '';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Decode JSON data from shareable URL
 */
export function decodeJsonFromUrl(encodedData: string): any {
  try {
    const jsonString = Buffer.from(encodedData, 'base64url').toString('utf8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decode JSON from URL:', error);
    return null;
  }
}

/**
 * Copy shareable link to clipboard
 */
export async function copyJsonShareLink(
  jsonData: any, 
  baseUrl?: string
): Promise<boolean> {
  try {
    const { shareableUrl } = generateJsonShareLink(jsonData, baseUrl);
    await navigator.clipboard.writeText(shareableUrl);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = generateJsonShareLink(jsonData, baseUrl).shareableUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
}