/**
 * Advanced Date-Time formatting and parsing utility.
 */

// Cache for Intl formatters to optimize performance
const formatCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (options: Intl.DateTimeFormatOptions, locale = 'en-US') => {
  const key = `${locale}-${JSON.stringify(options)}`;
  if (!formatCache.has(key)) {
    formatCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return formatCache.get(key)!;
};

export interface DateTimeParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  hour12: string;
  minute: string;
  second: string;
  dayPeriod: string;
  monthName: string;
  monthShort: string;
  weekdayName: string;
  weekdayShort: string;
  timestamp: number;
}

/**
 * Extracts localized and numeric parts from a date.
 */
export const getDateTimeParts = (date: Date | string | number = new Date()): DateTimeParts => {
  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error(`Invalid Date: ${date}`);

  const h24 = d.getHours();
  const m = d.getMonth() + 1;
  const day = d.getDate();

  return {
    year: d.getFullYear().toString(),
    month: m.toString().padStart(2, '0'),
    day: day.toString().padStart(2, '0'),
    hour: h24.toString().padStart(2, '0'),
    hour12: (h24 % 12 || 12).toString().padStart(2, '0'),
    minute: d.getMinutes().toString().padStart(2, '0'),
    second: d.getSeconds().toString().padStart(2, '0'),
    dayPeriod: h24 >= 12 ? 'PM' : 'AM',
    monthName: getFormatter({ month: 'long' }).format(d),
    monthShort: getFormatter({ month: 'short' }).format(d),
    weekdayName: getFormatter({ weekday: 'long' }).format(d),
    weekdayShort: getFormatter({ weekday: 'short' }).format(d),
    timestamp: d.getTime(),
  };
};

/**
 * Formats a date using a token-based pattern.
 */
export const formatDateTime = (
  pattern: string,
  date: Date | string | number = new Date(),
): string => {
  if (!pattern) return '';
  const p = getDateTimeParts(date);

  const tokens: Record<string, string> = {
    YYYY: p.year,
    YY: p.year.slice(-2),
    MM: p.month,
    M: parseInt(p.month).toString(),
    DD: p.day,
    D: parseInt(p.day).toString(),
    HH: p.hour,
    H: parseInt(p.hour).toString(),
    hh: p.hour12,
    h: parseInt(p.hour12).toString(),
    II: p.minute,
    I: parseInt(p.minute).toString(),
    SS: p.second,
    S: parseInt(p.second).toString(),
    AA: p.dayPeriod,
    aa: p.dayPeriod.toLowerCase(),
    MN: p.monthName,
    MS: p.monthShort,
    DN: p.weekdayName,
    DS: p.weekdayShort,
  };

  // Optimization: Pre-sort keys by length to avoid partial matches (e.g., YYYY vs YY)
  const regex = new RegExp(
    Object.keys(tokens)
      .sort((a, b) => b.length - a.length)
      .join('|'),
    'g',
  );
  return pattern.replace(regex, (matched) => tokens[matched]);
};

/**
 * Common Pre-defined Formats
 */
export const dateTimeUtils = {
  /** DD-MM-YYYY */
  date: (d?: Date | string | number) => formatDateTime('DD-MM-YYYY', d),

  /** hh:II AA */
  time: (d?: Date | string | number) => formatDateTime('hh:II AA', d),

  /** DD-MM-YYYY hh:II AA */
  full: (d?: Date | string | number) => formatDateTime('DD-MM-YYYY hh:II AA', d),
};
