import { notFound } from "next/navigation";
import {
  getProfileById,
  getProfileStats,
  getProfileKudos,
  isOwnProfile,
} from "@/lib/profile/page-queries";
import type { ProfileFeedMode } from "@/lib/profile/types";
import { ProfileSections } from "./_components/profile-sections";

/**
 * Profile page (own or other). One route serves both: `isOwnProfile` decides
 * owner-only blocks. The sent/received feed is driven by the `?mode=` param
 * (owner only — other profiles are always received).
 */
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode: modeParam } = await searchParams;

  const profile = await getProfileById(id);
  if (!profile) notFound();

  const isOwner = await isOwnProfile(id);
  // Only the owner may switch to the "sent" feed; others always see "received".
  const mode: ProfileFeedMode =
    isOwner && modeParam === "sent" ? "sent" : "received";

  const [stats, kudos] = await Promise.all([
    getProfileStats(id),
    getProfileKudos(id, mode),
  ]);

  return (
    <ProfileSections
      profile={profile}
      stats={stats}
      kudos={kudos}
      mode={mode}
      isOwner={isOwner}
    />
  );
}
