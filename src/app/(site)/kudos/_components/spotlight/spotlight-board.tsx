"use client";

/**
 * SpotlightBoard — composition root for the Spotlight section (spec B.6 + B.7).
 *
 * Header (Sun* Annual Awards 2025 / SPOTLIGHT BOARD) above a single canvas frame:
 *   - two stacked background layers: bg-root-further (bottom) + bg-spotlight
 *     constellation (top), behind a dark legibility scrim;
 *   - the interactive scattered word-cloud (pan/zoom) over the backdrop;
 *   - overlays: search pill (top-left), 388 KUDOS (top-centre), live ticker
 *     (bottom-left), zoom/expand controls (bottom-right).
 *
 * Width is aligned to the rest of the Kudos page (max-w-6xl).
 */

import { useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { Separator } from "@/components/ui/separator";
import bgRoot from "@/assets/images/kudos/bg-root-further.png";
import bgSpotlight from "@/assets/images/kudos/bg-spotlight.png";
import { SpotlightSearch } from "./spotlight-search";
import { SpotlightCanvas } from "./spotlight-canvas";
import { SpotlightTicker } from "./spotlight-ticker";
import type { PositionedNode, RecentEvent, SpotlightBoardProps } from "./types";

// Re-export prop types so callers can import from one place
export type { SpotlightBoardProps, PositionedNode, RecentEvent };

/**
 * Pure presentational composition root — receives all data via props.
 * SpotlightBoardClient wires real positionedNodes / realtime / search here.
 */
export function SpotlightBoard({
  positionedNodes,
  totalCount,
  recentEvents,
  state,
  onNodeClick,
  search,
}: SpotlightBoardProps) {
  const { t } = useTranslations();
  const frameRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void el.requestFullscreen?.();
  }, []);

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 md:px-8"
      aria-label={t("kudosSpotlight.title")}
    >
      {/* ── B.6_Header Giải thưởng ── */}
      <div className="py-8">
        <p className="font-bold font-[Montserrat] text-2xl text-white leading-8">
          {t("kudosSpotlight.subtitle")}
        </p>
        <Separator className="my-2 w-12 border-primary" />
        <h2 className="font-bold font-[Montserrat] text-[57px] text-primary uppercase leading-[64px] tracking-[-0.25px]">
          {t("kudosSpotlight.title")}
        </h2>
      </div>

      {/* ── B.7_Spotlight canvas frame ── */}
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden rounded-[47px] border border-[#998C5F] bg-secondary"
        style={{ aspectRatio: "1157 / 548" }}
      >
        {/* Background layer 1 — Root Further roots artwork (bottom) */}
        <Image
          src={bgRoot}
          alt=""
          fill
          priority
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="pointer-events-none select-none object-cover"
        />
        {/* Background layer 2 — constellation network (transparent PNG, top) */}
        <Image
          src={bgSpotlight}
          alt=""
          fill
          sizes="(max-width: 1000px) 100vw, 1000px"
          className="pointer-events-none select-none"
        />
        {/* Legibility scrim */}
        <div className="pointer-events-none absolute inset-0 bg-black/30" />

        {/* Interactive node layer (pan/zoom) */}
        {state === "interactive" && (
          <SpotlightCanvas
            nodes={positionedNodes}
            matchId={search.matchId}
            focusId={search.focusId}
            onNodeClick={onNodeClick}
            onExpand={toggleFullscreen}
          />
        )}
        {state === "loading" && <CanvasSkeleton />}
        {state === "empty" && <CanvasEmpty t={t} />}

        {/* B.7.3_Tìm kiếm sunner — top-left overlay */}
        <div className="absolute top-5 left-5 z-[60]">
          <SpotlightSearch value={search.query} onChange={search.setQuery} />
        </div>

        {/* B.7.1_388 KUDOS — top-centre overlay */}
        <p
          className="-translate-x-1/2 absolute top-5 left-1/2 z-60 font-bold text-[36px] text-white leading-11"
          aria-live="polite"
          aria-label={`${totalCount} ${t("kudosSpotlight.countSuffix")}`}
        >
          {state === "loading" ? (
            <span className="inline-block h-10 w-44 animate-pulse rounded bg-white/10" />
          ) : (
            <>
              <span className="tabular-nums">{totalCount}</span>{" "}
              <span>{t("kudosSpotlight.countSuffix")}</span>
            </>
          )}
        </p>

        {/* Live ticker — bottom-left overlay */}
        <div className="absolute bottom-3 left-5 z-[60] max-w-[60%]">
          <SpotlightTicker events={recentEvents} />
        </div>
      </div>
    </section>
  );
}

// ── Internal loading / empty states ──────────────────────────────────────────

function CanvasSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="font-[Montserrat] text-sm text-white/50">
          Loading…
        </span>
      </div>
    </div>
  );
}

function CanvasEmpty({ t }: { t: (key: string) => string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="font-[Montserrat] text-base text-white/60">
        {t("kudosSpotlight.empty")}
      </p>
    </div>
  );
}
