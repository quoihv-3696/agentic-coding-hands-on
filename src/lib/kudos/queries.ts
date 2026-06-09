import { createClient } from "@/lib/supabase/server";
import type { KudoFeedRow, Profile } from "./types";
import type { HeroTier } from "./tiers";

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
  recipient_display_name: string;
  recipient_avatar_url: string | null;
  recipient_dept_code: string | null;
  reaction_count: number;
  recipient_hero_tier: string;
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
    recipientDisplayName: row.recipient_display_name,
    recipientAvatarUrl: row.recipient_avatar_url,
    recipientDeptCode: row.recipient_dept_code,
    reactionCount: row.reaction_count,
    recipientHeroTier: row.recipient_hero_tier as HeroTier,
  };
}

/** Fetch the latest kudos feed (newest first), flagged with the viewer's reactions. */
export async function getFeed(limit = 20): Promise<KudoFeedRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[kudos/queries] getFeed error:", error.message);
    return [];
  }

  const rows = (data as KudoFeedDbRow[]).map(mapFeedRow);

  // Flag which rows the current viewer has already hearted (so the toggle
  // renders correctly across refreshes). One query for the visible ids.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && rows.length) {
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

  // Empty query → return the first slice of the directory so the recipient
  // picker shows options immediately on open (matches the design); typing filters.
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
