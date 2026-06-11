"use client";

/**
 * SpotlightBoardClient — Phase 06 integration glue.
 *
 * Receives the server-fetched recipient set + live-count + ticker events, runs
 * the deterministic layout (Track B `layoutNodes`), wires the search and realtime
 * hooks, and feeds the presentational <SpotlightBoard> (Track A).
 *
 * Coordinate bridge: `layoutNodes` emits centre coords in the design's virtual
 * pixel space (LAYOUT_DIMS); the canvas positions nodes with CSS percentages, so
 * we convert px → % here. The canvas preserves the 1157:548 aspect ratio, so the
 * percentage mapping stays correct at any rendered size — no client measurement
 * needed (deterministic + SSR-safe).
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { layoutNodes } from "@/lib/kudos/spotlight/layout";
import { useSpotlightSearch } from "@/lib/kudos/spotlight/use-spotlight-search";
import { useSpotlightRealtime } from "@/lib/kudos/spotlight/use-spotlight-realtime";
import type { SpotlightNode } from "@/lib/kudos/spotlight/types";
import { SpotlightBoard } from "./spotlight-board";
import type { PositionedNode } from "./types";

/** Design canvas dimensions — layout virtual space (matches the 1157:548 canvas). */
const LAYOUT_DIMS = { width: 1157, height: 548 };

interface SpotlightBoardClientProps {
  nodes: SpotlightNode[];
  totalCount: number;
}

export function SpotlightBoardClient({
  nodes,
  totalCount,
}: SpotlightBoardClientProps) {
  const router = useRouter();

  // Deterministic scatter in virtual px space (recomputed only when the node set changes).
  const positioned = useMemo(() => layoutNodes(nodes, LAYOUT_DIMS), [nodes]);

  // Search matches against the visible positioned nodes (client-side, accent-insensitive).
  const search = useSpotlightSearch(positioned);

  // Live count (seeded from server) + transient ticker (event-driven, starts hidden).
  const { totalCount: liveCount, recentEvents: liveEvents } =
    useSpotlightRealtime({ totalCount });

  // px centre coords → canvas percentages for the CSS-positioned label nodes.
  const uiNodes = useMemo<PositionedNode[]>(
    () =>
      positioned.map((n) => ({
        ...n,
        x: (n.x / LAYOUT_DIMS.width) * 100,
        y: (n.y / LAYOUT_DIMS.height) * 100,
      })),
    // opacity/fontSize carried through from layout for the 3D depth effect.
    [positioned],
  );

  return (
    <SpotlightBoard
      positionedNodes={uiNodes}
      totalCount={liveCount}
      recentEvents={liveEvents}
      state={nodes.length === 0 ? "empty" : "interactive"}
      onNodeClick={(latestKudoId) => router.push(`/kudos/${latestKudoId}`)}
      search={{
        query: search.query,
        setQuery: search.setQuery,
        matchId: search.matchId,
        focusId: search.focusId,
      }}
    />
  );
}
