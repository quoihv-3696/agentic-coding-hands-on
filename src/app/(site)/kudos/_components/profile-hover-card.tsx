"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { fetchProfileSummary } from "@/lib/profile/actions";
import type { ProfileSummary } from "@/lib/profile/types";
import { Button } from "@/components/button";
import { PenIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TierBadge } from "@/components/kudos/tier-badge";
import { useKudosComposer } from "./kudos-composer";
import { useHoverOpen } from "./use-hover-open";

interface ProfileHoverCardProps {
  profileId: string;
  children: React.ReactNode;
}

/**
 * Wraps any avatar trigger so hovering opens a dark preview card with the
 * person's name, unit, hero tier, Kudos counts, and a "Gửi KUDO" button.
 *
 * Uses DropdownMenu (Radix) in controlled mode so it responds to both hover
 * (desktop) and click/tap (mobile/keyboard). A 150ms delay timer shared between
 * the trigger and the content prevents the card from closing when the cursor
 * moves from avatar into the card.
 */
export function ProfileHoverCard({
  profileId,
  children,
}: ProfileHoverCardProps) {
  const { t } = useTranslations();
  const composer = useKudosComposer();

  const { open, setOpen, openNow, scheduleClose, cancelClose } = useHoverOpen();
  const [summary, setSummary] = useState<ProfileSummary | null | "loading">(
    null,
  );

  // Lazy-fetch the summary once, cached in state. Called from BOTH hover and
  // click/tap/keyboard opens so the card is never stuck on the skeleton.
  async function ensureSummary() {
    if (summary === null) {
      setSummary("loading");
      setSummary(await fetchProfileSummary(profileId));
    }
  }

  function handleHoverOpen() {
    openNow();
    void ensureSummary();
  }

  function handleSendKudo() {
    setOpen(false);
    // Pass the resolved name so the form's recipient field shows it, not just the id.
    const name =
      summary && summary !== "loading" ? summary.displayName : undefined;
    composer.open(profileId, name);
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Click/tap/keyboard opens go through onOpenChange, not onMouseEnter.
        if (next) void ensureSummary();
      }}
    >
      <DropdownMenuTrigger
        asChild
        onMouseEnter={handleHoverOpen}
        onMouseLeave={scheduleClose}
        // Hover opens the preview; a click should NAVIGATE to the profile, not
        // toggle the menu. preventDefault on pointerdown stops Radix's open-on-click
        // while leaving the anchor's click navigation intact.
        onPointerDown={(e) => e.preventDefault()}
      >
        {/* asChild passes hover events to the Link; clicking it navigates. */}
        <Link href={`/profile/${profileId}`} className="inline-flex">
          {children}
        </Link>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        // `!w-80` overrides the shadcn default `w-(--radix-dropdown-menu-trigger-width)`
        // which would otherwise lock the card to the avatar's tiny width.
        // `!max-h-none` removes the viewport-height cap so the button isn't squashed.
        className="w-80! max-h-none! p-5 rounded-2xl bg-[#00070C] border border-[#998C5F] shadow-2xl"
      >
        {summary === "loading" || summary === null ? (
          <CardSkeleton />
        ) : (
          <CardContent
            summary={summary}
            profileId={profileId}
            t={t}
            onSendKudo={handleSendKudo}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Internal sub-components ────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="h-4 w-1/2 rounded bg-white/10" />
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="h-10 w-full rounded bg-white/10" />
    </div>
  );
}

interface CardContentProps {
  summary: ProfileSummary;
  profileId: string;
  t: (key: string) => string;
  onSendKudo: () => void;
}

function CardContent({ summary, profileId, t, onSendKudo }: CardContentProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 1. Name — links to the person's profile page */}
      <Link
        href={`/profile/${profileId}`}
        className="text-[18px] font-bold leading-snug text-primary truncate hover:underline"
      >
        {summary.displayName}
      </Link>

      {/* 2. Unit line */}
      {summary.unit && (
        <p className="text-[13px] leading-5 text-secondary-2">
          <span className="font-bold">{t("kudosHoverCard.unit")}:</span>{" "}
          {summary.unit}
        </p>
      )}

      {/* 3. Hero tier badge */}
      {summary.heroTier && <TierBadge tier={summary.heroTier} />}

      {/* 4. Kudos received */}
      <p className="text-sm font-bold text-white leading-5">
        {t("kudosHoverCard.received")}:{" "}
        <span className="font-bold">
          {summary.kudosReceived.toLocaleString()}
        </span>
      </p>

      {/* 5. Kudos sent */}
      <p className="text-sm font-bold text-white leading-5">
        {t("kudosHoverCard.sent")}:{" "}
        <span className="font-bold">{summary.kudosSent.toLocaleString()}</span>
      </p>

      {/* 6. Send KUDO button */}
      <Button
        variant="primary"
        className="w-full h-10 justify-center mt-1"
        leftIcon={<PenIcon className="size-4" />}
        onClick={onSendKudo}
      >
        {t("kudosHoverCard.send")}
      </Button>
    </div>
  );
}
