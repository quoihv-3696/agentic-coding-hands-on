/**
 * Server-side queries for the Kudos Spotlight Board.
 *
 * All functions use the server Supabase client (async cookies) and must only
 * be called from Server Components or Server Actions — never from client code.
 */
import { createClient } from "@/lib/supabase/server";
import type { SpotlightNode, KudoEvent } from "./types";

type RecipientProfile = {
  display_name: string;
  avatar_url: string | null;
  dept_code: string | null;
};

/** Supabase types the joined relation as an array; normalise to a single row. */
function firstProfile(raw: unknown): RecipientProfile | undefined {
  return (
    Array.isArray(raw) ? raw[0] : raw
  ) as RecipientProfile | undefined;
}

/**
 * Fetch ONE node per active kudo (not per recipient) so the word-cloud shows a
 * label for every kudo — a recipient with N kudos appears N times. Each node's
 * `latestKudoId` is THAT kudo's id (unique → its own scatter position + click
 * target), `latestKudoAt` is that kudo's time, and `kudosCount` is the
 * recipient's total (drives font size, so frequent recipients read larger).
 *
 * Single query: per-recipient counts are derived from the same result set, so
 * there's no second round-trip and no insert-between-queries skew.
 */
export async function getSpotlightKudos(): Promise<SpotlightNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos")
    .select(
      "id, created_at, recipient_profile_id, profiles!kudos_recipient_profile_id_fkey(display_name, avatar_url, dept_code)",
    )
    .is("deleted_at", null)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[kudos/spotlight] getSpotlightKudos error:", error.message);
    return [];
  }

  const rows = data ?? [];

  // Per-recipient total (font-size weight), counted from this same result set.
  const countById = new Map<string, number>();
  for (const row of rows) {
    const rid = row.recipient_profile_id as string;
    countById.set(rid, (countById.get(rid) ?? 0) + 1);
  }

  return rows.map((row) => {
    const rid = row.recipient_profile_id as string;
    const p = firstProfile(row.profiles);
    return {
      recipientProfileId: rid,
      displayName: p?.display_name ?? "",
      deptCode: p?.dept_code ?? null,
      avatarUrl: p?.avatar_url ?? null,
      kudosCount: countById.get(rid) ?? 1,
      latestKudoId: row.id as string,
      latestKudoAt: row.created_at as string,
    };
  });
}

/**
 * Total count of active kudos (the "388 KUDOS" hero stat).
 * Uses head:true so PostgREST returns only the count header — no rows transferred.
 */
export async function getKudosTotalCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("kudos")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null)
    .eq("status", "active");

  if (error) {
    console.error("[kudos/spotlight] getKudosTotalCount error:", error.message);
    return 0;
  }

  return count ?? 0;
}

/**
 * Resolve a SINGLE active kudo to its masked ticker event (recipient name + time).
 * Used by the realtime hook: on an INSERT signal we fetch just that one row's
 * masked fields (never render the raw realtime payload). Returns null if the
 * kudo isn't visible/active.
 */
export async function getKudoEvent(kudoId: string): Promise<KudoEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos")
    .select(
      "id, created_at, profiles!kudos_recipient_profile_id_fkey(display_name)",
    )
    .eq("id", kudoId)
    .is("deleted_at", null)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[kudos/spotlight] getKudoEvent error:", error.message);
    }
    return null;
  }

  return {
    kudoId: data.id as string,
    recipientDisplayName: firstProfile(data.profiles)?.display_name ?? "",
    createdAt: data.created_at as string,
  };
}
