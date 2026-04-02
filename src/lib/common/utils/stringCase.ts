/**
 * A type-safe utility for common string casing transformations.
 * Handles non-string inputs gracefully by returning them as-is.
 */

type MaybeString<T> = T extends string ? string : T;

const stringCase = {
  /**
   * Converts string to UPPERCASE.
   */
  upper<T>(val: T): MaybeString<T> {
    return (typeof val === 'string' ? val.toUpperCase() : val) as MaybeString<T>;
  },

  /**
   * Converts string to lowercase.
   */
  lower<T>(val: T): MaybeString<T> {
    return (typeof val === 'string' ? val.toLowerCase() : val) as MaybeString<T>;
  },

  /**
   * Capitalizes every word in a string, preserving original casing for the rest of the word.
   */
  title<T>(val: T): MaybeString<T> {
    if (typeof val !== 'string') return val as MaybeString<T>;

    return val.replace(/\b\w/g, (char) => char.toUpperCase()) as MaybeString<T>;
  },

  /**
   * Capitalizes the first character and lowercases the rest (Sentence case).
   */
  sentence<T>(val: T): MaybeString<T> {
    if (typeof val !== 'string' || val.length === 0) return val as MaybeString<T>;

    return (val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()) as MaybeString<T>;
  },

  /**
   * Converts slugs, snake_case, or messy strings into clean Title Case.
   * Preserves acronyms (all caps).
   */
  smartTitle<T>(val: T, options: { allowedChars?: string[] } = {}): MaybeString<T> {
    if (typeof val !== 'string' || !val.trim()) return val as MaybeString<T>;

    const { allowedChars = [] } = options;

    // 1. Escape special characters for RegEx
    const escaped = allowedChars.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');

    // 2. Clean string: replace separators with space, remove forbidden chars
    const cleaned = val
      .replace(/[_-]+/g, ' ')
      .replace(new RegExp(`[^\\w\\s${escaped}]`, 'g'), '')
      .trim();

    return cleaned
      .split(/\s+/)
      .map((word) => {
        // If word is already an acronym (e.g., "API"), keep it
        if (/^[A-Z0-9]+$/.test(word)) return word;

        // Otherwise, Capitalize first letter, lowercase rest
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ') as MaybeString<T>;
  },
};

export default stringCase;
