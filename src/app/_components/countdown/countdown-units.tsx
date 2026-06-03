"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import { CountdownUnit } from "./countdown-unit";

/** The Days / Hours / Minutes row, shared by every countdown variant. */
export function CountdownUnits({
  days,
  hours,
  minutes,
}: {
  days: number;
  hours: number;
  minutes: number;
}) {
  const { t } = useTranslations();
  return (
    <div className="flex items-start gap-[clamp(1.5rem,4vw,3.75rem)]">
      <CountdownUnit value={days} max={99} label={t("countdown.days")} />
      <CountdownUnit value={hours} max={23} label={t("countdown.hours")} />
      <CountdownUnit value={minutes} max={59} label={t("countdown.minutes")} />
    </div>
  );
}
