import type { HeroTier } from "./tiers";

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
  recipientDisplayName: string;
  recipientAvatarUrl: string | null;
  recipientDeptCode: string | null;
  recipientHeroTier: HeroTier;
  reactionCount: number;
  /** Whether the current viewer has hearted this Kudo (per-user; from Phase 05). */
  viewerHasReacted?: boolean;
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

export type { HeroTier };
