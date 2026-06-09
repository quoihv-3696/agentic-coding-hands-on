"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { HERO_TIER_LABEL_KEY } from "@/lib/kudos/tiers";
import type { KudoFeedRow } from "@/lib/kudos/types";

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

type Props = Pick<
  KudoFeedRow,
  | "isAnonymous"
  | "anonymousNickname"
  | "senderDisplayName"
  | "senderAvatarUrl"
  | "senderDeptCode"
  | "recipientDisplayName"
  | "recipientAvatarUrl"
  | "recipientDeptCode"
  | "recipientHeroTier"
>;

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function PersonPill({
  displayName,
  avatarUrl,
  deptCode,
}: {
  displayName: string;
  avatarUrl: string | null;
  deptCode: string | null;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar size="default" className="shrink-0">
        <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="bg-[#998C5F]/20 text-[#00101A] font-bold text-xs">
          {initials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-sm leading-tight text-[#00101A] truncate">
          {displayName}
        </span>
        {deptCode && (
          <span className="text-xs text-[#998C5F] leading-tight truncate">
            {deptCode}
          </span>
        )}
      </div>
    </div>
  );
}

export function KudoCardHeader({
  isAnonymous,
  anonymousNickname,
  senderDisplayName,
  senderAvatarUrl,
  senderDeptCode,
  recipientDisplayName,
  recipientAvatarUrl,
  recipientDeptCode,
  recipientHeroTier,
}: Props) {
  const { t } = useTranslations();

  const senderName = isAnonymous
    ? (anonymousNickname ?? t("kudosFeed.anonymous"))
    : (senderDisplayName ?? t("kudosFeed.anonymous"));

  const tierBadge = TIER_BADGE[recipientHeroTier];
  const tierLabel = t(HERO_TIER_LABEL_KEY[recipientHeroTier]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {/* Sender */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-xs font-semibold text-[#998C5F] shrink-0">
          {t("kudosFeed.from")}
        </span>
        {isAnonymous ? (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar size="default" className="shrink-0">
              <AvatarFallback className="bg-[#998C5F]/20 text-[#00101A] font-bold text-xs">
                {initials(senderName)}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-sm text-[#00101A] truncate">
              {senderName}
            </span>
          </div>
        ) : (
          <PersonPill
            displayName={senderName}
            avatarUrl={senderAvatarUrl}
            deptCode={senderDeptCode}
          />
        )}
      </div>

      {/* Arrow + "to" label */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#998C5F] shrink-0">
        <span aria-hidden>→</span>
        <span>{t("kudosFeed.to")}</span>
      </div>

      {/* Recipient + Hero badge */}
      <div className="flex items-center gap-2 min-w-0">
        <PersonPill
          displayName={recipientDisplayName}
          avatarUrl={recipientAvatarUrl}
          deptCode={recipientDeptCode}
        />
        <Image
          src={tierBadge.src}
          alt={tierLabel}
          width={tierBadge.w}
          height={tierBadge.h}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
