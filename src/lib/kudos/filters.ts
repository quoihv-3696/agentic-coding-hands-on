import type { HighlightFilters } from "./types";

/**
 * Shared filter application for the Live Board: the SAME `HighlightFilters` drive
 * both the Highlight carousel and the All Kudos feed. Applied to a `kudos_feed`
 * PostgREST query builder.
 *
 * - `hashtag` → rows whose `hashtags` array contains the slug.
 * - `department` → rows whose recipient is in that canonical department.
 *
 * Typed structurally (Q has `contains`/`eq` returning itself) so it composes with
 * supabase-js builders without importing their internal generics.
 */
type FeedQuery = {
  contains(column: string, value: string[]): FeedQuery;
  eq(column: string, value: string): FeedQuery;
};

export function applyFeedFilters<Q extends FeedQuery>(
  query: Q,
  filters?: HighlightFilters,
): Q {
  let builder = query;
  if (filters?.hashtag) {
    builder = builder.contains("hashtags", [filters.hashtag]) as Q;
  }
  if (filters?.department) {
    builder = builder.eq("recipient_department", filters.department) as Q;
  }
  return builder;
}
