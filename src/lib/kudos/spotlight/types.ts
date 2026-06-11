/**
 * Cross-track CONTRACT for the Kudos Spotlight Board.
 *
 * No React or Supabase deps — Track A (UI) and Track B (data/logic) share
 * these shapes. Phase integration wires the two tracks together.
 */

/** A recipient node in the Spotlight word-cloud. Recipients are always public. */
export interface SpotlightNode {
  recipientProfileId: string;
  displayName: string;
  deptCode: string | null;
  avatarUrl: string | null;
  /** Total active kudos received — determines node weight (font size / area). */
  kudosCount: number;
  /** Most-recent active kudo id → href /kudos/[id] on click. */
  latestKudoId: string;
  /** ISO timestamp of the most-recent active kudo → shown in tooltip. */
  latestKudoAt: string;
}

/** A recent-event ticker item (Phase 04 ticker / realtime feed). */
export interface KudoEvent {
  kudoId: string;
  recipientDisplayName: string;
  createdAt: string;
}
