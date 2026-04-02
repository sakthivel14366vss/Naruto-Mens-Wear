/**
 * Utility for parsing flexible user-input strings into Date objects.
 */

/**
 * Normalizes a 2-digit year to the current century.
 * Example: 24 -> 2024
 */
const normalizeYear = (yearPart: string | number): number => {
  const year = Number(yearPart);
  if (yearPart.toString().length === 2) {
    const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100;
    return currentCentury + year;
  }
  return year;
};

/**
 * Parses date strings: DD, DD-MM, DD-MM-YY, DD-MM-YYYY.
 * Returns null if the date is logically invalid (e.g., 31st of Feb).
 */
export const parseDate = (input: string): Date | null => {
  const datePattern = /^(\d{1,2})(?:\W(\d{1,2}))?(?:\W(\d{2,4}))?$/;
  const match = input.trim().match(datePattern);

  if (!match) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, d, m, y] = match;
  const now = new Date();

  const day = Number(d);
  // Month is 0-indexed in JS; default to current month if not provided
  const month = m ? Number(m) - 1 : now.getMonth();
  const year = y ? normalizeYear(y) : now.getFullYear();

  // Create date and validate integrity (checks for things like Feb 30th)
  const result = new Date(year, month, day, 0, 0, 0, 0);

  const isValid =
    result.getFullYear() === year && result.getMonth() === month && result.getDate() === day;

  return isValid ? result : null;
};

/**
 * A highly robust time parser that handles messy separators like '3*5.p', '12:30pm', or '8.30.a'.
 */
export const parseTime = (input: string, referenceDate: Date = new Date()): Date | null => {
  const str = input.toLowerCase().trim();

  // 1. Extract all sequences of digits
  // Example: '3*5.p' -> ["3", "5"]
  const numbers = str.match(/\d+/g);
  if (!numbers) return null;

  // 2. Extract AM/PM indicator
  // Example: '3*5.p' -> "p"
  const meridiemMatch = str.match(/[ap]m?/);
  const meridiem = meridiemMatch ? meridiemMatch[0] : null;

  let hh = Number(numbers[0]);
  const mm = numbers[1] ? Number(numbers[1]) : 0;
  const ss = numbers[2] ? Number(numbers[2]) : 0;

  // 3. Handle 12-hour logic (Meridiem)
  if (meridiem) {
    if (meridiem.startsWith('p')) {
      if (hh < 12) hh += 12; // 3pm -> 15
    } else if (meridiem.startsWith('a')) {
      if (hh === 12) hh = 0; // 12am -> 0
    }
  }

  // 4. Logical Validation
  if (hh > 23 || mm > 59 || ss > 59) return null;

  // 5. Apply to Date
  const result = new Date(referenceDate);
  result.setHours(hh, mm, ss, 0);

  return result;
};
