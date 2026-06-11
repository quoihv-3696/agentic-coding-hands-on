"use client";

/**
 * SpotlightSearch — search input pill with magnifier icon.
 * Matches design: pill shape, gold border, frosted-gold background.
 * Design ref: node 2940:14833 (B.7.3_Tìm kiếm sunner)
 *   border: 0.682px solid #998C5F, bg: rgba(255,234,158,0.10), border-radius: 46px
 */

import { useTranslations } from "@/lib/i18n/i18n-context";

interface SpotlightSearchProps {
  value: string;
  onChange: (q: string) => void;
}

export function SpotlightSearch({ value, onChange }: SpotlightSearchProps) {
  const { t } = useTranslations();

  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3 py-2"
      style={{
        border: "0.682px solid #998C5F",
        background: "rgba(255, 234, 158, 0.10)",
        minWidth: 219,
      }}
    >
      {/* Magnifier icon — inline SVG so currentColor works */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-primary/70"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("kudosSpotlight.search")}
        maxLength={100}
        className="min-w-0 flex-1 bg-transparent font-[Montserrat] text-sm text-white placeholder:text-white/50 focus:outline-none"
        aria-label={t("kudosSpotlight.search")}
      />
    </div>
  );
}
