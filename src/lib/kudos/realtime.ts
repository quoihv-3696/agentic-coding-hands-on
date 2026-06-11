"use client";

import { createClient, applyRealtimeAuth } from "@/lib/supabase/client";

/**
 * Subscribe to Live Board changes (kudos + kudo_reactions) as a CHANGE SIGNAL only.
 *
 * The callback MUST re-fetch the masked `kudos_feed` view / stats — it must NOT
 * trust the raw realtime row payload, which would bypass the anonymous-sender
 * masking done in the view (and leak `sender_profile_id`). RLS still applies to
 * realtime for the `authenticated` role.
 *
 * Returns an unsubscribe function (call on unmount).
 */
export function subscribeBoard(onChange: () => void): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel("kudos-live-board")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "kudos" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "kudo_reactions" },
      () => onChange(),
    );

  // Authenticate the socket first, else postgres_changes RLS treats us as anon
  // and delivers nothing (tables are `to authenticated using (true)`).
  void applyRealtimeAuth(supabase).then(() => channel.subscribe());

  return () => {
    void supabase.removeChannel(channel);
  };
}
