"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { getFeed, searchProfiles } from "./queries";
import { createKudoSchema } from "./schema";
import type { FeedPage, HighlightFilters, Profile } from "./types";

// Server-side sanitization for TipTap body HTML. Uses sanitize-html (pure JS) —
// NOT a DOM-based sanitizer (jsdom fails to bundle on Vercel serverless).
// `data-id`/`data-label`/`data-type` on <span> are emitted by the TipTap Mention
// extension; `class` carries the mention/link styling. All links are forced to
// rel="noopener noreferrer" to prevent reverse-tabnabbing.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "span", "mark", "blockquote", "code", "pre"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["data-id", "data-label", "data-type", "data-mention-id", "class"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

type CreateKudoResult =
  | { error: string }
  | { success: true; id: string };

/** Create a new Kudo. Validates, sanitizes, inserts, and revalidates the feed. */
export async function createKudo(
  input: z.infer<typeof createKudoSchema>,
): Promise<CreateKudoResult> {
  // 1. Validate
  const parsed = createKudoSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  // 2. Auth
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  // 3. Resolve sender profile (auth_user_id first, email fallback)
  let senderProfileId: string | null = null;

  const { data: profileByAuth } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileByAuth) {
    senderProfileId = profileByAuth.id as string;
  } else {
    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user.email ?? "")
      .maybeSingle();
    senderProfileId = (profileByEmail?.id as string) ?? null;
  }

  if (!senderProfileId) {
    return { error: "Sender profile not found. Please log out and log in again." };
  }

  // 4. Sanitize body HTML server-side (sanitize-html — serverless-safe, no jsdom)
  const sanitizedBodyHtml = sanitizeHtml(data.bodyHtml, SANITIZE_OPTIONS);

  // 5. Insert
  const { data: inserted, error: insertError } = await supabase
    .from("kudos")
    .insert({
      sender_profile_id: senderProfileId,
      recipient_profile_id: data.recipientProfileId,
      title: data.title,
      body_html: sanitizedBodyHtml,
      hashtags: data.hashtags,
      image_urls: data.imageUrls,
      mention_profile_ids: data.mentionProfileIds,
      is_anonymous: data.isAnonymous,
      anonymous_nickname: data.anonymousNickname ?? null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[kudos/actions] createKudo insert error:", insertError.message);
    // Generic message — never surface raw DB/constraint/RLS text to the client.
    return { error: "Could not save the Kudo. Please try again." };
  }

  revalidatePath("/kudos");
  return { success: true, id: inserted.id as string };
}

type ToggleReactionResult =
  | { error: string }
  | { success: true; reacted: boolean; heartsDelta: number };

/** Current date (YYYY-MM-DD) in Asia/Ho_Chi_Minh — the TZ special days are keyed on. */
function todayInIct(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

/**
 * Toggle a heart reaction on a kudo for the current user (hearts economy, spec C.4.1).
 * - A heart credits the kudo's SENDER; the exact amount (1, or 2 on an admin special
 *   day) is resolved at INSERT and stored in `hearts_awarded` so unlike revokes it
 *   precisely (the `profile_heart_totals` SUM recomputes — no manual counters).
 * - Self-heart is blocked here (defense-in-depth) on top of the RLS policy.
 * - `heartsDelta` lets optimistic UI adjust the sender's heart total if shown.
 */
export async function toggleReaction(kudoId: string): Promise<ToggleReactionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  // Existing reaction? (explicit check per spec — no upsert-then-delete)
  const { data: existing, error: checkError } = await supabase
    .from("kudo_reactions")
    .select("id, hearts_awarded")
    .eq("kudo_id", kudoId)
    .eq("reactor_auth_id", user.id)
    .maybeSingle();

  if (checkError) {
    console.error("[kudos/actions] toggleReaction check error:", checkError.message);
    return { error: "Could not update reaction." };
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("kudo_reactions")
      .delete()
      .eq("id", existing.id);
    if (deleteError) {
      console.error("[kudos/actions] toggleReaction delete error:", deleteError.message);
      return { error: "Could not update reaction." };
    }
    revalidatePath("/kudos");
    // Revoke exactly what was granted (the stored hearts_awarded leaves the SUM).
    return { success: true, reacted: false, heartsDelta: -(existing.hearts_awarded ?? 1) };
  }

  // Self-heart guard (defense-in-depth; RLS also enforces it). Resolve the kudo's
  // sender and the caller's profile, refuse if they match.
  const { data: kudoRow } = await supabase
    .from("kudos")
    .select("sender_profile_id")
    .eq("id", kudoId)
    .maybeSingle();
  // Resolve the caller's profile by auth link, falling back to email — mirrors
  // createKudo, so a sender whose profile isn't auth-linked yet is still caught.
  let myProfile = (
    await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle()
  ).data;
  if (!myProfile && user.email) {
    myProfile = (
      await supabase
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .maybeSingle()
    ).data;
  }
  if (kudoRow && myProfile && kudoRow.sender_profile_id === myProfile.id) {
    return { error: "You cannot heart your own Kudo." };
  }

  // Resolve hearts_awarded against today's special day (ICT). Default 1.
  const { data: special } = await supabase
    .from("special_days")
    .select("multiplier")
    .eq("event_date", todayInIct())
    .maybeSingle();
  const heartsAwarded = special?.multiplier ?? 1;

  const { error: insertError } = await supabase.from("kudo_reactions").insert({
    kudo_id: kudoId,
    reactor_auth_id: user.id,
    reaction_type: "heart",
    hearts_awarded: heartsAwarded,
  });
  if (insertError) {
    // 23505 = unique violation: a reaction already exists (rapid double-tap /
    // race). Idempotent success — no double-count, no error toast.
    if (insertError.code === "23505") {
      return { success: true, reacted: true, heartsDelta: 0 };
    }
    console.error("[kudos/actions] toggleReaction insert error:", insertError.message);
    return { error: "Could not update reaction." };
  }
  revalidatePath("/kudos");
  return { success: true, reacted: true, heartsDelta: heartsAwarded };
}

/**
 * Server-action wrapper around `getFeed` so the client infinite-scroll list can
 * fetch the next page (keyset cursor + the active Highlight/All-Kudos filters).
 */
export async function loadFeedPage(
  cursor: string,
  filters?: HighlightFilters,
): Promise<FeedPage> {
  // Public server action — gate on auth (the kudos_feed view is authenticated-only,
  // but reject explicitly rather than leak an empty page to anonymous callers).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { rows: [], nextCursor: null };
  return getFeed({ cursor, filters });
}

/**
 * Server-action wrapper around the (server-only) `searchProfiles` query so client
 * components — the recipient combobox and the @mention suggestion — can call it.
 * Auth-gated: Server Actions are public endpoints, so guard here or the whole
 * employee directory would be queryable pre-login.
 */
export async function searchProfilesAction(query: string): Promise<Profile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return searchProfiles(query);
}
