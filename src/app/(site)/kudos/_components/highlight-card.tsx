"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/button";
import { HeartIcon, LinkIcon, SendIcon, UpIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { HeroTier, KudoFeedRow } from "@/lib/kudos/types";
import { toggleReaction } from "@/lib/kudos/actions";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { TierBadge } from "./tier-badge";

// Inline star icons — Phase 08's star-badge.tsx will replace.
function StarRow({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="text-primary-1 text-xs font-bold">
      {"★".repeat(count)}
    </span>
  );
}

interface PersonInfoProps {
  name: string | null;
  avatarUrl: string | null;
  deptCode: string | null;
  heroTier?: HeroTier | null;
  starCount: number;
  anonymous?: boolean;
  anonymousNickname?: string | null;
}

function PersonInfo({
  name,
  avatarUrl,
  deptCode,
  heroTier,
  starCount,
  anonymous,
  anonymousNickname,
}: PersonInfoProps) {
  const displayName = anonymous ? (anonymousNickname ?? "Ẩn danh") : name;

  return (
    <div className="flex flex-col items-center gap-3 w-[235px]">
      {/* Avatar */}
      <div className="relative w-16 h-16 rounded-full border-2 border-white overflow-hidden flex-shrink-0 bg-gray-300">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName ?? ""}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold">
            {displayName?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
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
          <div className="size-1 rounded-full bg-secondary-2"></div>
          <StarRow count={starCount} />
          <TierBadge tier={heroTier} />
        </div>
      </div>
    </div>
  );
}

export interface HighlightCardProps {
  row: KudoFeedRow;
  onViewDetails?: (id: string) => void;
}

export function HighlightCard({ row, onViewDetails }: HighlightCardProps) {
  const { t } = useTranslations();

  // Optimistic heart — reconciled against the server (same as KudoCard).
  const [hearted, setHearted] = useState(row.viewerHasReacted ?? false);
  const [heartCount, setHeartCount] = useState(row.reactionCount);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleHeart() {
    if (pending) return;
    const next = !hearted;
    setHearted(next);
    setHeartCount((c) => c + (next ? 1 : -1));
    setPending(true);
    const result = await toggleReaction(row.id);
    if ("error" in result) {
      setHearted(!next); // rollback
      setHeartCount((c) => c + (next ? -1 : 1));
    } else {
      setHearted(result.reacted);
    }
    setPending(false);
  }

  function handleCopyLink() {
    navigator.clipboard
      .writeText(`${window.location.origin}/kudos/${row.id}`)
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Format time: "10:00 - 10/30/2025"
  const formattedTime = (() => {
    const d = new Date(row.createdAt);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${hh}:${mm} - ${month}/${day}/${year}`;
  })();

  // Strip HTML tags, then decode the common entities so e.g. "a &gt; b" reads
  // "a > b" (the body is rendered as plain text in the highlight card).
  const bodyText = row.bodyHtml
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

  // Max 5 hashtags
  const visibleHashtags = row.hashtags.slice(0, 5);
  const hasMoreHashtags = row.hashtags.length > 5;

  return (
    <div
      className={cn(
        // All cards render fully bright; the carousel's edge gradient covers
        // (not blur) provide the center-focus effect per Figma.
        "flex flex-col gap-4 rounded-2xl border-4 border-primary-1 p-6 pb-4",
        // Uniform card: caps at 528×525 (Figma), shrinks proportionally on small screens.
        "w-full aspect-528/525 overflow-hidden",
        // The background from design: Details/PrimaryButton-Hover = #FFF8E1
        "bg-[#FFF8E1]",
      )}
    >
      {/* Sender → Recipient row */}
      <div className="flex flex-row items-start justify-between gap-6 w-full">
        <PersonInfo
          name={row.senderDisplayName}
          avatarUrl={row.senderAvatarUrl}
          deptCode={row.senderDeptCode}
          heroTier={row.senderHeroTier}
          starCount={row.senderStarCount ?? 0}
          anonymous={row.isAnonymous}
          anonymousNickname={row.anonymousNickname}
        />
        {/* Send icon in center */}
        <div className="flex items-center pt-4 shrink-0">
          <SendIcon className="size-8 shrink-0 text-secondary" />
        </div>
        <PersonInfo
          name={row.recipientDisplayName}
          avatarUrl={row.recipientAvatarUrl}
          deptCode={row.recipientDeptCode}
          heroTier={row.recipientHeroTier}
          starCount={row.recipientStarCount}
        />
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-primary-1" />

      {/* Content (flex-1 so the action bar pins to the bottom of the fixed-height card) */}
      <div className="flex flex-1 min-h-0 flex-col gap-4 w-full">
        {/* Time */}
        <span className="text-secondary-2 text-base font-bold leading-6 tracking-[0.5px]">
          {formattedTime}
        </span>

        {/* Hero tier label (design shows "IDOL GIỚI TRẺ" — this is the title field) */}
        {row.title && (
          <div className="text-secondary text-base font-bold leading-6 text-center tracking-[0.5px]">
            {row.title}
          </div>
        )}

        {/* Body text — max 3 lines */}
        <div className="rounded-xl border border-primary-1 bg-primary-1/40 px-6 py-4">
          <p className="text-secondary text-[20px] font-bold leading-8 line-clamp-2">
            {bodyText}
          </p>
        </div>

        {/* Hashtags — max 5 + "..." */}
        {visibleHashtags.length > 0 && (
          <div className="text-error text-base font-bold leading-6 tracking-[0.5px] truncate">
            {visibleHashtags.map((h) => `#${h}`).join(" ")}
            {hasMoreHashtags && " ..."}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-primary-1" />

      {/* Action bar */}
      <div className="flex flex-row items-center justify-between gap-6 w-full h-14">
        {/* Heart count + icon (gray inactive → red active; heart.svg fill overridden) */}
        <Button
          variant="text"
          onClick={handleHeart}
          aria-label={t("kudosFeed.heart")}
          aria-pressed={hearted}
          className="gap-1 px-0 text-secondary text-2xl font-bold leading-8"
          rightIcon={
            <HeartIcon
              className={cn(
                "size-8 transition-colors [&_path]:fill-current",
                hearted ? "text-error" : "text-secondary-2",
              )}
            />
          }
        >
          {heartCount.toLocaleString("vi-VN")}
        </Button>

        {/* Copy Link + View Details — shared Button, text variant */}
        <div className="flex items-center text-secondary">
          <Button
            variant="text"
            onClick={handleCopyLink}
            rightIcon={<LinkIcon />}
            className="text-secondary"
          >
            {copied ? t("kudosBoard.copyLinkToast") : t("kudosBoard.copyLink")}
          </Button>
          <Button
            variant="text"
            onClick={() => onViewDetails?.(row.id)}
            rightIcon={<UpIcon />}
            className="text-secondary"
          >
            {t("kudosBoard.viewDetails")}
          </Button>
        </div>
      </div>
    </div>
  );
}
