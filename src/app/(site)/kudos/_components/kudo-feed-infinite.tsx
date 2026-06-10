"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { FeedPage, KudoFeedRow } from "@/lib/kudos/types";
import { KudoCard } from "./kudo-card";

interface Props {
  /** Initial page of rows (already fetched server-side or as static mock). */
  initialRows: KudoFeedRow[];
  /** Cursor for the next page; null = no more pages. */
  initialCursor: string | null;
  /**
   * Called when the sentinel scrolls into view.
   * Must return the next FeedPage (rows + nextCursor).
   * For the static Phase 06 mock, pass a function returning { rows: [], nextCursor: null }.
   */
  loadMore: (cursor: string) => Promise<FeedPage>;
}

export function KudoFeedInfinite({
  initialRows,
  initialCursor,
  loadMore,
}: Props) {
  const { t } = useTranslations();

  const [rows, setRows] = useState<KudoFeedRow[]>(initialRows);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchNext = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const page = await loadMore(cursor);
      setRows((prev) => [...prev, ...page.rows]);
      setCursor(page.nextCursor);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more kudos."
      );
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, loadMore]);

  // IntersectionObserver — fires fetchNext when sentinel enters the viewport.
  // No external dependency; built-in browser API only.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNext();
        }
      },
      { rootMargin: "200px" } // trigger 200px before sentinel reaches viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, fetchNext]);

  if (rows.length === 0 && !loading) {
    return (
      <p className="text-center text-[#999999] py-16 font-medium">
        {t("kudosBoard.allKudos.empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Kudo cards */}
      <ul className="flex flex-col gap-6" role="list">
        {rows.map((row) => (
          <li key={row.id}>
            <KudoCard row={row} />
          </li>
        ))}
      </ul>

      {/* Error state */}
      {error && (
        <p className="text-center text-[#CF1322] text-sm py-4">{error}</p>
      )}

      {/* Loading indicator */}
      {loading && (
        <div
          className="flex justify-center py-6"
          aria-label="Loading more kudos"
          role="status"
        >
          <span className="inline-block size-6 rounded-full border-2 border-[#FFEA9E] border-t-transparent animate-spin" />
        </div>
      )}

      {/*
       * Sentinel — invisible div observed by IntersectionObserver.
       * Rendered only when there are more pages (cursor !== null).
       * Placed after the list so it is naturally below all cards.
       */}
      {cursor && !loading && (
        <div ref={sentinelRef} className="h-1" aria-hidden />
      )}

      {/* End-of-feed marker */}
      {!cursor && rows.length > 0 && (
        <p className="text-center text-[#999999] text-sm py-4 opacity-60">
          —
        </p>
      )}
    </div>
  );
}
