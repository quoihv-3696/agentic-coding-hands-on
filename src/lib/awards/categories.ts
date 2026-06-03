/**
 * Canonical award categories. Slugs are the single source of truth shared by the
 * homepage award cards and the (future) Awards Information page anchors.
 */
export interface AwardCategory {
  /** Stable slug used as the /awards hash anchor. */
  slug: string;
  /** i18n keys for the card title + short description. */
  titleKey: string;
  descKey: string;
}

export const AWARD_CATEGORIES: readonly AwardCategory[] = [
  { slug: "top-talent", titleKey: "home.awards.cards.topTalent.title", descKey: "home.awards.cards.topTalent.desc" },
  { slug: "top-project", titleKey: "home.awards.cards.topProject.title", descKey: "home.awards.cards.topProject.desc" },
  { slug: "top-project-leader", titleKey: "home.awards.cards.topProjectLeader.title", descKey: "home.awards.cards.topProjectLeader.desc" },
  { slug: "best-manager", titleKey: "home.awards.cards.bestManager.title", descKey: "home.awards.cards.bestManager.desc" },
  { slug: "signature-2025-creator", titleKey: "home.awards.cards.signature2025Creator.title", descKey: "home.awards.cards.signature2025Creator.desc" },
  { slug: "mvp", titleKey: "home.awards.cards.mvp.title", descKey: "home.awards.cards.mvp.desc" },
] as const;

/**
 * Build the Awards Information href for a category. A missing/empty slug yields
 * `/awards` with no hash so the page loads without auto-scrolling (test ID-62).
 */
export function awardHref(slug?: string): string {
  return slug ? `/awards#${slug}` : "/awards";
}
