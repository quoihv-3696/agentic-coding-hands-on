import { createClient } from "@/lib/supabase/server";
import { mapFeedRow, enrichViewerReactions } from "@/lib/kudos/queries";
import type { HeroTier, StarCount, KudoFeedRow, StatsSummary } from "@/lib/kudos/types";
import type { ProfileDetail, ProfileFeedMode } from "./types";
import { countKudosSent } from "./queries";

/** Newest kudos shown on a profile page (no infinite scroll — KISS). */
const PROFILE_FEED_LIMIT = 20;

interface ProfileDetailRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  dept_code: string | null;
  hero_tier: string | null;
  star_count: number | null;
  received_kudos_count: number | null;
}

/**
 * Fetch the full profile-header data for a profile page in a single read from
 * the `profile_hero_tier` view. Returns null if the profile doesn't exist.
 */
export async function getProfileById(id: string): Promise<ProfileDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_hero_tier")
    .select("id, display_name, avatar_url, dept_code, hero_tier, star_count, received_kudos_count")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[profile/page-queries] getProfileById error:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as ProfileDetailRow;
  return {
    profileId: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? null,
    deptCode: row.dept_code ?? null,
    heroTier: (row.hero_tier as HeroTier) ?? "new",
    starCount: ((row.star_count ?? 0) as StarCount),
    receivedKudosCount: row.received_kudos_count ?? 0,
  };
}

/**
 * Stats for the own-profile stats box. Secret Box fields are a hardcoded stub (0)
 * this iteration — the unlock mechanic is deferred.
 */
export async function getProfileStats(id: string): Promise<StatsSummary> {
  const supabase = await createClient();

  const [{ data: tierRow }, { data: heartRow }, sentCount] = await Promise.all([
    supabase.from("profile_hero_tier").select("received_kudos_count").eq("id", id).maybeSingle(),
    supabase.from("profile_heart_totals").select("hearts_received").eq("id", id).maybeSingle(),
    countKudosSent(supabase, id),
  ]);

  return {
    kudosReceived: (tierRow?.received_kudos_count as number | undefined) ?? 0,
    kudosSent: sentCount,
    heartsReceived: (heartRow?.hearts_received as number | undefined) ?? 0,
    secretBoxOpened: 0,
    secretBoxUnopened: 0,
  };
}

/**
 * Fetch a profile's kudos feed (newest first, capped at PROFILE_FEED_LIMIT),
 * with the viewer's heart state flagged. `received` filters on recipient;
 * `sent` filters on sender. Reuses the kudos_feed mapper for DRY.
 *
 * NOTE: anonymous-sent kudos have a NULL sender_profile_id in the view, so they
 * never appear in a user's own 'sent' list — expected (anonymous masking).
 */
export async function getProfileKudos(
  id: string,
  mode: ProfileFeedMode,
): Promise<KudoFeedRow[]> {
  const supabase = await createClient();
  const column = mode === "sent" ? "sender_profile_id" : "recipient_profile_id";

  const { data, error } = await supabase
    .from("kudos_feed")
    .select("*")
    .eq(column, id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PROFILE_FEED_LIMIT);

  if (error) {
    console.error("[profile/page-queries] getProfileKudos error:", error.message);
    return [];
  }

  const rows = (data ?? []).map((r) => mapFeedRow(r as Parameters<typeof mapFeedRow>[0]));
  await enrichViewerReactions(supabase, rows);
  return rows;
}

/**
 * Whether `id` is the currently authenticated user's own profile. Drives
 * owner-only UI. False when logged-out or unmatched.
 */
export async function isOwnProfile(id: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !data) return false;
  return (data.id as string) === id;
}
