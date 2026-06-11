"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { subscribeBoard } from "@/lib/kudos/realtime";
import { loadFeedPage } from "@/lib/kudos/actions";
import { KUDO_HASHTAGS } from "@/lib/kudos/hashtags";
import { DEPARTMENTS } from "@/lib/kudos/departments";
import type {
  HighlightFilters,
  KudoFeedRow,
  LeaderboardEntry,
  StatsSummary,
} from "@/lib/kudos/types";
import type { SpotlightNode } from "@/lib/kudos/spotlight/types";
import { KudosFormDialog } from "@/app/(site)/_components/kudos-form/kudos-form-dialog";
import { HeroBanner } from "./hero-banner";
import { HighlightCarousel } from "./highlight-carousel";
import { SpotlightBoardClient } from "./spotlight/spotlight-board-client";
import { KudoFeedInfinite } from "./kudo-feed-infinite";
import { StatsSidebar } from "./stats-sidebar";
import { Separator } from "@/components/ui/separator";

interface LiveBoardProps {
  highlight: KudoFeedRow[];
  feedInitial: KudoFeedRow[];
  feedCursor: string | null;
  stats: StatsSummary;
  promotions: LeaderboardEntry[];
  gifts: LeaderboardEntry[];
  filters: HighlightFilters;
  spotlightNodes: SpotlightNode[];
  spotlightTotal: number;
}

/**
 * Client shell for the Kudos Live Board (spec MaZUn5xHXZ). Holds the filter state
 * in the URL (single source for BOTH Highlight + All Kudos), opens the existing
 * write/send dialog from the hero input pill, and subscribes to realtime changes —
 * re-fetching server data on any kudos/reaction change (preserves anonymous masking).
 */
export function LiveBoard({
  highlight,
  feedInitial,
  feedCursor,
  stats,
  promotions,
  gifts,
  filters,
  spotlightNodes,
  spotlightTotal,
}: LiveBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const [formOpen, setFormOpen] = useState(false);

  // Realtime: a change anywhere → re-render server data (router.refresh re-runs
  // the RSC fetch against the masked view; raw payloads are never rendered).
  // Debounced so a burst of reactions coalesces into one refresh (avoids a
  // thundering herd of 5-query refetches under event-day load).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribeBoard(() => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 800);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [router]);

  const onFilterChange = useCallback(
    (next: HighlightFilters) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.hashtag) params.set("hashtag", next.hashtag);
      else params.delete("hashtag");
      if (next.department) params.set("department", next.department);
      else params.delete("department");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  // Remount carousel + feed when filters change → resets carousel to page 1 and
  // re-seeds the infinite list from the new server page.
  const filterKey = `${filters.hashtag ?? ""}|${filters.department ?? ""}`;
  const loadMore = useCallback(
    (cursor: string) => loadFeedPage(cursor, filters),
    [filters],
  );

  return (
    <main className="min-h-screen bg-secondary pb-16">
      <HeroBanner onOpen={() => setFormOpen(true)} />

      <HighlightCarousel
        key={`hl-${filterKey}`}
        rows={highlight}
        hashtags={KUDO_HASHTAGS}
        departments={DEPARTMENTS}
        filters={filters}
        onFilterChange={onFilterChange}
        onViewDetails={(id) => router.push(`/kudos/${id}`)}
      />

      {/* Spotlight Board — scattered recipient word-cloud with live count + transient ticker */}
      <SpotlightBoardClient
        nodes={spotlightNodes}
        totalCount={spotlightTotal}
      />

      <section className="mx-auto w-full max-w-6xl space-y-10">
        <header className="pt-12">
          <p className="font-semibold text-secondary-1 text-2xl tracking-widest">
            {t("kudosBoard.subtitle")}
          </p>
          <Separator className="w-12 border-primary" />
          <h2 className="font-bold text-[57px] text-primary uppercase tracking-wide">
            {t("kudosBoard.allKudos.title")}
          </h2>
        </header>
        <div className="flex items-start justify-between gap-8">
          <div className="w-full max-w-170">
            <KudoFeedInfinite
              key={`feed-${filterKey}`}
              initialRows={feedInitial}
              initialCursor={feedCursor}
              loadMore={loadMore}
            />
          </div>
          <StatsSidebar stats={stats} promotions={promotions} gifts={gifts} />
        </div>
      </section>

      <KudosFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </main>
  );
}
