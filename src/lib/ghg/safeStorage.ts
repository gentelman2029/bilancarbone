/**
 * Safe localStorage wrapper with try/catch and default value fallback.
 * Prevents application crashes from corrupted or inaccessible localStorage.
 */

export const safeGetJSON = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch (e) {
    console.warn(`[safeStorage] Failed to parse key "${key}":`, e);
    return defaultValue;
  }
};

export const safeSetJSON = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[safeStorage] Failed to write key "${key}":`, e);
  }
};

export const safeRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[safeStorage] Failed to remove key "${key}":`, e);
  }
};

/**
 * Get a numeric value from localStorage with a default fallback.
 */
export const safeGetNumber = (key: string, defaultValue: number): number => {
  return safeGetJSON<number>(key, defaultValue);
};

/**
 * Get a string value from localStorage with a default fallback.
 */
export const safeGetString = (key: string, defaultValue: string): string => {
  return safeGetJSON<string>(key, defaultValue);
};
