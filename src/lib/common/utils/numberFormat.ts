/**
 * Utility for localized number formatting.
 * Uses a cache to prevent expensive re-instantiation of Intl.NumberFormat.
 */

const formatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Internal helper to retrieve or create a formatter.
 * JSON.stringify is used on options to ensure the cache key is unique to the configuration.
 */
const getFormatter = (
  key: string,
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const cacheKey = `${locale}-${key}-${JSON.stringify(options)}`;
  if (!formatterCache.has(cacheKey)) {
    formatterCache.set(cacheKey, new Intl.NumberFormat(locale, options));
  }
  return formatterCache.get(cacheKey)!;
};

export default {
  /** * Standard formatting (e.g., 1,23,456)
   */
  format: (n: number, locale = 'en-IN'): string => getFormatter('std', locale, {}).format(n),

  /** * Compact notation (e.g., 1.5K or 1.5 thousand)
   */
  compact: (n: number, long = false, locale = 'en-IN'): string =>
    getFormatter('compact', locale, {
      notation: 'compact',
      compactDisplay: long ? 'long' : 'short',
    }).format(n),

  /** * Currency formatting (e.g., ₹1,500.00)
   */
  currency: (n: number, currency = 'INR', showDecimals = false, locale = 'en-IN'): string =>
    getFormatter('curr', locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: showDecimals ? 2 : 0,
      minimumFractionDigits: showDecimals ? 2 : 0,
    }).format(n),

  /** * Percentage formatting (e.g., 25.6%)
   */
  percent: (n: number, decimals = 2, locale = 'en-IN'): string =>
    getFormatter('pct', locale, {
      style: 'percent',
      maximumFractionDigits: decimals,
    }).format(n),

  /** * Ordinal formatting (1st, 2nd, 3rd)
   * Uses PluralRules to determine the correct suffix for the locale.
   */
  ordinal: (n: number, locale = 'en-US'): string => {
    const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
    const rule = pr.select(n);
    const suffixes: Record<string, string> = {
      one: 'st',
      two: 'nd',
      few: 'rd',
      other: 'th',
    };
    return `${n}${suffixes[rule] || 'th'}`;
  },

  /** * Fixed decimal formatting (e.g., 3.14)
   */
  fixed: (n: number, digits = 2, locale = 'en-IN'): string =>
    getFormatter('fixed', locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n),
};
