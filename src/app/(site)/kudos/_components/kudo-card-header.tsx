"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { HeroTier, KudoFeedRow, StarCount } from "@/lib/kudos/types";
import { TierBadge } from "./tier-badge";
import { SendIcon } from "@/components/icons";

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
  /** Sender's Hero tier — shown like the Highlight card (NULL when anonymous). */
  senderHeroTier?: HeroTier | null;
  /** Stars (hoa thị) shown alongside the Hero tier (10/20/50 received). */
  senderStarCount?: StarCount | null;
  recipientStarCount?: StarCount | null;
};

/** ★ row — matches the Highlight card (primary gold, xs). */
function StarRow({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="text-primary-1 text-xs font-bold">{"★".repeat(count)}</span>
  );
}

/**
 * Person column — mirrors the Highlight card's `PersonInfo`:
 * 64px white-bordered avatar centered above name + a `dept • ★ tier` meta row.
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
  heroTier?: HeroTier | null;
  starCount?: StarCount | null;
}) {
  const stars = starCount ?? 0;

  return (
    <div className="flex flex-col items-center gap-3 w-[235px]">
      {/* 64×64 circular avatar, white border (matches Highlight) */}
      <Avatar size="default" className="size-16 shrink-0 border-2 border-white">
        <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="bg-gray-400 text-white text-lg font-bold">
          {displayName?.charAt(0)?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>

      {/* Name + meta */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        <span className="text-secondary text-[16px] font-bold leading-6 text-center truncate w-full">
          {displayName}
        </span>
        <div className="flex items-center gap-2 justify-center flex-wrap">
          {deptCode && (
            <span className="text-secondary-2 text-[14px] font-bold leading-5">
              {deptCode}
            </span>
          )}
          <div className="size-1 rounded-full bg-secondary-2" />
          <StarRow count={stars} />
          <TierBadge tier={heroTier} />
        </div>
      </div>
    </div>
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
  senderHeroTier,
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
        heroTier={isAnonymous ? null : senderHeroTier}
        starCount={isAnonymous ? null : senderStarCount}
      />

      {/* C.3.2 Send icon — navy, top-aligned with the avatars (matches Highlight) */}
      <div className="flex items-center pt-4 shrink-0">
        <SendIcon className="size-8 text-secondary shrink-0" aria-hidden />
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
