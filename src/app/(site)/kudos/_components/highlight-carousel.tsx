"use client";

import { useState, useCallback, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { KudoFeedRow, HighlightFilters } from "@/lib/kudos/types";
import type { KudoHashtag } from "@/lib/kudos/hashtags";
import { HighlightFilters as FiltersBar } from "./highlight-filters";
import { HighlightCard } from "./highlight-card";
import { useTranslations } from "@/lib/i18n/i18n-context";

// ─── Props ────────────────────────────────────────────────────────────────────

interface HighlightCarouselProps {
  /** Highlight rows (top-5 by hearts). Empty → empty state. */
  rows?: KudoFeedRow[];
  hashtags: readonly KudoHashtag[];
  departments: readonly string[];
  filters: HighlightFilters;
  onFilterChange: (filters: HighlightFilters) => void;
  onHeart?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HighlightCarousel({
  rows,
  hashtags,
  departments,
  filters,
  onFilterChange,
  onHeart,
  onCopyLink,
  onViewDetails,
}: HighlightCarouselProps) {
  const { t } = useTranslations();
  const data = rows ?? [];

  // Auto-advance; pauses on hover, resumes after; keeps running after manual nav.
  // Lazy useState keeps one stable plugin instance (readable during render, unlike a ref).
  const [autoplay] = useState(() =>
    Autoplay({
      delay: 1000000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const total = data.length;
  const paginationLabel = `${current + 1}/${total}`;

  // Capped to the Figma frame width so ultra-wide screens (>1600px) render
  // identically to the design instead of destabilising embla's center align.
  return (
    <section className="mx-auto w-full max-w-378 flex flex-col gap-10 bg-secondary">
      {/* ── Header (B.1) ─────────────────────────────────────────────── */}
      <div className="px-36 flex flex-col gap-10">
        {/* B.1 inner container */}
        <div className="flex flex-col gap-0">
          {/* Subtitle */}
          <p className="text-white text-2xl font-bold leading-8">
            {t("kudosBoard.subtitle")}
          </p>

          {/* Thin divider */}
          <div className="w-full h-px bg-[#2E3940] mt-1 mb-4" />

          {/* Title row */}
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-primary-1 text-[57px] font-bold leading-16 tracking-[-0.25px]">
              {t("kudosBoard.highlight.title")}
            </h2>
            <FiltersBar
              hashtags={hashtags}
              departments={departments}
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </div>
        </div>
      </div>

      {/* ── Carousel (B.2) ───────────────────────────────────────────── */}
      {data.length === 0 ? (
        <div className="px-36 py-20 text-center text-secondary-2 text-base font-bold">
          {t("kudosBoard.highlight.empty")}
        </div>
      ) : (
        <div className="relative w-full">
          {/* Edge covers (B.2): #00101A→transparent gradient, full carousel height,
              masking the half-peeking side cards so the center card is the focus.
              Below the arrows (z-20), above the cards. */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-100"
            style={{
              background:
                "linear-gradient(to right, #00101A 50%, rgba(0,16,26,0) 100%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-100"
            style={{
              background:
                "linear-gradient(to left, #00101A 50%, rgba(0,16,26,0) 100%)",
            }}
            aria-hidden
          />
          {/* Prev arrow (B.2.1) */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            aria-label="Previous slide"
            className={cn(
              "absolute left-20 top-1/2 -translate-y-1/2 z-20",
              "flex items-center justify-center w-20 h-20 rounded",
              "transition-opacity duration-200",
              !canPrev && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronLeft className="w-15 h-15 text-primary-1" />
          </button>

          {/* Next arrow (B.2.2) */}
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            aria-label="Next slide"
            className={cn(
              "absolute right-10 top-1/2 -translate-y-1/2 z-20",
              "flex items-center justify-center w-20 h-20 rounded",
              "transition-opacity duration-200",
              !canNext && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronRight className="w-15 h-15 text-primary-1" />
          </button>

          {/* Embla carousel */}
          <Carousel
            opts={{
              align: "center",
              // Infinite wrap-around so every card (incl. first/last) centers and
              // it can auto-advance forever.
              loop: true,
            }}
            plugins={[autoplay]}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {data.map((row, idx) => (
                <CarouselItem
                  key={row.id}
                  // basis = card width + pl-6 gutter (box-border), so the CARD itself
                  // reaches 528px (→ 525px tall via its aspect ratio); shrinks on small screens.
                  className="pl-6 basis-[clamp(324px,80vw,552px)] shrink-0"
                >
                  <HighlightCard
                    row={row}
                    isActive={idx === current}
                    onHeart={onHeart}
                    onCopyLink={onCopyLink}
                    onViewDetails={onViewDetails}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      {/* ── Pagination (B.5) ─────────────────────────────────────────── */}
      {data.length > 0 && (
        <div className="flex items-center justify-center gap-8 px-36 h-13">
          {/* Small prev arrow */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            aria-label="Previous slide"
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded",
              "transition-opacity duration-200",
              !canPrev && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronLeft className="w-7 h-7 text-secondary-2" />
          </button>

          {/* Page indicator */}
          <span className="text-secondary-2 text-[28px] font-bold leading-9 min-w-14 text-center">
            {paginationLabel}
          </span>

          {/* Small next arrow */}
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            aria-label="Next slide"
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded",
              "transition-opacity duration-200",
              !canNext && "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronRight className="w-7 h-7 text-secondary-2" />
          </button>
        </div>
      )}
    </section>
  );
}
