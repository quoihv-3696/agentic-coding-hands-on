"use server";

import { getProfileSummary } from "./queries";
import type { ProfileSummary } from "./types";

/**
 * Server action: fetch profile summary for the hover-preview card.
 * Called client-side on first hover open (lazy, cached in component state).
 */
export async function fetchProfileSummary(
  profileId: string,
): Promise<ProfileSummary | null> {
  return getProfileSummary(profileId);
}
