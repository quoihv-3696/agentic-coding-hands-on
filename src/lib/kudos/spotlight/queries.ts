/**
 * Server-side queries for the Kudos Spotlight Board.
 *
 * All functions use the server Supabase client (async cookies) and must only
 * be called from Server Components or Server Actions — never from client code.
 *
 * "Latest kudo" path: queries the `kudos_spotlight_recipients` view added by
 * migration 20260610020000_create_kudos_spotlight_view.sql.  The view uses
 * DISTINCT ON per recipient + a grouped count subquery — one round-trip instead
 * of a two-step PostgREST aggregate.
 */
import { createClient } from "@/lib/supabase/server";
import type { SpotlightNode, KudoEvent } from "./types";

/** Raw DB row from kudos_spotlight_recipients view (snake_case). */
interface SpotlightRecipientRow {
  recipient_profile_id: string;
  display_name: string;
  dept_code: string | null;
  avatar_url: string | null;
  kudos_count: number;
  latest_kudo_id: string;
  latest_kudo_at: string;
}

function mapSpotlightRow(row: SpotlightRecipientRow): SpotlightNode {
  return {
    recipientProfileId: row.recipient_profile_id,
    displayName: row.display_name,
    deptCode: row.dept_code,
    avatarUrl: row.avatar_url,
    kudosCount: row.kudos_count,
    latestKudoId: row.latest_kudo_id,
    latestKudoAt: row.latest_kudo_at,
  };
}

/**
 * Fetch all spotlight recipients (one row per person with >= 1 active kudo).
 * Backed by the `kudos_spotlight_recipients` view (security_invoker → RLS applies).
 */
export async function getSpotlightRecipients(): Promise<SpotlightNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos_spotlight_recipients")
    .select("*")
    .order("kudos_count", { ascending: false });

  if (error) {
    console.error("[kudos/spotlight] getSpotlightRecipients error:", error.message);
    return [];
  }

  return (data as SpotlightRecipientRow[]).map(mapSpotlightRow);
}

/**
 * Fetch ONE node per active kudo (not per recipient) so the word-cloud shows a
 * label for every kudo — a recipient with N kudos appears N times. Each node's
 * `latestKudoId` is THAT kudo's id (unique → its own scatter position + click
 * target), `latestKudoAt` is that kudo's time, and `kudosCount` is the
 * recipient's total (drives font size, so frequent recipients read larger).
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

  // Recipient → total active-kudo count (font-size weight), from the view.
  const recipients = await getSpotlightRecipients();
  const countById = new Map(
    recipients.map((r) => [r.recipientProfileId, r.kudosCount]),
  );

  return (data ?? []).map((row) => {
    const raw = row.profiles as unknown;
    const p = Array.isArray(raw)
      ? (raw[0] as { display_name: string; avatar_url: string | null; dept_code: string | null } | undefined)
      : (raw as { display_name: string; avatar_url: string | null; dept_code: string | null } | null | undefined);
    return {
      recipientProfileId: row.recipient_profile_id as string,
      displayName: p?.display_name ?? "",
      deptCode: p?.dept_code ?? null,
      avatarUrl: p?.avatar_url ?? null,
      kudosCount: countById.get(row.recipient_profile_id as string) ?? 1,
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

  const raw = data.profiles as unknown;
  const p = Array.isArray(raw)
    ? (raw[0] as { display_name: string } | undefined)
    : (raw as { display_name: string } | null | undefined);
  return {
    kudoId: data.id as string,
    recipientDisplayName: p?.display_name ?? "",
    createdAt: data.created_at as string,
  };
}
