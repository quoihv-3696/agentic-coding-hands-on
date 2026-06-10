"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { KudoFeedRow, StarCount } from "@/lib/kudos/types";
import { TierBadge } from "./tier-badge";

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
> & {
  /** Stars (hoa thị) shown alongside the Hero tier (10/20/50 received). */
  senderStarCount?: StarCount | null;
  recipientStarCount?: StarCount | null;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/**
 * A person column — Figma C.3.1 / C.3.3 "Infor" component:
 * 64px avatar (circular, white border) centered above name + dept/tier row.
 * Width: 235px in Figma; we let it shrink naturally in flex layouts.
 */
function PersonColumn({
  displayName,
  avatarUrl,
  deptCode,
  heroTier,
  starCount,
}: {
  displayName: string;
  avatarUrl: string | null;
  deptCode: string | null;
  heroTier?: KudoFeedRow["recipientHeroTier"];
  starCount?: StarCount | null;
}) {
  const { t } = useTranslations();
  const stars = starCount ?? 0;

  return (
    <div className="flex flex-col items-center gap-3.25 w-58.75">
      {/* 64×64 circular avatar — Figma: border 1.869px solid #FFF */}
      <Avatar
        size="default"
        className="size-16 shrink-0 ring-2 ring-white ring-offset-0"
      >
        <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="bg-[#998C5F]/20 text-[#00101A] font-bold text-xs">
          {initials(displayName)}
        </AvatarFallback>
      </Avatar>

      {/* Name + dept/tier row */}
      <div className="flex flex-col items-start gap-0.5 w-full">
        {/* Name — Figma: Montserrat 16 bold, center, color #00101A */}
        <span
          className="w-full text-center font-bold text-base leading-6 text-[#00101A] truncate"
          title={displayName}
        >
          {displayName}
        </span>

        {/* Huy hiệu + Sao row — Figma: row, center, gap-2.5 */}
        <div className="flex flex-row items-center justify-center gap-2.5 w-full">
          {/* Dept code — Figma: Montserrat 14 bold, color #999 */}
          {deptCode && (
            <span className="text-[14px] font-bold leading-5 text-[#999999] truncate max-w-14">
              {deptCode}
            </span>
          )}

          {/* Hero tier badge (shared component) */}
          <TierBadge tier={heroTier} />

          {/* Số hoa thị (stars) — alongside the Hero tier (10/20/50 received) */}
          {stars > 0 && (
            <span
              className="shrink-0 text-[#FFEA9E] text-sm leading-none"
              title={t("kudosBoard.stars.tooltip")}
              aria-label={`${stars} stars`}
            >
              {"★".repeat(stars)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Send arrow icon — Figma C.3.2: 32×32 icon centered vertically in 123px column. */
function SendIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0 text-[#FFEA9E]"
    >
      <path
        d="M6 16H26M26 16L18 8M26 16L18 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * KudoCardHeader — Figma "Info user" frame (C.3.1 → C.3.2 → C.3.3):
 *
 * [Sender column (235px)] [Send icon (32px)] [Recipient column (235px)]
 * Total row width = 600px in Figma; gap-6 (24px) between items.
 *
 * Preserved: all existing prop names — existing detail page consumer still compiles.
 */
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
  senderStarCount,
  recipientStarCount,
}: Props) {
  const { t } = useTranslations();

  const senderName = isAnonymous
    ? (anonymousNickname ?? t("kudosFeed.anonymous"))
    : (senderDisplayName ?? t("kudosFeed.anonymous"));

  return (
    /* Figma: row, gap-24px, justify-space-between, width 600px */
    <div className="flex flex-row items-start justify-between gap-6 w-full">
      {/* C.3.1 Sender */}
      <PersonColumn
        displayName={senderName}
        avatarUrl={isAnonymous ? null : senderAvatarUrl}
        deptCode={isAnonymous ? null : senderDeptCode}
        starCount={isAnonymous ? null : senderStarCount}
      />

      {/* C.3.2 Send icon — vertically centered in 123px height */}
      <div className="flex items-center justify-center w-8 self-stretch py-4">
        <SendIcon />
      </div>

      {/* C.3.3 Recipient + hero tier */}
      <PersonColumn
        displayName={recipientDisplayName}
        avatarUrl={recipientAvatarUrl}
        deptCode={recipientDeptCode}
        heroTier={recipientHeroTier}
        starCount={recipientStarCount}
      />
    </div>
  );
}
