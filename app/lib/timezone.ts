/**
 * Centralized timezone utility for AetherMed.
 * 
 * All clinic operations are in IST (Asia/Kolkata, UTC+5:30).
 * Vercel serverless functions run in UTC, so we must never rely on
 * `new Date().getHours()` or `.toISOString().split('T')[0]` for
 * "current time in clinic timezone" logic.
 * 
 * Every part of the codebase that needs "what time/date is it right now
 * for the clinic" should call these helpers instead.
 */

const CLINIC_TIMEZONE = "Asia/Kolkata";

/**
 * Returns the current Date object adjusted so that its UTC methods
 * (.getUTCHours(), .getUTCMinutes(), etc.) return IST values.
 * 
 * This is useful for server-side code that needs to do arithmetic
 * with hours/minutes in IST without pulling in a full timezone library.
 */
export function nowInClinicTimezone(): Date {
  const now = new Date();
  // Get the current UTC time as a localized string in Asia/Kolkata,
  // then parse it back. This avoids hardcoding the offset and handles
  // any future DST changes (India doesn't currently observe DST, but
  // this approach is robust regardless).
  const istString = now.toLocaleString("en-US", { timeZone: CLINIC_TIMEZONE });
  return new Date(istString);
}

/**
 * Returns today's date string in YYYY-MM-DD format, in clinic timezone (IST).
 */
export function todayInClinicTimezone(): string {
  const d = nowInClinicTimezone();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the current hour and minute in clinic timezone as total minutes
 * since midnight. e.g. 14:30 IST → 870.
 */
export function currentClinicMinutesSinceMidnight(): number {
  const d = nowInClinicTimezone();
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Returns tomorrow's date string in YYYY-MM-DD format, in clinic timezone.
 */
export function tomorrowInClinicTimezone(): string {
  const d = nowInClinicTimezone();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
