"use client";

import { useState, useMemo } from "react";
import type { PositionedNode } from "./layout";
import { normalize } from "./normalize";

const SEARCH_MAX_LEN = 100;

export interface SpotlightSearchResult {
  /** Current raw search query (controlled). */
  query: string;
  /** Update the query; clamped to SEARCH_MAX_LEN chars. */
  setQuery: (q: string) => void;
  /**
   * recipientProfileId of the match (or null). A person can have many kudo
   * nodes, so this highlights ALL of that person's names — not just one.
   */
  matchId: string | null;
  /** latestKudoId of one matched node → the element to centre + gently zoom. */
  focusId: string | null;
  /** The full PositionedNode for the match — convenient for the UI to pan/focus. */
  focusNode: PositionedNode | null;
}

/**
 * Client-side spotlight search over the already-loaded positioned nodes.
 *
 * Matching is case-insensitive AND accent-insensitive (NFD normalisation so
 * "Duc" matches "Đức", "Nguyen" matches "Nguyễn", etc.).
 * An empty query always returns null — no spurious highlight on mount.
 * Query length is clamped to 100 chars in setQuery to mirror the server-side cap.
 */
export function useSpotlightSearch(
  positionedNodes: PositionedNode[],
): SpotlightSearchResult {
  const [query, setQueryRaw] = useState("");

  const setQuery = (q: string) => {
    setQueryRaw(q.slice(0, SEARCH_MAX_LEN));
  };

  const { matchId, focusId, focusNode } = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return { matchId: null, focusId: null, focusNode: null };

    const needle = normalize(trimmed);

    const match = positionedNodes.find((n) =>
      normalize(n.displayName).includes(needle),
    );

    return {
      matchId: match?.recipientProfileId ?? null,
      focusId: match?.latestKudoId ?? null,
      focusNode: match ?? null,
    };
  }, [query, positionedNodes]);

  return { query, setQuery, matchId, focusId, focusNode };
}
