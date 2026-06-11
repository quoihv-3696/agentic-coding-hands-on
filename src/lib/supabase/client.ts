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
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) supabase.realtime.setAuth(token);
}
