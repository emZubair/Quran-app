/**
 * Hijri date conversion for the Home greeting overline.
 *
 * This is the tabular ("civil") Islamic calendar, not Umm al-Qura: it is a
 * pure arithmetic rule with no lookup table and no network, which is what the
 * offline guarantee requires. It can differ from the observed/Saudi date by a
 * day. That is acceptable for a greeting line — do not use it for anything
 * that needs a canonical date.
 */

const ISLAMIC_EPOCH = 1948439.5;

const MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhira",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

export interface HijriDate {
  year: number;
  /** 1-based */
  month: number;
  monthName: string;
  day: number;
}

/** Julian Day Number at midnight for a Gregorian calendar date. */
function gregorianToJulianDay(
  year: number,
  month: number,
  day: number,
): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** First Julian Day of a tabular Hijri month. */
function hijriToJulianDay(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH -
    1
  );
}

export function toHijri(date: Date = new Date()): HijriDate {
  const jd =
    gregorianToJulianDay(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    ) - 0.5;

  const year = Math.floor((30 * (jd - ISLAMIC_EPOCH) + 10646) / 10631);
  const month = Math.min(
    12,
    Math.ceil((jd - (29 + hijriToJulianDay(year, 1, 1))) / 29.5) + 1,
  );
  const day = jd - hijriToJulianDay(year, month, 1) + 1;

  return { year, month, monthName: MONTH_NAMES[month - 1], day };
}

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** "FRI · 22 SAFAR 1448" — the Mushaf Home overline. */
export function shortDateLine(date: Date = new Date()): string {
  const h = toHijri(date);
  return `${WEEKDAYS_SHORT[date.getDay()]} · ${h.day} ${h.monthName} ${h.year}`;
}

/** "Friday · 22 Safar 1448" — the Practice Home subtitle. */
export function longDateLine(date: Date = new Date()): string {
  const h = toHijri(date);
  return `${WEEKDAYS_LONG[date.getDay()]} · ${h.day} ${h.monthName} ${h.year}`;
}
