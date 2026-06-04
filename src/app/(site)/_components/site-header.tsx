"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { BellIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AccountMenu } from "./account-menu";
import saaLogo from "@/assets/images/saa-logo.svg";

type NavKey = "about" | "awards" | "kudos";

const NAV: { key: NavKey; labelKey: string; href: string }[] = [
  { key: "about", labelKey: "home.header.aboutSaa", href: "/" },
  { key: "awards", labelKey: "home.header.awardsInfo", href: "/awards" },
  { key: "kudos", labelKey: "home.header.kudos", href: "/kudos" },
];

/**
 * Shared sticky site header: logo + primary nav + right-hand controls.
 * Rendered once by the (site) layout, so it persists across `/`, `/awards`
 * and `/kudos`; the active nav item is derived from the current pathname.
 * Auth-aware controls (bell, account) show only when `authed`.
 */
export function SiteHeader({
  authed = false,
  isAdmin = false,
}: {
  authed?: boolean;
  isAdmin?: boolean;
}) {
  const { t } = useTranslations();
  const pathname = usePathname();
  const activeKey = NAV.find((n) =>
    n.href === "/" ? pathname === "/" : pathname.startsWith(n.href),
  )?.key;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between bg-[#101417]/80 px-6 backdrop-blur-md sm:px-10 lg:px-36">
      {/* Left: logo + primary nav */}
      <div className="flex items-center gap-8 lg:gap-16">
        <Link href="/" aria-label="SAA 2025" className="shrink-0">
          <Image src={saaLogo} alt="SAA 2025" width={52} height={56} priority />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(({ key, labelKey, href }) => {
            const active = key === activeKey;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "font-semibold text-primary underline underline-offset-8"
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
        <LanguageSwitcher />
        {authed && <AccountMenu isAdmin={isAdmin} />}
      </div>
    </header>
  );
}
