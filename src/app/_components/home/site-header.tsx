"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { BellIcon, UserIcon, ChevronDownIcon } from "@/components/icons";

type NavKey = "about" | "awards" | "kudos";

const NAV: { key: NavKey; labelKey: string; href: string }[] = [
  { key: "about", labelKey: "home.header.aboutSaa", href: "/" },
  { key: "awards", labelKey: "home.header.awardsInfo", href: "/awards" },
  { key: "kudos", labelKey: "home.header.kudos", href: "/kudos" },
];

/**
 * Sticky homepage header: logo + primary nav + right-hand controls.
 * Auth-aware controls (bell, account) show only when `authed`. Dropdown/menu
 * behaviour is wired in a later phase; this is the presentational shell.
 */
export function SiteHeader({
  authed = false,
  activeNav = "about",
}: {
  authed?: boolean;
  activeNav?: NavKey;
}) {
  const { t, locale } = useTranslations();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between bg-[#101417]/80 px-6 backdrop-blur-md sm:px-10 lg:px-36">
      {/* Left: logo + primary nav */}
      <div className="flex items-center gap-8 lg:gap-16">
        <Link href="/" aria-label="SAA 2025" className="shrink-0">
          <Image src="/saa-logo.svg" alt="SAA 2025" width={52} height={56} priority />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(({ key, labelKey, href }) => {
            const active = key === activeNav;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "font-semibold text-[#FFD466] underline underline-offset-8"
                    : "font-medium text-white/90 transition-colors hover:text-white"
                }
              >
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {authed && (
          <button
            type="button"
            aria-label={t("home.header.notifications")}
            className="relative grid size-10 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/10"
          >
            <BellIcon className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
          </button>
        )}
        <button
          type="button"
          className="flex items-center gap-1 rounded-full px-2 py-1 font-medium text-white/90 transition-colors hover:bg-white/10"
        >
          {t(locale === "en" ? "language.en" : "language.vn")}
          <ChevronDownIcon className="size-4" />
        </button>
        {authed && (
          <button
            type="button"
            aria-label={t("home.header.account")}
            className="grid size-10 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/10"
          >
            <UserIcon className="size-5" />
          </button>
        )}
      </div>
    </header>
  );
}
