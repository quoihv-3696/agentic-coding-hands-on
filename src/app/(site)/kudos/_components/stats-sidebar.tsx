"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import { Separator } from "@/components/ui/separator";
import { SecretBoxStub } from "./secret-box-stub";
import { Leaderboard } from "./leaderboard";
import type { StatsSummary, LeaderboardEntry } from "@/lib/kudos/types";

interface StatsSidebarProps {
  stats: StatsSummary;
  promotions: LeaderboardEntry[];
  gifts: LeaderboardEntry[];
}

interface StatRowProps {
  label: string;
  value: number;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-2">
      <span
        className="flex-1 text-left font-[Montserrat] text-[22px] font-bold leading-[28px] text-white"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {label}
      </span>
      <span
        className="font-[Montserrat] text-[32px] font-bold leading-[40px]"
        style={{ color: "#FFEA9E", fontFamily: "Montserrat, sans-serif" }}
      >
        {value}
      </span>
    </div>
  );
}

export function StatsSidebar({ stats, promotions, gifts }: StatsSidebarProps) {
  const { t } = useTranslations();

  return (
    <aside className="flex w-full max-w-105.5 shrink-0 flex-col gap-6">
      {/* D.1 Stats block */}
      <div
        className="flex flex-col gap-2.5 rounded-[17px] p-6"
        style={{
          background: "#00070C",
          border: "1px solid #998C5F",
        }}
      >
        <div className="flex flex-col gap-4">
          <StatRow
            label={t("kudosBoard.stats.received")}
            value={stats.kudosReceived}
          />
          <StatRow label={t("kudosBoard.stats.sent")} value={stats.kudosSent} />
          <StatRow
            label={t("kudosBoard.stats.hearts")}
            value={stats.heartsReceived}
          />

          {/* D.1.5 Divider */}
          <Separator
            className="w-full"
            style={{ backgroundColor: "rgba(46, 57, 64, 1)", height: "1px" }}
          />

          <StatRow
            label={t("kudosBoard.stats.boxOpened")}
            value={stats.secretBoxOpened}
          />
          <StatRow
            label={t("kudosBoard.stats.boxUnopened")}
            value={stats.secretBoxUnopened}
          />

          {/* D.1.8 Secret Box button */}
          <SecretBoxStub label={t("kudosBoard.stats.openGift")} />
        </div>
      </div>

      {/* D.3 Leaderboard: gifts */}
      <Leaderboard
        title={t("kudosBoard.leaderboard.gifts")}
        entries={gifts}
        emptyLabel={t("kudosBoard.leaderboard.empty")}
      />

      {/* Promotions leaderboard — renders below gifts per design */}
      {/* <Leaderboard
        title={t("kudosBoard.leaderboard.promotions")}
        entries={promotions}
        emptyLabel={t("kudosBoard.leaderboard.empty")}
      /> */}
    </aside>
  );
}
