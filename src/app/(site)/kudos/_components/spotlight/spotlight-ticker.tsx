"use client";

/**
 * SpotlightTicker — transient new-kudo notifications at the bottom of the canvas.
 *
 * Each item is one newly-arrived kudo (driven by useSpotlightRealtime). New items
 * slide in at the TOP (faint, opacity 0.1); as newer ones arrive they get pushed
 * down and brighten toward the bottom (opacity 1), via a smooth opacity transition,
 * then the hook removes the oldest — so they disappear at the bottom.
 *
 * Text pattern: "{time} {name} đã nhận được một Kudos mới"
 */

import { useTranslations } from "@/lib/i18n/i18n-context";
import type { RecentEvent } from "./types";

interface SpotlightTickerProps {
  events: RecentEvent[];
}

const TOP_OPACITY = 0.1;
const BOTTOM_OPACITY = 1;

export function SpotlightTicker({ events }: SpotlightTickerProps) {
  const { t } = useTranslations();

  if (events.length === 0) return null;

  const n = events.length;

  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      {events.map((event, i) => {
        // events[0] = newest (top, faint) → events[n-1] = oldest (bottom, full).
        const opacity =
          n === 1
            ? BOTTOM_OPACITY
            : TOP_OPACITY + ((BOTTOM_OPACITY - TOP_OPACITY) * i) / (n - 1);
        return (
          <p
            key={event.kudoId}
            className="animate-in slide-in-from-top-2 font-bold font-[Montserrat] text-sm text-white leading-5 tracking-[0.1px] duration-300"
            style={{ opacity, transition: "opacity 500ms ease" }}
          >
            {formatTime(event.createdAt)} {event.recipientDisplayName}{" "}
            {t("kudosSpotlight.tickerSuffix")}
          </p>
        );
      })}
    </div>
  );
}

function formatTime(value: string): string {
  // Already formatted (e.g. "08:30PM") — return as-is
  if (/^\d{2}:\d{2}(AM|PM)$/i.test(value)) return value;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}
