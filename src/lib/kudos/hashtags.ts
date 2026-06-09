/**
 * Canonical Kudos hashtags — a fixed set of 8 Sun* brand phrases (not user-authored).
 * `slug` is the stable id stored in `kudos.hashtags text[]` (GIN-indexed for future
 * "browse by #tag"); `label` is the display text. The phrases are brand-identical
 * across vi/en, so a single label is used (no i18n key needed — YAGNI).
 * Mirrors the constant shape in `awards/categories.ts`.
 */
export interface KudoHashtag {
  /** Stable kebab-case id persisted in the kudos.hashtags array. */
  slug: string;
  /** Display text rendered (in red) on the KUDO card. */
  label: string;
}

export const KUDO_HASHTAGS: readonly KudoHashtag[] = [
  { slug: "high-performing", label: "#High-performing" },
  { slug: "be-professional", label: "#BE PROFESSIONAL" },
  { slug: "be-optimistic", label: "#BE OPTIMISTIC" },
  { slug: "be-a-team", label: "#BE A TEAM" },
  { slug: "think-outside-the-box", label: "#THINK OUTSIDE THE BOX" },
  { slug: "get-risky", label: "#GET RISKY" },
  { slug: "go-fast", label: "#GO FAST" },
  { slug: "wasshoi", label: "#WASSHOI" },
] as const;

/** Look up a hashtag's display label by slug (falls back to the slug). */
export function hashtagLabel(slug: string): string {
  return KUDO_HASHTAGS.find((h) => h.slug === slug)?.label ?? slug;
}
