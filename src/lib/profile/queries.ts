import { createClient } from "@/lib/supabase/server";
import type { HeroTier } from "@/lib/kudos/types";
import type { ProfileSummary } from "./types";

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Count active, non-deleted kudos SENT by a profile. Reads the `kudos` table
 * directly (not the `kudos_feed` view) so the count includes anonymous-sent
 * kudos, whose sender is masked out of the view. Single source for both the
 * hover-card summary and the profile stats box.
 */
export async function countKudosSent(
  supabase: SupabaseServerClient,
  profileId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("kudos")
    .select("*", { count: "exact", head: true })
    .eq("sender_profile_id", profileId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    console.error("[profile/queries] countKudosSent error:", error.message);
    return 0;
  }
  return count ?? 0;
}

interface ProfileHeroTierRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  dept_code: string | null;
  hero_tier: string | null;
  received_kudos_count: number;
}

interface ProfileRow {
  dept_code: string | null;
  department: string | null;
}

/**
 * Fetch the profile summary data used by the hover-preview card.
 * Returns null if the profile row doesn't exist.
 */
export async function getProfileSummary(
  profileId: string,
): Promise<ProfileSummary | null> {
  const supabase = await createClient();

  // 1. Hero tier view — display name, avatar, tier, received count.
  const { data: tierRow, error: tierError } = await supabase
    .from("profile_hero_tier")
    .select("id, display_name, avatar_url, dept_code, hero_tier, received_kudos_count")
    .eq("id", profileId)
    .maybeSingle();

  if (tierError) {
    console.error("[profile/queries] getProfileSummary tier error:", tierError.message);
    return null;
  }
  if (!tierRow) return null;

  const row = tierRow as ProfileHeroTierRow;

  // 2. Unit — prefer dept_code from the view; fall back to profiles.department.
  let unit: string | null = row.dept_code ?? null;
  if (!unit) {
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("dept_code, department")
      .eq("id", profileId)
      .maybeSingle();

    if (profileError) {
      console.error("[profile/queries] getProfileSummary profiles error:", profileError.message);
    } else if (profileRow) {
      const p = profileRow as ProfileRow;
      unit = p.dept_code ?? p.department ?? null;
    }
  }

  // 3. Kudos sent — count of active, non-deleted kudos sent by this profile.
  const sentCount = await countKudosSent(supabase, profileId);

  return {
    profileId: row.id,
    displayName: row.display_name,
    unit,
    avatarUrl: row.avatar_url ?? null,
    heroTier: (row.hero_tier as HeroTier | null) ?? null,
    kudosReceived: row.received_kudos_count ?? 0,
    kudosSent: sentCount,
  };
}
