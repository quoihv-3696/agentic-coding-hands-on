"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import type { HeroTier, StarCount } from "@/lib/kudos/types";

const TIER_LABEL: Record<HeroTier, string> = {
  new: "kudosFeed.tiers.new",
  rising: "kudosFeed.tiers.rising",
  super: "kudosFeed.tiers.super",
  legend: "kudosFeed.tiers.legend",
};

/**
 * Recognition badge: the Hero tier pill + the star (hoa thị) count, rendered side
 * by side (spec B.3.2 / B.3.6). Stars run ALONGSIDE the tier — different thresholds.
 * Hovering the stars shows the threshold tooltip.
 */
export function StarBadge({
  tier,
  starCount,
  className,
}: {
  tier: HeroTier | null;
  starCount: StarCount | null;
  className?: string;
}) {
  const { t } = useTranslations();
  const stars = starCount ?? 0;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {tier && (
        <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-[10px] text-primary uppercase tracking-wide">
          {t(TIER_LABEL[tier])}
        </span>
      )}
      {stars > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-primary text-xs leading-none"
                aria-label={`${stars} stars`}
              >
                {"★".repeat(stars)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{t("kudosBoard.stars.tooltip")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  );
}
