"use client";

import Image from "next/image";
import heroBg from "@/assets/images/home/hero-bg.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { HeroTier, StarCount } from "@/lib/kudos/types";
import { TierBadge } from "@/components/kudos/tier-badge";

interface ProfileHeroProps {
  displayName: string;
  deptCode: string | null;
  avatarUrl: string | null;
  heroTier: HeroTier;
  starCount: StarCount;
}

/** Initials fallback when a profile has no avatar image. */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Profile header: full-width keyvisual banner with a centered circular avatar
 * overlapping its bottom edge, then name + department + Hero-tier badge.
 * Shared by own and other profile screens (Figma A_info user).
 */
export function ProfileHero({
  displayName,
  deptCode,
  avatarUrl,
  heroTier,
}: ProfileHeroProps) {
  return (
    <header className="relative flex flex-col items-center">
      {/* Keyvisual banner — same feather artwork as the homepage / Kudos board */}
      <div className="relative h-128 w-full overflow-hidden">
        <Image
          src={heroBg}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/*
         * Cover overlay (Figma "Cover"): vertical linear gradient #001320 → #00101A
         * so the artwork shows up top and fades to the page bg at the bottom where
         * the avatar overhangs.
         */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,19,32,0) 0%, rgba(0,19,32,0.55) 55%, #00101A 100%)",
          }}
        />
      </div>

      {/* Avatar + name cluster, anchored 40px above the banner's bottom edge */}
      <div className="absolute inset-x-0 bottom-10 z-10 flex flex-col items-center">
        <Avatar className="z-10 size-50 border-4 border-white bg-secondary">
          <AvatarImage
            src={avatarUrl ?? undefined}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="font-[Montserrat] text-5xl font-bold text-primary">
            {initialsOf(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Name + dept + tier — below the avatar */}
        <div className="mt-6 flex flex-col items-center gap-2 px-4 text-center">
          <h1
            className="font-[Montserrat] text-[36px] font-bold leading-11 text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {displayName}
          </h1>
          <div className="flex items-center gap-2">
            {deptCode && (
              <span className="font-[Montserrat] text-base font-bold leading-7 text-white">
                {deptCode}
              </span>
            )}
            <TierBadge tier={heroTier} />
          </div>
        </div>
      </div>
    </header>
  );
}
