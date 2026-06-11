"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/i18n/i18n-context";
import heroBg from "@/assets/images/home/hero-bg.png";
import kudosLogo from "@/assets/images/kudos/kudos-logo.png";
import { KudosInputPill } from "./kudos-input-pill";

interface HeroBannerProps {
  /** Callback fired when the input pill is clicked — wired to form dialog in Phase 08. */
  onOpen?: () => void;
}

/**
 * Kudos Live Board — Hero banner (spec A).
 *
 * Layout matches Figma `A_KV Kudos` frame (1440px artboard):
 * - Full-width KV background: existing feather artwork (hero-bg.png), same as homepage.
 * - Dark-left gradient overlay so the gold title is legible.
 * - Title "Hệ thống ghi nhận lời cảm ơn" (Montserrat 36px bold, gold #FFEA9E).
 * - KUDOS colorful logo wordmark (593×104 design dimensions).
 * - Input pill row (spec A.1) anchored at the bottom of the banner area.
 *
 * Content column: 144px horizontal padding, 1152px max-width (matches Figma gutter).
 */
export function HeroBanner({ onOpen }: HeroBannerProps) {
  const { t } = useTranslations();

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "512px" }}
    >
      {/* KV background — same feather PNG used on the homepage */}
      <Image
        src={heroBg}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_center]"
      />

      {/*
       * Dark gradient overlay: left ~30% solid navy → fades to transparent at ~75%.
       * Matches Figma "Cover" behaviour — artwork is visible on the right side.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(25deg, #00101A 20%, rgba(0,16,26,0.80) 35%, rgba(0,16,26,0) 75%)",
        }}
      />

      {/* Text + logo content column */}
      <div
        className="relative z-20 flex flex-col items-start pt-45 max-w-6xl mx-auto"
        style={{ paddingLeft: "144px", paddingRight: "144px" }}
      >
        {/* Title: Figma node "Hệ thống ghi nhận và cảm ơn" — 36px/700/44px lh, gold */}
        <h1
          className="font-bold"
          style={{
            fontSize: "36px",
            lineHeight: "44px",
            color: "#FFEA9E",
            fontFamily: "Montserrat, var(--font-montserrat, sans-serif)",
            letterSpacing: "0px",
          }}
        >
          {t("kudosBoard.hero.title")}
        </h1>

        {/*
         * KUDOS logo: Figma MM_MEDIA_Kudos logo, 593×104px design size.
         * Asset: src/assets/images/kudos/kudos-logo.svg (download from MoMorph media,
         * nodeId 2940:13440). Falls back gracefully if missing (alt="KUDOS").
         */}
        <div className="mt-2.5">
          <Image
            src={kudosLogo}
            alt="KUDOS"
            width={593}
            height={104}
            priority
            className="h-auto"
            style={{ maxWidth: "clamp(18rem, 41vw, 37rem)" }}
          />
        </div>
      </div>

      {/*
       * Input pill row (spec A.1): positioned at y=408 in 512px tall banner.
       * Figma: left-aligned at 144px, height 72px, above y=408 from top of KV.
       */}
      <div
        className="absolute z-20 bottom-8 left-0 right-0 max-w-6xl mx-auto"
        style={{ paddingLeft: "144px", paddingRight: "144px" }}
      >
        <KudosInputPill
          placeholder={t("kudosBoard.input.placeholder")}
          searchLabel={t("kudosBoard.searchSunner")}
          onOpen={onOpen}
        />
      </div>
    </div>
  );
}
