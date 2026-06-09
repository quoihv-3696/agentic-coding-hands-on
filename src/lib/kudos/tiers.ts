/**
 * Hero tiers are DERIVED from how many Kudos a profile has received.
 * Thresholds MUST mirror the shipped rules-drawer i18n (`kudosRules.tiers`):
 *   new(1-4) · rising(5-9) · super(10-20) · legend(>20)
 * The Phase 04 `profile_hero_tier` view encodes the same cutoffs in SQL.
 */
export type HeroTier = "new" | "rising" | "super" | "legend";

/** Map a received-Kudo count to its Hero tier (0 collapses into "new"). */
export function heroTierFor(receivedCount: number): HeroTier {
  if (receivedCount <= 4) return "new";
  if (receivedCount <= 9) return "rising";
  if (receivedCount <= 20) return "super";
  return "legend";
}

/** i18n key (under `kudosFeed.tiers`) for each tier's short badge label. */
export const HERO_TIER_LABEL_KEY: Record<HeroTier, string> = {
  new: "kudosFeed.tiers.new",
  rising: "kudosFeed.tiers.rising",
  super: "kudosFeed.tiers.super",
  legend: "kudosFeed.tiers.legend",
};
