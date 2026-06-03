"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { useCountdown } from "@/lib/countdown/use-countdown";
import {
  COUNTDOWN_TARGET_DATE,
  COUNTDOWN_REDIRECT_PATH,
} from "@/lib/countdown/config";
import { CountdownUnit } from "./countdown-unit";

/** Live prelaunch countdown: title + Days/Hours/Minutes, redirects on completion. */
export function CountdownTimer() {
  const { t } = useTranslations();
  const router = useRouter();
  const { days, hours, minutes, isComplete } = useCountdown(
    COUNTDOWN_TARGET_DATE,
  );

  useEffect(() => {
    if (isComplete) {
      router.replace(COUNTDOWN_REDIRECT_PATH);
    }
  }, [isComplete, router]);

  return (
    <div className="flex flex-col items-center gap-[clamp(1rem,1.6vw,1.5rem)] text-center">
      <h1 className="text-[clamp(1.25rem,2.4vw,2.25rem)] font-bold leading-tight text-white">
        {t("countdown.title")}
      </h1>
      <div className="flex items-start gap-[clamp(1.5rem,4vw,3.75rem)]">
        <CountdownUnit value={days} max={99} label={t("countdown.days")} />
        <CountdownUnit value={hours} max={23} label={t("countdown.hours")} />
        <CountdownUnit value={minutes} max={59} label={t("countdown.minutes")} />
      </div>
    </div>
  );
}
