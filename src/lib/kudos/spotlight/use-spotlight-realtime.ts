"use client";

import { useState, useEffect } from "react";
import { createClient, applyRealtimeAuth } from "@/lib/supabase/client";
import {
  fetchSpotlightTotalCount,
  fetchKudoEvent,
} from "./actions";
import type { KudoEvent } from "./types";

export interface SpotlightRealtimeState {
  totalCount: number;
  /** Currently-visible ticker notifications — one per recently-arrived kudo. */
  recentEvents: KudoEvent[];
}

/** How long a single ticker notification stays on screen (must match the CSS life animation). */
export const TICKER_VISIBLE_MS = 6000;
/** Cap concurrently-visible notifications so a burst doesn't flood the corner. */
const MAX_VISIBLE = 5;

/**
 * Subscribe to Kudos INSERT events: keep the hero counter live and surface ONE
 * transient notification per newly-arrived kudo.
 *
 * Design decisions:
 *  - Subscription (not polling): instant, and idle = zero requests.
 *  - Per-row notifications: postgres_changes fires once per inserted row, so we
 *    show exactly one "{name} just received a Kudos" line per insert — never a
 *    re-dump of the recent list. Several inserts → several lines popping in
 *    one-by-one, each fading out on its own ~6s timer.
 *  - Masking-safe: we read only the payload's kudo id, then re-fetch THAT kudo's
 *    masked event (recipient name + time) via a server action — the raw realtime
 *    payload is never rendered.
 *  - Count is re-fetched (debounced) so a burst doesn't spam the count query.
 *  - On channel error / auth loss: keep last good state, no crash.
 */
export function useSpotlightRealtime(initial: {
  totalCount: number;
}): SpotlightRealtimeState {
  const [totalCount, setTotalCount] = useState(initial.totalCount);
  // Starts empty: silent until a new kudo actually arrives.
  const [recentEvents, setRecentEvents] = useState<KudoEvent[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const itemTimers = new Map<string, ReturnType<typeof setTimeout>>();
    let countDebounce: ReturnType<typeof setTimeout> | null = null;

    function scheduleCountRefresh() {
      if (countDebounce) clearTimeout(countDebounce);
      countDebounce = setTimeout(async () => {
        try {
          setTotalCount(await fetchSpotlightTotalCount());
        } catch {
          // keep last good count
        }
      }, 400);
    }

    async function showInsert(kudoId: string) {
      if (itemTimers.has(kudoId)) return; // dedupe repeat signals
      try {
        const event = await fetchKudoEvent(kudoId);
        if (!event) return;
        // Prepend (newest at the TOP), capped to the most recent MAX_VISIBLE.
        // Older items get pushed down and are removed (disappear) at the bottom.
        setRecentEvents((prev) => [event, ...prev].slice(0, MAX_VISIBLE));
        const timer = setTimeout(() => {
          setRecentEvents((prev) => prev.filter((e) => e.kudoId !== kudoId));
          itemTimers.delete(kudoId);
        }, TICKER_VISIBLE_MS);
        itemTimers.set(kudoId, timer);
      } catch {
        // ignore transient errors
      }
    }

    const channel = supabase
      .channel("kudos-spotlight")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "kudos" },
        (payload) => {
          const id = (payload.new as { id?: string } | null)?.id;
          if (typeof id === "string") void showInsert(id);
          scheduleCountRefresh();
        },
      );

    // Authenticate the socket first, else postgres_changes RLS treats us as anon
    // and delivers nothing (kudos is `to authenticated using (true)`).
    void applyRealtimeAuth(supabase).then(() => channel.subscribe());

    return () => {
      if (countDebounce) clearTimeout(countDebounce);
      itemTimers.forEach((t) => clearTimeout(t));
      itemTimers.clear();
      void supabase.removeChannel(channel);
    };
  }, []);

  return { totalCount, recentEvents };
}
