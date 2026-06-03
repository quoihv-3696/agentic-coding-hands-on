"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import { useCountdown } from "@/lib/countdown/use-countdown";
import { parseEventDateTime } from "@/lib/countdown/config";
import { CountdownUnits } from "./countdown-units";

// Resolved once from the build-time env var. Missing/invalid -> null (static
// 00/00/00 fallback, no crash, no redirect).
const EVENT_TARGET = parseEventDateTime(process.env.NEXT_PUBLIC_EVENT_DATETIME);

/**
 * Homepage hero countdown. Shows a "Coming soon" label above the timer until the
 * event start time is reached, then hides the label and holds at 00/00/00.
 * Unlike the /countdown page, it never redirects.
 */
export function HeroCountdown() {
  const { t } = useTranslations();
  const { days, hours, minutes, isComplete } = useCountdown(EVENT_TARGET);

  return (
    <div className="flex flex-col items-start gap-[clamp(1rem,1.6vw,1.5rem)]">
      {!isComplete && (
        <p className="text-[clamp(1rem,2vw,1.5rem)] font-medium text-white">
          {t("home.hero.comingSoon")}
        </p>
      )}
      <CountdownUnits days={days} hours={hours} minutes={minutes} />
    </div>
  );
}
