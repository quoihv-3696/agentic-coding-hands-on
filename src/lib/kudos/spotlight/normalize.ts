/**
 * Accent-insensitive normalisation for Spotlight name search.
 *
 * Pure, React-independent — shared by `useSpotlightSearch` and its tests so the
 * tests exercise the real production code path (not a replica).
 */

/** Strip diacritics for accent-insensitive comparison (e.g. "duc" matches "Đức"). */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
