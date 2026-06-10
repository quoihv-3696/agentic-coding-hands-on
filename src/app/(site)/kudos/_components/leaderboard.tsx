"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeaderboardEntry } from "@/lib/kudos/types";

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  emptyLabel: string;
  onEntryClick?: (entry: LeaderboardEntry) => void;
}

interface LeaderboardEntryRowProps {
  entry: LeaderboardEntry;
  onClick?: (entry: LeaderboardEntry) => void;
}

function LeaderboardEntryRow({ entry, onClick }: LeaderboardEntryRowProps) {
  const initials = entry.displayName
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div
      className="flex w-full flex-row items-center gap-2"
      style={{ height: "64px" }}
    >
      {/* Avatar — 64px with white border per design */}
      <button
        type="button"
        className="shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label={entry.displayName}
        onClick={() => onClick?.(entry)}
      >
        <Avatar
          className="size-16 rounded-full"
          style={{ border: "1.869px solid #FFF" }}
        >
          <AvatarImage
            src={entry.avatarUrl ?? undefined}
            alt={entry.displayName}
          />
          <AvatarFallback
            className="text-sm font-bold"
            style={{
              backgroundColor: "rgba(46, 57, 64, 1)",
              color: "#FFEA9E",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Name + description */}
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <button
          type="button"
          className="cursor-pointer truncate text-left font-bold leading-[28px] hover:underline focus-visible:outline-none focus-visible:underline"
          style={{
            color: "#FFEA9E",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "22px",
          }}
          onClick={() => onClick?.(entry)}
        >
          {entry.displayName}
        </button>
        <span
          className="truncate leading-[24px]"
          style={{
            color: "#FFF",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "0.15px",
          }}
        >
          {entry.description}
        </span>
      </div>
    </div>
  );
}

export function Leaderboard({
  title,
  entries,
  emptyLabel,
  onEntryClick,
}: LeaderboardProps) {
  return (
    <div
      className="flex flex-col gap-[10px] rounded-[17px] px-4 py-6 pl-6"
      style={{
        background: "#00070C",
        border: "1px solid #998C5F",
        alignSelf: "stretch",
      }}
    >
      {/* Title */}
      <h3
        className="w-full text-center font-bold leading-[28px]"
        style={{
          color: "#FFEA9E",
          fontFamily: "Montserrat, sans-serif",
          fontSize: "22px",
        }}
      >
        {title}
      </h3>

      {/* Entry list or empty state */}
      {entries.length === 0 ? (
        <p
          className="py-4 text-center text-sm"
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Montserrat, sans-serif" }}
        >
          {emptyLabel}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <LeaderboardEntryRow
              key={entry.profileId}
              entry={entry}
              onClick={onEntryClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
