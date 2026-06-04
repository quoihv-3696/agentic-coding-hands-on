"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { useCountdown } from "@/lib/countdown/use-countdown";
import { CountdownUnits } from "./countdown-units";

/**
 * Live countdown: a title above the Days/Hours/Minutes units. Behaviour at zero
 * is caller-driven via `onComplete` (fired once), keeping this component free of
 * any routing/redirect concerns.
 */
export function CountdownTimer({
  target,
  onComplete,
  titleKey = "countdown.title",
}: {
  target: Date | null;
  onComplete?: () => void;
  titleKey?: string;
}) {
  const { t } = useTranslations();
  const { days, hours, minutes, isComplete } = useCountdown(target);
  const fired = useRef(false);

  useEffect(() => {
    if (isComplete && !fired.current) {
      fired.current = true;
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="flex flex-col items-center gap-[clamp(1rem,1.6vw,1.5rem)] text-center">
      <h1 className="text-[clamp(1.25rem,2.4vw,2.25rem)] font-bold leading-tight text-white">
        {t(titleKey)}
      </h1>
      <CountdownUnits days={days} hours={hours} minutes={minutes} />
    </div>
  );
}
