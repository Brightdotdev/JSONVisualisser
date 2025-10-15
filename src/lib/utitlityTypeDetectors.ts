import { ExtraDataTypes, JsonObject, JsonValue } from "@/types/JsonTypes";

// =============================================================================
// TYPE DETECTORS
// =============================================================================

export const detectUrlType = (str: string): ExtraDataTypes | null => {
  try {
    const url = new URL(str);
    return ['http:', 'https:', 'ftp:', 'ws:', 'wss:'].includes(url.protocol) ? 'url' : null;
  } catch {
    return null;
  }
}

export const detectEmailType = (str: string): ExtraDataTypes | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str) ? 'email' : null;
}

export const detectUuidType  = (str: string): ExtraDataTypes | null  => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? 'uuid' : null;
}

export const detectDateTimeType = (str: string, keyLower: string): ExtraDataTypes | null  => {
  if (isDate(str)) return 'date';
  if (isDateTime(str)) return 'datetime';
  // Check if key suggests it's a timestamp
  if ((keyLower.includes('time') || keyLower.includes('stamp')) && !isNaN(Number(str))) {
    return 'timestamp';
  }
  return null;
}

export const detectColorType = (str: string): ExtraDataTypes | null  => {
  if (isHexColor(str)) return 'hex-color';
  if (isRgbColor(str)) return 'rgb-color';
  if (isRgbaColor(str)) return 'rgba-color';
  return null;
}

export const detectVersionType = (str: string, keyLower: string): ExtraDataTypes | null  => {
  if (isVersion(str) || keyLower.includes('version')) return 'version';
  if (isSemanticVersion(str)) return 'semantic-version';
  return null;
}

export const detectNetworkType = (str: string): ExtraDataTypes | null  => {
  if (isIpAddress(str)) {
    return str.includes(':') ? 'ipv6' : 'ipv4';
  }
  return null;
}

export const detectEncodingType = (str: string): ExtraDataTypes | null  => {
  if (isBase64(str)) return 'base64';
  // Removed JSON string detection to prevent potential recursion
  return null;
}

export const detectPersonalDataType = (str: string): ExtraDataTypes | null  => {
  if (isPhoneNumber(str)) return 'phone';
  if (isCreditCard(str)) return 'credit-card';
  return null;
}

export const detectPathType = (str: string, keyLower: string): ExtraDataTypes | null  => {
  if (isFilePath(str) || keyLower.includes('path')) return 'file-path';
  if (isDirectoryPath(str)) return 'directory-path';
  return null;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export const isTimestamp = (value: number): boolean  => {
  // Reasonable timestamp range (2000-01-01 to 2100-01-01)
  return value > 946684800000 && value < 4102444800000;
}

export const isDate = (str: string): boolean  => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(str)) return false;
  const date = new Date(str);
  return !isNaN(date.getTime());
}

export const isDateTime = (str: string): boolean  => {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/;
  if (!dateTimeRegex.test(str)) return false;
  const date = new Date(str);
  return !isNaN(date.getTime());
}

export const isHexColor = (str: string): boolean  => {
  return /^#?([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(str);
}

export const isRgbColor = (str: string): boolean  => {
  return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(str);
}

export const isRgbaColor = (str: string): boolean  => {
  return /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(str);
}

export const isVersion = (str: string): boolean  => {
  return /^v?\d+(\.\d+)*([+-][\w.-]*)?$/i.test(str);
}

const isSemanticVersion  = (str: string): boolean  => {
  return /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(str);
}

export const isIpAddress = (str: string): boolean  => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(str)) {
    const parts = str.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(str);
}

export const isBase64 = (str: string): boolean  => {
  if (str.length % 4 !== 0) return false;
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export const isJsonString = (str: string): boolean   => {
  if (typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export const isPhoneNumber  = (str: string): boolean  => {
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(str.replace(/\s/g, ''));
}

export const isCreditCard = (str: string): boolean  => {
  const cleaned = str.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  return luhnCheck(cleaned);
}

export const luhnCheck =  (str: string): boolean  => {
  let sum = 0;
  let isEven = false;
  for (let i = str.length - 1; i >= 0; i--) {
    let digit = parseInt(str[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export const isFilePath = (str: string): boolean  => {
  return /^([a-zA-Z]:)?[\\/]?([^\\/:\*\?"<>\|]+\\)*[^\\/:\*\?"<>\|]+(\.[^\\/:\*\?"<>\|]+)?$/.test(str);
}

export const isDirectoryPath =  (str: string): boolean  => {
  return /^([a-zA-Z]:)?[\\/]?([^\\/:\*\?"<>\|]+\\)+[^\\/:\*\?"<>\|]*$/.test(str);
}

// =============================================================================
// MAIN DETECTION FLOW (FIXED - NO RECURSION)
// =============================================================================

const detectStringType = (str: string, keyLower: string): ExtraDataTypes => {
  // 1. Technical formats (no recursion risk)
  const urlType = detectUrlType(str);
  if (urlType) return urlType;
  
  const emailType = detectEmailType(str);
  if (emailType) return emailType;
  
  const uuidType = detectUuidType(str);
  if (uuidType) return uuidType;
  
  // 2. Encoding formats
  const encodingType = detectEncodingType(str);
  if (encodingType) return encodingType;
  
  // 3. Date/time formats
  const dateTimeType = detectDateTimeType(str, keyLower);
  if (dateTimeType) return dateTimeType;
  
  // 4. Color formats
  const colorType = detectColorType(str);
  if (colorType) return colorType;
  
  // 5. Version formats
  const versionType = detectVersionType(str, keyLower);
  if (versionType) return versionType;
  
  // 6. Network formats
  const networkType = detectNetworkType(str);
  if (networkType) return networkType;
  
  // 7. Personal data
  const personalDataType = detectPersonalDataType(str);
  if (personalDataType) return personalDataType;
  
  // 8. Path formats
  const pathType = detectPathType(str, keyLower);
  if (pathType) return pathType;

  return 'string';
}

export const detectPrimitiveType = (value: string | number | boolean, key: string): ExtraDataTypes  => {
  const keyLower = key.toLowerCase();
  
  // Handle non-strings immediately to prevent recursion
  if (typeof value === 'number') {
    return isTimestamp(value) ? 'timestamp' : 'number';
  }
  
  if (typeof value === 'boolean') return 'boolean';

  // Only process string detection for string values
  return detectStringType(String(value), keyLower);
}

export const detectEnhancedType = (value: JsonValue, key: string = ''): ExtraDataTypes  => {
  // Handle null values
  if (value === null) return 'null';

  // Handle primitive values (strings, numbers, booleans)
  if (typeof value !== 'object') {
    return detectPrimitiveType(value, key);
  }

  // Handle complex types (objects and arrays)
  if (Array.isArray(value)) return 'array';
  return 'object';
}

export const checkIfLeafNode = (value: JsonValue): boolean => {
  if (value === null) return true;
  if (typeof value !== 'object') return true;
  if (Array.isArray(value)) return value.length === 0;
  return Object.keys(value as JsonObject).length === 0;
}

// Helper function to get basic data type (used in React hook)
export const getDataType = (value: any): ExtraDataTypes => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}