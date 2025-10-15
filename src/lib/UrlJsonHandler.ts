/**
 * Encodes JSON to a URL-safe base64 string
 */
export function encodeJsonToUrl(json: any): string {
  try {
    const jsonString = JSON.stringify(json);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Error encoding JSON to URL:', error);
    return '';
  }
}

/**
 * Decodes URL base64 back to JSON
 */
export function decodeJsonFromUrl(encoded: string): any {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const jsonString = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding JSON from URL:', error);
    return null;
  }
}

/**
 * Checks if current URL has a JSON parameter
 */
export function hasJsonInUrl(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('json');
}

/**
 * Gets JSON from current URL
 */
export function getJsonFromUrl(): any {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedJson = urlParams.get('json');
  
  if (!encodedJson) return null;
  
  return decodeJsonFromUrl(encodedJson);
}

/**
 * Updates URL with new JSON (without page reload)
 */
export function updateUrlWithJson(json: any): void {
  const encoded = encodeJsonToUrl(json);
  const newUrl = `${window.location.origin}${window.location.pathname}?json=${encoded}`;
  window.history.pushState({}, '', newUrl);
}

/**
 * Creates a shareable link for JSON
 */
export function createShareableLink(json: any): string {
  const encoded = encodeJsonToUrl(json);
  return `${window.location.origin}${window.location.pathname}?json=${encoded}`;
}

/**
 * Creates a shareable link for a specific tab
 */
export function createTabShareableLink(tabId: string, json: any): string {
  const encoded = encodeJsonToUrl(json);
  return `${window.location.origin}${window.location.pathname}?tab=${tabId}&json=${encoded}`;
}

/**
 * Clears JSON from URL
 */
export function clearJsonFromUrl(): void {
  const newUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.pushState({}, '', newUrl);
}