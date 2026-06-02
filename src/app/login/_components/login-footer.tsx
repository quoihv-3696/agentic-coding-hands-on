"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";

export function LoginFooter() {
  const { t } = useTranslations();

  return (
    <footer className="relative z-10 border-t border-white/15 py-5 text-center">
      <p className="text-sm font-semibold text-white/90">{t("login.footer")}</p>
    </footer>
  );
}
