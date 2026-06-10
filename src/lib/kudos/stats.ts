import { createClient } from "@/lib/supabase/server";
import { DEPARTMENTS } from "./departments";
import { HERO_TIER_LABEL_KEY } from "./tiers";
import type { HeroTier } from "./tiers";
import type {
  DepartmentOption,
  LeaderboardEntry,
  StatsSummary,
} from "./types";

/** Brand tier labels (identical across vi/en — see kudosFeed.tiers). */
const HERO_TIER_LABEL: Record<HeroTier, string> = {
  new: "New Hero",
  rising: "Rising Hero",
  super: "Super Hero",
  legend: "Legend Hero",
};
// Touch the i18n key map so it stays referenced alongside the labels above.
void HERO_TIER_LABEL_KEY;

/** Resolve the current viewer's profile id (auth link first, email fallback). */
async function currentProfileId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: byAuth } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (byAuth) return byAuth.id as string;

  const { data: byEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", user.email ?? "")
    .maybeSingle();
  return (byEmail?.id as string) ?? null;
}

/** Sidebar stats for the current viewer (spec D.1). Secret Box fields are STUB → 0. */
export async function getStats(): Promise<StatsSummary> {
  const empty: StatsSummary = {
    kudosReceived: 0,
    kudosSent: 0,
    heartsReceived: 0,
    secretBoxOpened: 0,
    secretBoxUnopened: 0,
  };

  const supabase = await createClient();
  const profileId = await currentProfileId(supabase);
  if (!profileId) return empty;

  const activeKudos = () =>
    supabase
      .from("kudos")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "active");

  const [{ count: received }, { count: sent }, { data: hearts }] =
    await Promise.all([
      activeKudos().eq("recipient_profile_id", profileId),
      activeKudos().eq("sender_profile_id", profileId),
      supabase
        .from("profile_heart_totals")
        .select("hearts_received")
        .eq("id", profileId)
        .maybeSingle(),
    ]);

  return {
    kudosReceived: received ?? 0,
    kudosSent: sent ?? 0,
    heartsReceived: (hearts?.hearts_received as number) ?? 0,
    secretBoxOpened: 0,
    secretBoxUnopened: 0,
  };
}

/** Canonical department options for the "Phòng ban" filter (fixed list). */
export function getDepartments(): DepartmentOption[] {
  return DEPARTMENTS.map((code) => ({ code, label: code }));
}

/**
 * Promotions leaderboard ("10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT").
 * KISS heuristic (no promotion event log): the recipients of the most recent
 * kudos, deduped, described by their CURRENT Hero tier. Flagged for review.
 */
export async function getPromotionLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos_feed")
    .select(
      "recipient_profile_id, recipient_display_name, recipient_avatar_url, recipient_dept_code, recipient_hero_tier, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[kudos/stats] getPromotionLeaderboard error:", error.message);
    return [];
  }

  const seen = new Set<string>();
  const out: LeaderboardEntry[] = [];
  for (const row of data ?? []) {
    const id = row.recipient_profile_id as string;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      profileId: id,
      displayName: row.recipient_display_name as string,
      avatarUrl: (row.recipient_avatar_url as string | null) ?? null,
      deptCode: (row.recipient_dept_code as string | null) ?? null,
      description: HERO_TIER_LABEL[row.recipient_hero_tier as HeroTier] ?? "",
    });
    if (out.length >= 10) break;
  }
  return out;
}

/** Gifts leaderboard ("10 SUNNER NHẬN QUÀ MỚI NHẤT") — STUB: no gift schema → empty. */
export async function getGiftLeaderboard(): Promise<LeaderboardEntry[]> {
  return [];
}
