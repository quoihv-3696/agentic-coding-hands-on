import { createClient } from "@/lib/supabase/server";

/**
 * Links the current authenticated user's auth.uid() to their profile row by
 * matching on their verified JWT email, but only when auth_user_id is still null.
 *
 * Delegates to the `link_profile_on_login` security-definer RPC (defined in the
 * policies migration). A plain client-side UPDATE cannot do this: the restrictive
 * "profiles: self update" RLS policy only allows updating a row already linked to
 * the caller, so claiming an unlinked row must go through the definer function —
 * which is safe because it only touches the row whose email == auth.email().
 *
 * Call after a successful login (auth callback). Idempotent: once linked, the
 * RPC's WHERE matches nothing.
 */
export async function linkProfileOnLogin(): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized" };

  const { error: rpcError } = await supabase.rpc("link_profile_on_login");

  if (rpcError) {
    console.error("[kudos/profile-link] linkProfileOnLogin error:", rpcError.message);
    return { error: rpcError.message };
  }

  return { success: true };
}
