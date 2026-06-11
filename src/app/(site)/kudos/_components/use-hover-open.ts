"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Controlled open-state for a hover-driven dropdown (used by the profile + tier
 * preview cards). Opening is immediate; closing is delayed so the cursor can
 * travel from the trigger into the card without it snapping shut.
 */
export function useHoverOpen(closeDelay = 150) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending close-timer on unmount so it can't fire setOpen on a
  // removed component (feed re-renders / realtime refresh while hovering).
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function cancelClose() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function openNow() {
    cancelClose();
    setOpen(true);
  }

  function scheduleClose() {
    cancelClose();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }

  return { open, setOpen, openNow, scheduleClose, cancelClose };
}
