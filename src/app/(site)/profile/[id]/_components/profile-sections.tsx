import type { KudoFeedRow, StatsSummary } from "@/lib/kudos/types";
import type { ProfileDetail, ProfileFeedMode } from "@/lib/profile/types";
import { KudosComposerProvider } from "@/app/(site)/kudos/_components/kudos-composer";
import { ProfileHero } from "./profile-hero";
import { ProfileCollectibles } from "./profile-collectibles";
import { ProfileStatsBox } from "./profile-stats-box";
import { ProfileSendCta } from "./profile-send-cta";
import { ProfileFeed } from "./profile-feed";

interface ProfileSectionsProps {
  profile: ProfileDetail;
  stats: StatsSummary;
  kudos: KudoFeedRow[];
  mode: ProfileFeedMode;
  isOwner: boolean;
}

/**
 * Single shared section tree for both profile screens. Owner-only blocks (stats
 * box, sent/received toggle) are gated by `isOwner`; other profiles get the
 * "send kudos" CTA instead of the stats box (per clarifications).
 */
export function ProfileSections({
  profile,
  stats,
  kudos,
  mode,
  isOwner,
}: ProfileSectionsProps) {
  return (
    // One composer provider for the whole page: the feed's KudoCard hover cards
    // AND the other-profile send CTA both call useKudosComposer (mirrors LiveBoard).
    <KudosComposerProvider>
      <main className="flex flex-col pb-20">
        <ProfileHero
          displayName={profile.displayName}
          deptCode={profile.deptCode}
          avatarUrl={profile.avatarUrl}
          heroTier={profile.heroTier}
          starCount={profile.starCount}
        />

        <div className="mx-auto flex w-full max-w-170 flex-col gap-10 px-4">
          <ProfileCollectibles displayName={profile.displayName} isOwner={isOwner} />

          {isOwner ? (
            <ProfileStatsBox stats={stats} />
          ) : (
            <ProfileSendCta
              recipientProfileId={profile.profileId}
              recipientName={profile.displayName}
            />
          )}

          <ProfileFeed
            profileId={profile.profileId}
            kudos={kudos}
            mode={mode}
            isOwner={isOwner}
            sentCount={stats.kudosSent}
            receivedCount={stats.kudosReceived}
          />
        </div>
      </main>
    </KudosComposerProvider>
  );
}
