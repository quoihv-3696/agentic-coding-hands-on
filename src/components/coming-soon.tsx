"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";

/** Minimal public "coming soon" placeholder for not-yet-built pages. */
export function ComingSoon({ titleKey }: { titleKey: string }) {
  const { t } = useTranslations();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary px-6 text-center text-white">
      <h1 className="text-2xl font-bold sm:text-3xl">{t(titleKey)}</h1>
      <p className="text-base text-white/70">{t("comingSoon.message")}</p>
    </main>
  );
}
