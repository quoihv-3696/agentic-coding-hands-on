"use client";

/**
 * SpotlightTooltip — shown on hover over a word-cloud node.
 * Displays recipient name + formatted time.
 */

interface SpotlightTooltipProps {
  displayName: string;
  /** ISO string or pre-formatted display string */
  time: string;
}

export function SpotlightTooltip({ displayName, time }: SpotlightTooltipProps) {
  const formattedTime = (() => {
    try {
      const d = new Date(time);
      if (Number.isNaN(d.getTime())) return time;
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return time;
    }
  })();

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#998C5F] bg-[rgba(0,16,26,0.92)] px-3 py-2 shadow-lg"
    >
      <p className="font-bold text-primary text-sm leading-tight">{displayName}</p>
      <p className="mt-0.5 text-white/70 text-xs">{formattedTime}</p>
      {/* Arrow */}
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#998C5F]" />
    </div>
  );
}
