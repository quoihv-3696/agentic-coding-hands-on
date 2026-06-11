"use server";

/**
 * Thin server-action wrappers around spotlight queries.
 *
 * WHY these exist: `queries.ts` uses `createClient` from `@/lib/supabase/server`
 * which reads async cookies — it is server-only and cannot be imported from a
 * client component or a "use client" hook.  The realtime hook
 * (`use-spotlight-realtime.ts`) needs to re-fetch authoritative data after an
 * INSERT signal.  Server Actions are the idiomatic Next.js bridge: they run on
 * the server (RLS + view masking applies) but are callable from client code.
 */

import { getKudoEvent, getKudosTotalCount } from "./queries";
import type { KudoEvent } from "./types";

/** Re-fetch the live total count of active kudos (for the hero stat counter). */
export async function fetchSpotlightTotalCount(): Promise<number> {
  return getKudosTotalCount();
}

/** Resolve one kudo (by id) to its masked ticker event — for per-INSERT notifications. */
export async function fetchKudoEvent(kudoId: string): Promise<KudoEvent | null> {
  return getKudoEvent(kudoId);
}
