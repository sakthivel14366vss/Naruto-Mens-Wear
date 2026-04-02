/**
 * Utility for human-readable relative time formatting.
 * Uses a cache for Intl.RelativeTimeFormat to optimize performance.
 */

const rtfCache = new Map<string, Intl.RelativeTimeFormat>();

const getRTF = (
  locale: string,
  options: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat => {
  const cacheKey = `${locale}-${JSON.stringify(options)}`;
  if (!rtfCache.has(cacheKey)) {
    rtfCache.set(cacheKey, new Intl.RelativeTimeFormat(locale, options));
  }
  return rtfCache.get(cacheKey)!;
};

/** Standard time units in seconds */
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

/**
 * Formats a date relative to another date (defaulting to now).
 * * @param date - The date to format
 * @param baseDate - The reference date (defaults to new Date())
 * @param locale - Locale string (defaults to 'en')
 */
export const formatRelativeTime = (
  date: Date | string | number,
  baseDate: Date = new Date(),
  locale = 'en',
): string => {
  const d = new Date(date);
  const now = new Date(baseDate);
  const diffInSeconds = (d.getTime() - now.getTime()) / 1000;

  const rtf = getRTF(locale, { numeric: 'auto' });

  // Handle "just now" for very small differences
  if (Math.abs(diffInSeconds) < 30) {
    return locale.startsWith('en') ? 'just now' : rtf.format(0, 'second');
  }

  for (const [unit, unitSeconds] of UNITS) {
    if (Math.abs(diffInSeconds) >= unitSeconds || unit === 'second') {
      const value = Math.round(diffInSeconds / unitSeconds);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, 'second');
};

/**
 * Enhanced relative time that prioritizes "Yesterday/Tomorrow"
 * based on calendar days rather than exact 24-hour windows.
 */
export const formatRelativeSmart = (
  date: Date | string | number,
  baseDate: Date = new Date(),
  locale = 'en',
): string => {
  const d = new Date(date);
  const now = new Date(baseDate);

  // Normalize to start of day for calendar-based comparison
  const dStart = new Date(d).setHours(0, 0, 0, 0);
  const nowStart = new Date(now).setHours(0, 0, 0, 0);

  const diffInDays = Math.round((dStart - nowStart) / 86400000);

  // Use Intl for localized "Yesterday", "Today", "Tomorrow"
  if (Math.abs(diffInDays) <= 1) {
    const rtf = getRTF(locale, { numeric: 'auto' });
    return rtf.format(diffInDays, 'day');
  }

  return formatRelativeTime(date, baseDate, locale);
};
