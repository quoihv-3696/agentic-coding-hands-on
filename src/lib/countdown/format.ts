/**
 * Format a countdown unit as a fixed 2-digit string.
 *
 * Display rules (from spec + test cases):
 * - Always two digits with a leading zero (e.g. 5 -> "05").
 * - Invalid, negative, or out-of-range values render as "00"
 *   (e.g. Hours max 23, Minutes max 59, Days max 99).
 */
export function formatUnit(value: number, max: number): string {
  if (!Number.isFinite(value) || value < 0 || value > max) {
    return "00";
  }
  return String(Math.floor(value)).padStart(2, "0");
}
