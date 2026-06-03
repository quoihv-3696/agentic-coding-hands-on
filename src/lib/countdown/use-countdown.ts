"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  /** True once the target time is reached (remaining time <= 0). */
  isComplete: boolean;
}

const ZERO: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  isComplete: false,
};

export function computeParts(targetMs: number, nowMs: number): CountdownParts {
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isComplete: true };
  }
  // Note: seconds are not displayed by design, so within the final minute the
  // display reads 00/00/00 until `diff` hits 0, at which point isComplete flips
  // and the page redirects. Redirect fires exactly at the target time, not early.
  const totalMinutes = Math.floor(diff / 60_000);
  const totalHours = Math.floor(totalMinutes / 60);
  return {
    days: Math.floor(totalHours / 24),
    hours: totalHours % 24,
    minutes: totalMinutes % 60,
    isComplete: false,
  };
}

/**
 * Live countdown to `target`, recomputed every second.
 *
 * Starts from a deterministic zero state so server and first client render match
 * (no hydration mismatch); the real remaining time is computed on mount.
 */
export function useCountdown(target: Date): CountdownParts {
  const targetMs = target.getTime();
  const [parts, setParts] = useState<CountdownParts>(ZERO);

  useEffect(() => {
    const tick = () => setParts(computeParts(targetMs, Date.now()));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetMs]);

  return parts;
}
