"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { ChevronDownIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KudoFeedRow } from "@/lib/kudos/types";
import type { ProfileFeedMode } from "@/lib/profile/types";
import { KudoCard } from "@/app/(site)/kudos/_components/kudo-card";

interface ProfileFeedProps {
  profileId: string;
  kudos: KudoFeedRow[];
  mode: ProfileFeedMode;
  isOwner: boolean;
  sentCount: number;
  receivedCount: number;
}

/** Owner-only sent/received dropdown — drives a server re-query via ?mode= URL param. */
function FeedToggle({
  profileId,
  mode,
  sentCount,
  receivedCount,
}: Pick<ProfileFeedProps, "profileId" | "mode" | "sentCount" | "receivedCount">) {
  const { t } = useTranslations();
  const current =
    mode === "sent"
      ? `${t("profile.tabSent")} (${sentCount})`
      : `${t("profile.tabReceived")} (${receivedCount})`;

  const item = (m: ProfileFeedMode, label: string, count: number) => (
    <DropdownMenuItem asChild>
      <Link href={`/profile/${profileId}?mode=${m}`} scroll={false} className="cursor-pointer">
        {label} ({count})
      </Link>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-14 items-center gap-2 rounded-lg border border-primary/30 px-5 font-[Montserrat] text-base font-bold text-white outline-none">
        {current}
        <ChevronDownIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {item("received", t("profile.tabReceived"), receivedCount)}
        {item("sent", t("profile.tabSent"), sentCount)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Profile kudos feed (Figma C/D): "Sun* Annual Awards 2025" / "KUDOS" header with
 * the owner sent/received toggle (or a received-count label for other profiles),
 * then the capped list of kudo cards.
 */
export function ProfileFeed({
  profileId,
  kudos,
  mode,
  isOwner,
  sentCount,
  receivedCount,
}: ProfileFeedProps) {
  const { t } = useTranslations();
  const emptyLabel = mode === "sent" ? t("profile.emptySent") : t("profile.emptyReceived");

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-primary/30 pb-4">
        <p className="font-[Montserrat] text-base font-bold text-white">
          {t("profile.awardsTitle")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            className="font-[Montserrat] text-[40px] font-bold leading-none text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {t("profile.kudos")}
          </h2>
          {isOwner ? (
            <FeedToggle
              profileId={profileId}
              mode={mode}
              sentCount={sentCount}
              receivedCount={receivedCount}
            />
          ) : (
            <span className="font-[Montserrat] text-lg font-bold text-white">
              {t("profile.receivedCount").replace("{count}", String(receivedCount))}
            </span>
          )}
        </div>
      </div>

      {kudos.length === 0 ? (
        <p className="py-12 text-center font-[Montserrat] text-base text-white/60">
          {emptyLabel}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {kudos.map((row) => (
            <KudoCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </section>
  );
}
