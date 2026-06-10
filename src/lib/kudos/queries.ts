import { createClient } from "@/lib/supabase/server";
import type {
  FeedPage,
  HighlightFilters,
  KudoFeedRow,
  Profile,
} from "./types";
import type { HeroTier } from "./tiers";
import type { StarCount } from "./stars";
import { applyFeedFilters } from "./filters";

/** Raw DB row from kudos_feed view (snake_case). */
interface KudoFeedDbRow {
  id: string;
  sender_profile_id: string | null; // null on anonymous rows (masked by the view)
  recipient_profile_id: string;
  title: string;
  body_html: string;
  hashtags: string[];
  image_urls: string[];
  mention_profile_ids: string[];
  is_anonymous: boolean;
  anonymous_nickname: string | null;
  status: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
  sender_display_name: string | null;
  sender_avatar_url: string | null;
  sender_dept_code: string | null;
  sender_department: string | null;
  sender_hero_tier: string | null;
  sender_star_count: number | null;
  recipient_display_name: string;
  recipient_avatar_url: string | null;
  recipient_dept_code: string | null;
  recipient_department: string | null;
  reaction_count: number;
  recipient_hero_tier: string;
  recipient_star_count: number;
}

function mapFeedRow(row: KudoFeedDbRow): KudoFeedRow {
  return {
    id: row.id,
    senderProfileId: row.sender_profile_id,
    recipientProfileId: row.recipient_profile_id,
    title: row.title,
    bodyHtml: row.body_html,
    hashtags: row.hashtags ?? [],
    imageUrls: row.image_urls ?? [],
    mentionProfileIds: row.mention_profile_ids ?? [],
    isAnonymous: row.is_anonymous,
    anonymousNickname: row.anonymous_nickname,
    createdAt: row.created_at,
    senderDisplayName: row.sender_display_name,
    senderAvatarUrl: row.sender_avatar_url,
    senderDeptCode: row.sender_dept_code,
    senderDepartment: row.sender_department,
    senderHeroTier: (row.sender_hero_tier as HeroTier | null) ?? null,
    senderStarCount: (row.sender_star_count as StarCount | null) ?? null,
    recipientDisplayName: row.recipient_display_name,
    recipientAvatarUrl: row.recipient_avatar_url,
    recipientDeptCode: row.recipient_dept_code,
    recipientDepartment: row.recipient_department,
    recipientHeroTier: row.recipient_hero_tier as HeroTier,
    recipientStarCount: (row.recipient_star_count as StarCount) ?? 0,
    reactionCount: row.reaction_count,
  };
}

/** Keyset cursor: "<created_at>__<id>" (stable ordering by created_at desc, id desc). */
function encodeCursor(row: KudoFeedRow): string {
  return `${row.createdAt}__${row.id}`;
}
function decodeCursor(cursor: string): { ts: string; id: string } | null {
  const idx = cursor.lastIndexOf("__");
  if (idx < 0) return null;
  return { ts: cursor.slice(0, idx), id: cursor.slice(idx + 2) };
}

/** Flag which of the given rows the current viewer has hearted (per-user toggle state). */
async function enrichViewerReactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: KudoFeedRow[],
): Promise<void> {
  if (!rows.length) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: reacted } = await supabase
    .from("kudo_reactions")
    .select("kudo_id")
    .eq("reactor_auth_id", user.id)
    .in(
      "kudo_id",
      rows.map((r) => r.id),
    );
  const reactedIds = new Set((reacted ?? []).map((r) => r.kudo_id as string));
  for (const row of rows) row.viewerHasReacted = reactedIds.has(row.id);
}

/**
 * Fetch a page of the feed (newest first), filtered, with a keyset cursor for
 * infinite scroll. `nextCursor` is null when the last page is reached.
 */
export async function getFeed(
  opts: { cursor?: string | null; filters?: HighlightFilters; limit?: number } = {},
): Promise<FeedPage> {
  const { cursor, filters, limit = 10 } = opts;
  const supabase = await createClient();

  let query = supabase
    .from("kudos_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  query = applyFeedFilters(query, filters);

  if (cursor) {
    const c = decodeCursor(cursor);
    if (c) {
      // Keyset: rows strictly "after" the cursor in (created_at desc, id desc).
      query = query.or(
        `created_at.lt.${c.ts},and(created_at.eq.${c.ts},id.lt.${c.id})`,
      );
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("[kudos/queries] getFeed error:", error.message);
    return { rows: [], nextCursor: null };
  }

  const rows = (data as KudoFeedDbRow[]).map(mapFeedRow);
  await enrichViewerReactions(supabase, rows);

  const nextCursor =
    rows.length === limit ? encodeCursor(rows[rows.length - 1]) : null;
  return { rows, nextCursor };
}

/** Top Kudos by heart count (Highlight carousel, spec B) — same filters as the feed. */
export async function getHighlight(
  filters?: HighlightFilters,
  limit = 5,
): Promise<KudoFeedRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("kudos_feed")
    .select("*")
    .order("reaction_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  query = applyFeedFilters(query, filters);

  const { data, error } = await query;
  if (error) {
    console.error("[kudos/queries] getHighlight error:", error.message);
    return [];
  }

  const rows = (data as KudoFeedDbRow[]).map(mapFeedRow);
  await enrichViewerReactions(supabase, rows);
  return rows;
}

/** Fetch a single kudo by id, or null if not found. */
export async function getKudoById(id: string): Promise<KudoFeedRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos_feed")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[kudos/queries] getKudoById error:", error.message);
    return null;
  }

  return data ? mapFeedRow(data as KudoFeedDbRow) : null;
}

/** Search profiles by display_name or email (case-insensitive, limit 8). */
export async function searchProfiles(query: string): Promise<Profile[]> {
  // Strip characters that have meaning in a PostgREST `.or()` filter so a crafted
  // query can't break out and inject extra conditions (e.g. commas/parens/wildcards).
  const safe = query.replace(/[,()*%\\]/g, " ").trim();

  const supabase = await createClient();
  let builder = supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, dept_code")
    .order("display_name")
    .limit(8);

  if (safe) {
    builder = builder.or(`display_name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data, error } = await builder;

  if (error) {
    console.error("[kudos/queries] searchProfiles error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    displayName: row.display_name as string,
    avatarUrl: row.avatar_url as string | null,
    deptCode: row.dept_code as string | null,
  }));
}

/** Get the hero tier for a profile id from profile_hero_tier view. */
export async function getHeroTier(profileId: string): Promise<HeroTier> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_hero_tier")
    .select("hero_tier")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    console.error("[kudos/queries] getHeroTier error:", error.message);
    return "new";
  }

  return (data?.hero_tier as HeroTier) ?? "new";
}
