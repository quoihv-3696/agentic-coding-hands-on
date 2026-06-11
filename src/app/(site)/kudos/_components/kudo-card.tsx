"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { hashtagLabel } from "@/lib/kudos/hashtags";
import { toggleReaction } from "@/lib/kudos/actions";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { KudoFeedRow } from "@/lib/kudos/types";
import { Button } from "@/components/button";
import { HeartIcon, LinkIcon } from "@/components/icons";
import { KudoCardHeader } from "./kudo-card-header";
import { KudoGallery } from "./kudo-gallery";

interface Props {
  row: KudoFeedRow;
}

/** Format a createdAt ISO string → "HH:MM - MM/DD/YYYY" matching Figma C.3.4. */
function formatCardTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${hh}:${mm} - ${month}/${day}/${year}`;
  } catch {
    return iso;
  }
}

/** Max visible hashtag pills (Figma C.3.7: max 5 + "…"). */
const MAX_HASHTAGS = 5;

export function KudoCard({ row }: Props) {
  const { t } = useTranslations();

  // Optimistic heart state — reconciled against the server response.
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
      setHearted(!next);
      setHeartCount((c) => c + (next ? -1 : 1));
    } else {
      setHearted(result.reacted);
    }
    setPending(false);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/kudos/${row.id}`;
    navigator.clipboard.writeText(url).catch(() => {
      /* swallow clipboard errors */
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const visibleHashtags = row.hashtags.slice(0, MAX_HASHTAGS);
  const hasMoreHashtags = row.hashtags.length > MAX_HASHTAGS;

  return (
    /*
     * Figma C.3_KUDO Post: bg rgba(255,248,225) = #FFF8E1, rounded-3xl (24px),
     * padding 40px 40px 16px 40px (pt-10 px-10 pb-4), gap-4 column.
     */
    <article
      className="flex flex-col gap-4 rounded-3xl bg-[#FFF8E1] px-10 pt-10 pb-4 w-full"
      aria-label={row.title}
    >
      {/* C.3.1–C.3.3  Sender → send-icon → Recipient */}
      <KudoCardHeader
        isAnonymous={row.isAnonymous}
        anonymousNickname={row.anonymousNickname}
        senderDisplayName={row.senderDisplayName}
        senderAvatarUrl={row.senderAvatarUrl}
        senderDeptCode={row.senderDeptCode}
        recipientDisplayName={row.recipientDisplayName}
        recipientAvatarUrl={row.recipientAvatarUrl}
        recipientDeptCode={row.recipientDeptCode}
        recipientHeroTier={row.recipientHeroTier}
        senderHeroTier={row.senderHeroTier}
        senderStarCount={row.senderStarCount}
        recipientStarCount={row.recipientStarCount}
        senderProfileId={row.senderProfileId}
        recipientProfileId={row.recipientProfileId}
      />

      {/* Rectangle 14 — gold divider */}
      <hr className="border-[#FFEA9E]" />

      {/* Content block — Figma "Content" frame: gap-4 column */}
      <div className="flex flex-col gap-4">
        {/* C.3.4 Time — Figma: Montserrat 16 bold, #999, tracking 0.5px */}
        <p className="text-base font-bold leading-6 text-[#999999] tracking-[0.5px]">
          {formatCardTime(row.createdAt)}
        </p>

        {/*
         * C.3.5 Content box — Figma Frame 425:
         *   border 1px solid #FFEA9E, bg rgba(255,234,158,0.4),
         *   border-radius 12px, padding 16px 24px
         */}
        <div
          className="rounded-xl px-6 py-4"
          style={{
            border: "1px solid #FFEA9E",
            background: "rgba(255, 234, 158, 0.40)",
          }}
        >
          {/* Title */}
          <h3 className="font-bold text-lg leading-snug text-[#00101A] mb-2">
            {row.title}
          </h3>

          {/*
           * Body HTML — sanitized server-side before storage; safe to render.
           * Figma: Montserrat 20 bold, line-height 32px, clamped to 5 lines.
           * line-clamp-5 is a static class (Tailwind JIT-safe).
           */}
          {row.bodyHtml && (
            <div
              className={cn(
                "text-xl font-bold leading-8 text-[#00101A] line-clamp-5",
                "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic",
                "[&_a]:text-[#CF1322] [&_a]:underline",
                "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4",
              )}
              dangerouslySetInnerHTML={{ __html: row.bodyHtml }}
            />
          )}
        </div>

        {/* C.3.6 Image gallery — up to 5 thumbnails, click → Dialog lightbox */}
        {row.imageUrls.length > 0 && (
          <KudoGallery imageUrls={row.imageUrls} altPrefix={row.title} />
        )}

        {/*
         * C.3.7 Hashtag pills — Figma: Montserrat 16 bold, color #D4271D,
         * row gap ~29.9px, max 5 visible + "…" overflow indicator.
         */}
        {visibleHashtags.length > 0 && (
          <div className="flex flex-row flex-wrap items-center gap-[29.9px]">
            {visibleHashtags.map((slug) => (
              <span
                key={slug}
                className="text-base font-bold leading-6 text-[#D4271D] tracking-[0.5px]"
              >
                {hashtagLabel(slug)}
              </span>
            ))}
            {hasMoreHashtags && (
              <span className="text-base font-bold leading-6 text-[#D4271D] tracking-[0.5px]">
                …
              </span>
            )}
          </div>
        )}
      </div>

      {/* Rectangle 15 — gold divider */}
      <hr className="border-[#FFEA9E]" />

      {/* C.4 Action bar — Figma: row, space-between, gap-6, height 56px */}
      <div className="flex flex-row items-center justify-between gap-6">
        {/*
         * C.4.1 Hearts — Figma: count 24px bold left + 32px heart icon right, gap-1.
         * Gray (#00101A) when not hearted, red (#CF1322) when hearted.
         */}
        <Button
          variant="text"
          onClick={handleHeart}
          aria-label={t("kudosFeed.heart")}
          aria-pressed={hearted}
          rightIcon={<HeartIcon className="size-8 [&_path]:fill-current" />}
          className={cn(
            "gap-1 px-0 text-2xl font-bold leading-8 tabular-nums transition-colors",
            hearted ? "text-[#CF1322]" : "text-[#00101A]",
          )}
        >
          {heartCount.toLocaleString()}
        </Button>

        {/* C.4.2 Copy Link — shared Button, text variant + link icon */}
        <Button
          variant="text"
          onClick={handleCopyLink}
          aria-label={t("kudosBoard.copyLink")}
          rightIcon={<LinkIcon />}
          className="text-secondary"
        >
          {copied ? t("kudosBoard.copyLinkToast") : t("kudosBoard.copyLink")}
        </Button>
      </div>
    </article>
  );
}
