import type { HeroTier } from "./tiers";
import type { StarCount } from "./stars";

/**
 * Cross-track CONTRACT for the Kudos feature.
 *
 * This file is the seam between Track A (UI codes its mock data + props against
 * these shapes) and Track B (queries/actions return them). Phase 06 wires the two
 * sides together — nothing here should depend on React or Supabase.
 *
 * Field shapes mirror the Phase 04 schema (`profiles`, `kudos`, `kudo_reactions`)
 * and the `kudos_feed` / `profile_hero_tier` views, in camelCase.
 */

/** App-wide person directory entry (reused beyond Kudos — see Phase 04). */
export interface Profile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  deptCode?: string | null;
}

/** A single Kudo as stored (camelCase mirror of the `kudos` row). */
export interface Kudo {
  id: string;
  senderProfileId: string;
  recipientProfileId: string;
  title: string;
  /** Sanitized rich-text HTML from the TipTap editor. */
  bodyHtml: string;
  /** Hashtag slugs (see `hashtags.ts`). */
  hashtags: string[];
  imageUrls: string[];
  mentionProfileIds: string[];
  isAnonymous: boolean;
  anonymousNickname?: string | null;
  createdAt: string;
}

/** Heart reaction (camelCase mirror of `kudo_reactions`). */
export interface Reaction {
  id: string;
  kudoId: string;
  reactorAuthId: string;
  reactedAt: string;
}

/**
 * A feed row = a Kudo joined with display fields for both parties, the reaction
 * count, and the recipient's derived Hero tier (mirrors the `kudos_feed` view).
 * Sender display fields are NULL when `isAnonymous` — render `anonymousNickname`.
 */
export interface KudoFeedRow extends Omit<Kudo, "senderProfileId"> {
  /** NULL on anonymous kudos — masked by the kudos_feed view to prevent deanonymization. */
  senderProfileId: string | null;
  senderDisplayName: string | null;
  senderAvatarUrl: string | null;
  senderDeptCode: string | null;
  /** Sender's canonical division (Live Board filter); NULL when anonymous. */
  senderDepartment: string | null;
  /** Sender's Hero tier; NULL when anonymous. */
  senderHeroTier: HeroTier | null;
  /** Sender's star count (0–3); NULL when anonymous. */
  senderStarCount: StarCount | null;
  recipientDisplayName: string;
  recipientAvatarUrl: string | null;
  recipientDeptCode: string | null;
  /** Recipient's canonical division (Live Board filter). */
  recipientDepartment: string | null;
  recipientHeroTier: HeroTier;
  /** Recipient's star count (0–3) — runs alongside the Hero tier. */
  recipientStarCount: StarCount;
  reactionCount: number;
  /** Whether the current viewer has hearted this Kudo (per-user; from Phase 05). */
  viewerHasReacted?: boolean;
}

/** Filters that drive BOTH the Highlight carousel and the All Kudos feed. */
export interface HighlightFilters {
  hashtag?: string;
  /** Canonical department code (see departments.ts), NOT the free-form dept_code. */
  department?: string;
}

/** A selectable department in the "Phòng ban" filter (code === canonical division). */
export interface DepartmentOption {
  code: string;
  label: string;
}

/** Sidebar stat block (spec D.1). Secret Box fields are STUB → 0 this iteration. */
export interface StatsSummary {
  kudosReceived: number;
  kudosSent: number;
  /** Total hearts across all kudos the viewer SENT (hearts economy credits the sender). */
  heartsReceived: number;
  secretBoxOpened: number;
  secretBoxUnopened: number;
}

/** A row in a sidebar leaderboard (promotions = real; gifts = STUB empty). */
export interface LeaderboardEntry {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  deptCode: string | null;
  /** e.g. "Thăng hạng Super" (promotions) or gift description (gifts → stub). */
  description: string;
}

/** One page of the infinite-scroll feed (keyset cursor on created_at,id). */
export interface FeedPage {
  rows: KudoFeedRow[];
  nextCursor: string | null;
}

/** Payload the write/send form submits to `createKudo` (Phase 05). */
export interface CreateKudoInput {
  recipientProfileId: string;
  title: string;
  bodyHtml: string;
  hashtags: string[];
  imageUrls: string[];
  mentionProfileIds: string[];
  isAnonymous: boolean;
  anonymousNickname?: string | null;
}

export type { HeroTier, StarCount };
