"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { HERO_TIER_LABEL_KEY } from "@/lib/kudos/tiers";
import type { HeroTier } from "@/lib/kudos/types";
import { cn } from "@/lib/utils";
import newHero from "@/assets/images/kudos/badges/new-hero.png";
import risingHero from "@/assets/images/kudos/badges/rising-hero.png";
import superHero from "@/assets/images/kudos/badges/super-hero.png";
import legendHero from "@/assets/images/kudos/badges/legend-hero.png";

const TIER_BADGE = {
  new: { src: newHero, w: 110, h: 20 },
  rising: { src: risingHero, w: 110, h: 20 },
  super: { src: superHero, w: 109, h: 19 },
  legend: { src: legendHero, w: 110, h: 20 },
} as const;

/**
 * Hero-tier badge image (assets/images/kudos/badges). Shared by the highlight +
 * All Kudos cards so both stay in sync. Renders nothing when there's no tier
 * (e.g. anonymous sender).
 */
export function TierBadge({
  tier,
  className,
}: {
  tier?: HeroTier | null;
  className?: string;
}) {
  const { t } = useTranslations();
  if (!tier) return null;
  const badge = TIER_BADGE[tier];
  return (
    <Image
      src={badge.src}
      alt={t(HERO_TIER_LABEL_KEY[tier])}
      width={badge.w}
      height={badge.h}
      className={cn("shrink-0 rounded-[48px]", className)}
      style={{ border: "0.5px solid #FFEA9E" }}
    />
  );
}
