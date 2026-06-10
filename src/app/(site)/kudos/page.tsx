import { getFeed, getHighlight } from "@/lib/kudos/queries";
import {
  getGiftLeaderboard,
  getPromotionLeaderboard,
  getStats,
} from "@/lib/kudos/stats";
import { KUDO_HASHTAGS } from "@/lib/kudos/hashtags";
import { DEPARTMENTS } from "@/lib/kudos/departments";
import type { HighlightFilters } from "@/lib/kudos/types";
import { LiveBoard } from "./_components/live-board";

/** Sun* Kudos Live Board (MoMorph MaZUn5xHXZ). Filters live in the URL searchParams. */
export default async function KudosPage({
  searchParams,
}: {
  searchParams: Promise<{ hashtag?: string; department?: string }>;
}) {
  const sp = await searchParams;
  // Only accept filter values from the canonical lists — arbitrary query strings
  // must not surface as active filter chips.
  const filters: HighlightFilters = {};
  if (sp.hashtag && KUDO_HASHTAGS.some((h) => h.slug === sp.hashtag)) {
    filters.hashtag = sp.hashtag;
  }
  if (sp.department && (DEPARTMENTS as readonly string[]).includes(sp.department)) {
    filters.department = sp.department;
  }

  const [highlight, feed, stats, promotions, gifts] = await Promise.all([
    getHighlight(filters),
    getFeed({ filters, limit: 10 }),
    getStats(),
    getPromotionLeaderboard(),
    getGiftLeaderboard(),
  ]);

  return (
    <LiveBoard
      highlight={highlight}
      feedInitial={feed.rows}
      feedCursor={feed.nextCursor}
      stats={stats}
      promotions={promotions}
      gifts={gifts}
      filters={filters}
    />
  );
}
