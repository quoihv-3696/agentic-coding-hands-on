"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import { LogoutButton } from "./logout-button";

export function HomeView({ email }: { email: string }) {
  const { t } = useTranslations();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-[#0c1018] px-8 text-center text-white">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("home.greeting")}
      </h1>
      <p className="text-base text-white/70">
        {t("home.loggedInAs")}{" "}
        <strong className="font-semibold text-white">{email}</strong>
      </p>
      <LogoutButton />
    </main>
  );
}
