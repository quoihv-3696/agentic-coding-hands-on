import type { HeroTier, StarCount } from "@/lib/kudos/types";

/** Profile summary for the hover-preview card on the Kudos Live Board. */
export interface ProfileSummary {
  profileId: string;
  displayName: string;
  unit: string | null;
  avatarUrl: string | null;
  heroTier: HeroTier | null;
  kudosReceived: number;
  kudosSent: number;
}

/** Full profile header data for a profile page (own or other). */
export interface ProfileDetail {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  deptCode: string | null;
  heroTier: HeroTier;
  starCount: StarCount;
  receivedKudosCount: number;
}

/** Which feed a profile page shows: kudos the profile received or sent. */
export type ProfileFeedMode = "received" | "sent";
