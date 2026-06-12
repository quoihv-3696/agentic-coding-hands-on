"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import type { HeroTier } from "@/lib/kudos/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TierBadge } from "@/components/kudos/tier-badge";
import { useHoverOpen } from "./use-hover-open";

/**
 * A `TierBadge` that, on hover, opens a dark preview card explaining the tier
 * (the "Có N người gửi Kudos cho bạn" line + a description) — per Figma
 * 3241-14991/14995/14999/15003. Uses DropdownMenu (not popover), opened on hover
 * with a small close delay; also opens on click/tap/keyboard.
 *
 * Renders nothing when there's no tier (mirrors TierBadge).
 */
export function TierBadgeInfo({
  tier,
  className,
}: {
  tier?: HeroTier | null;
  className?: string;
}) {
  const { t } = useTranslations();
  const { open, setOpen, openNow, scheduleClose, cancelClose } = useHoverOpen();

  if (!tier) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
      >
        <span className="inline-flex">
          <TierBadge tier={tier} className={className} />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className="w-[300px]! max-h-none! flex flex-col gap-2 rounded-2xl border border-[#998C5F] bg-[#00070C] p-4 shadow-2xl"
      >
        <TierBadge tier={tier} />
        <p className="font-bold text-sm leading-5 text-white">
          {t(`kudosTierInfo.${tier}.count`)}
        </p>
        <p className="text-[13px] leading-5 text-secondary-2">
          {t(`kudosTierInfo.${tier}.desc`)}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
