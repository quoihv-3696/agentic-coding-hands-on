/** Prelaunch countdown configuration. */

/** Event launch datetime (Asia/Saigon, +07:00). The countdown counts down to this. */
export const COUNTDOWN_TARGET_ISO = "2026-06-04T15:00:00+07:00";

export const COUNTDOWN_TARGET_DATE = new Date(COUNTDOWN_TARGET_ISO);

/** Where visitors are sent once the countdown reaches zero. */
export const COUNTDOWN_REDIRECT_PATH = "/login";

/**
 * Parse an ISO-8601 datetime string (e.g. the `NEXT_PUBLIC_EVENT_DATETIME` env
 * var) into a Date. Returns null on missing/invalid input so callers can render
 * a graceful fallback instead of crashing.
 */
export function parseEventDateTime(raw?: string): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
