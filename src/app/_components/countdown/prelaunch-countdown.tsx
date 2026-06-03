"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { CountdownTimer } from "./countdown-timer";
import {
  COUNTDOWN_TARGET_DATE,
  COUNTDOWN_REDIRECT_PATH,
} from "@/lib/countdown/config";

/** The /countdown prelaunch timer: redirects to the configured path at zero. */
export function PrelaunchCountdown() {
  const router = useRouter();
  const onComplete = useCallback(
    () => router.replace(COUNTDOWN_REDIRECT_PATH),
    [router],
  );

  return <CountdownTimer target={COUNTDOWN_TARGET_DATE} onComplete={onComplete} />;
}
