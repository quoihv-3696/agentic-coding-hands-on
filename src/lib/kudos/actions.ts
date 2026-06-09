"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/server";
import { searchProfiles } from "./queries";
import { createKudoSchema } from "./schema";
import type { Profile } from "./types";

/** Allowed HTML tags and attributes for TipTap body content. */
const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "span", "mark", "blockquote", "code", "pre"];
// `data-id` / `data-label` / `data-type` are emitted by the TipTap Mention
// extension's span — keep them so @mentions survive sanitization and render as
// styled profile links on the feed.
const ALLOWED_ATTR = ["href", "target", "rel", "class", "data-id", "data-label", "data-type", "data-mention-id"];

// Force rel="noopener noreferrer" on any link that opens a new tab so sanitized
// body HTML can't be used for reverse-tabnabbing. Registered once per module.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

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

  // 4. Sanitize body HTML server-side
  // isomorphic-dompurify works in both Node and browser contexts.
  const sanitizedBodyHtml = DOMPurify.sanitize(data.bodyHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

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
    return { error: insertError.message };
  }

  revalidatePath("/kudos");
  return { success: true, id: inserted.id as string };
}

type ToggleReactionResult = { error: string } | { success: true; reacted: boolean };

/** Toggle a heart reaction on a kudo for the current user. */
export async function toggleReaction(kudoId: string): Promise<ToggleReactionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  // Check for existing reaction (no upsert-then-delete; explicit check per spec)
  const { data: existing, error: checkError } = await supabase
    .from("kudo_reactions")
    .select("id")
    .eq("kudo_id", kudoId)
    .eq("reactor_auth_id", user.id)
    .maybeSingle();

  if (checkError) {
    console.error("[kudos/actions] toggleReaction check error:", checkError.message);
    return { error: checkError.message };
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("kudo_reactions")
      .delete()
      .eq("id", existing.id);
    if (deleteError) {
      console.error("[kudos/actions] toggleReaction delete error:", deleteError.message);
      return { error: deleteError.message };
    }
    revalidatePath("/kudos");
    return { success: true, reacted: false };
  } else {
    const { error: insertError } = await supabase
      .from("kudo_reactions")
      .insert({ kudo_id: kudoId, reactor_auth_id: user.id, reaction_type: "heart" });
    if (insertError) {
      console.error("[kudos/actions] toggleReaction insert error:", insertError.message);
      return { error: insertError.message };
    }
    revalidatePath("/kudos");
    return { success: true, reacted: true };
  }
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
