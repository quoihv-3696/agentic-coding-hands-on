/**
 * Stars (hoa thị) run ALONGSIDE the Hero tier — a separate recognition axis with
 * its own thresholds, derived from how many Kudos a profile has RECEIVED:
 *   1★ = 10 · 2★ = 20 · 3★ = 50 received Kudos (0 below 10).
 * The Phase 02 `profile_hero_tier` view encodes the same cutoffs in SQL.
 * Mirrors the derivation style of `tiers.ts`.
 */
export type StarCount = 0 | 1 | 2 | 3;

/** Received-Kudo count → star count. */
export function starCountFor(receivedCount: number): StarCount {
  if (receivedCount >= 50) return 3;
  if (receivedCount >= 20) return 2;
  if (receivedCount >= 10) return 1;
  return 0;
}

/** Star count → received-Kudo threshold needed to reach it (for hover tooltip copy). */
export const STAR_THRESHOLDS = { 1: 10, 2: 20, 3: 50 } as const;
