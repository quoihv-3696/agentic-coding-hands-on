"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";

/**
 * Page title block for /awards.
 * Small subheading (white/60) above a large gold H1.
 * Matches design: subheading centered text-2xl, H1 57px centered.
 */
export function AwardsTitle() {
  const { t } = useTranslations();

  return (
    <header className="mx-auto max-w-306 space-y-2 text-center">
      <p className="text-xl font-bold text-white/90 sm:text-2xl">
        {t("awardsPage.subheading")}
      </p>
      <div className="h-px w-full bg-[#2E3940]" />
      <h1
        className="font-bold text-primary"
        style={{ fontSize: "clamp(2rem, 5vw, 57px)", lineHeight: "1.15", letterSpacing: "-0.25px" }}
      >
        {t("awardsPage.heading")}
      </h1>
    </header>
  );
}
