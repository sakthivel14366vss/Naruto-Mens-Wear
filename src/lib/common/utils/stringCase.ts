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
   * Returns the value exactly as-is with no modifications.
   */
  none<T>(val: T): T {
    return val;
  },
};

export default stringCase;
export type stringCaseKey = keyof typeof stringCase;
