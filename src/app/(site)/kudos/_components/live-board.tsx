"use client";

import { useCallback, useEffect } from "react";
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
import { HeroBanner } from "./hero-banner";
import { KudosComposerProvider, useKudosComposer } from "./kudos-composer";
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
 * Public entry point — wraps the board content in the single KudosComposerProvider
 * so both the hero pill and any profile hover card share one dialog instance.
 */
export function LiveBoard(props: LiveBoardProps) {
  return (
    <KudosComposerProvider>
      <LiveBoardInner {...props} />
    </KudosComposerProvider>
  );
}

/**
 * Inner board — can safely call useKudosComposer() because it is rendered
 * inside KudosComposerProvider above.
 */
function LiveBoardInner({
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
  const composer = useKudosComposer();

  // Realtime: a change anywhere → re-render server data (router.refresh re-runs
  // the RSC fetch against the masked view; raw payloads are never rendered).
  // Debounced so a burst of reactions coalesces into one refresh.
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

  const filterKey = `${filters.hashtag ?? ""}|${filters.department ?? ""}`;
  const loadMore = useCallback(
    (cursor: string) => loadFeedPage(cursor, filters),
    [filters],
  );

  return (
    <main className="min-h-screen bg-secondary pb-16">
      {/* Hero pill opens the composer with no preset recipient */}
      <HeroBanner onOpen={() => composer.open()} />

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
    </main>
  );
}
