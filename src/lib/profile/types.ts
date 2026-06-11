import type { HeroTier } from "@/lib/kudos/types";

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
