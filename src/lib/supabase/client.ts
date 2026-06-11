import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components (browser).
 * Reads the public URL + publishable key from NEXT_PUBLIC_* env vars.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

/**
 * Authenticate the Realtime socket with the current user's access token so
 * `postgres_changes` RLS is evaluated as that user — NOT as anon.
 *
 * Our tables expose `to authenticated using (true)`; an unauthenticated socket
 * has no matching policy, so Realtime silently delivers NOTHING. supabase-js
 * does not always set this before the first channel join, so we set it
 * explicitly and await it BEFORE subscribing. Call this prior to `.subscribe()`.
 */
export async function applyRealtimeAuth(
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  // getUser() validates the JWT (and refreshes a stale one) per project policy,
  // so the token we then read from the session is fresh — avoids handing an
  // expired token to the socket on mount. Ongoing rotations are auto-applied by
  // supabase-js (TOKEN_REFRESHED → realtime.setAuth).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) supabase.realtime.setAuth(session.access_token);
}
