"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { hashtagLabel } from "@/lib/kudos/hashtags";
import { toggleReaction } from "@/lib/kudos/actions";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { KudoFeedRow } from "@/lib/kudos/types";
import { KudoCardHeader } from "./kudo-card-header";

interface Props {
  row: KudoFeedRow;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

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
    // Optimistic update
    setHearted(next);
    setHeartCount((c) => c + (next ? 1 : -1));
    setPending(true);

    const result = await toggleReaction(row.id);
    if ("error" in result) {
      // Roll back on failure
      setHearted(!next);
      setHeartCount((c) => c + (next ? -1 : 1));
    } else {
      // Reconcile with the server's truth
      setHearted(result.reacted);
    }
    setPending(false);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/kudos/${row.id}`;
    navigator.clipboard.writeText(url).catch(() => {
      /* swallow clipboard errors in mock */
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article
      className="flex flex-col gap-4 rounded-2xl bg-[#FFF8E1] p-6 shadow-sm"
      aria-label={row.title}
    >
      {/* Header: sender → recipient + hero badge */}
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
      />

      {/* Divider */}
      <hr className="border-[#998C5F]/30" />

      {/* Title */}
      <h3 className="font-bold text-lg leading-snug text-[#00101A]">
        {row.title}
      </h3>

      {/* Body HTML — `body_html` is sanitized server-side in createKudo
          (DOMPurify allowlist) before it is ever stored, so it is safe to render. */}
      {row.bodyHtml && (
        <div
          className="text-sm leading-relaxed text-[#00101A]/80 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_a]:text-[#CF1322] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
          dangerouslySetInnerHTML={{ __html: row.bodyHtml }}
        />
      )}

      {/* Image strip */}
      {row.imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {row.imageUrls.map((url, i) => (
            <div
              key={url}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[#998C5F]/40"
            >
              <Image
                src={url}
                alt={`${row.title} image ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* Hashtags */}
      {row.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {row.hashtags.map((slug) => (
            <span
              key={slug}
              className="text-xs font-bold text-[#CF1322] uppercase tracking-wide"
            >
              {hashtagLabel(slug)}
            </span>
          ))}
        </div>
      )}

      {/* Footer: heart count + copy link */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleHeart}
          aria-label={t("kudosFeed.heart")}
          aria-pressed={hearted}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
            hearted
              ? "bg-[#CF1322]/10 text-[#CF1322]"
              : "text-[#998C5F] hover:bg-[#998C5F]/10"
          )}
        >
          <HeartIcon filled={hearted} />
          <span>{heartCount}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          aria-label={t("kudosFeed.copyLink")}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-[#998C5F] transition-colors hover:bg-[#998C5F]/10"
        >
          <LinkIcon />
          <span>{copied ? t("kudosFeed.copied") : t("kudosFeed.copyLink")}</span>
        </button>
      </div>
    </article>
  );
}
