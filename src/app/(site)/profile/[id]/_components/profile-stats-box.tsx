"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import type { StatsSummary } from "@/lib/kudos/types";
import { SecretBoxStub } from "@/components/kudos/secret-box-stub";

interface ProfileStatsBoxProps {
  stats: StatsSummary;
}

function StatRow({ label, value }: { label: string; value: number }) {
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
        {value.toLocaleString()}
      </span>
    </div>
  );
}

/**
 * Owner-only stats box (Figma B_Thống kê): Kudos received/sent, hearts, and the
 * Secret Box counters (stubbed to 0) + the "Mở Secret Box" coming-soon button.
 */
export function ProfileStatsBox({ stats }: ProfileStatsBoxProps) {
  const { t } = useTranslations();

  return (
    <div
      className="flex w-full flex-col gap-5 rounded-2xl p-8"
      style={{ border: "1px solid rgba(255,234,158,0.4)", background: "#00101A" }}
    >
      <StatRow label={t("profile.stats.received")} value={stats.kudosReceived} />
      <StatRow label={t("profile.stats.sent")} value={stats.kudosSent} />
      <StatRow label={t("profile.stats.hearts")} value={stats.heartsReceived} />
      <StatRow label={t("profile.stats.boxOpened")} value={stats.secretBoxOpened} />
      <StatRow label={t("profile.stats.boxUnopened")} value={stats.secretBoxUnopened} />
      <SecretBoxStub label={t("profile.openSecretBox")} />
    </div>
  );
}
