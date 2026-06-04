"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import footerLogo from "@/assets/images/home/footer-logo.png";
import { Button } from "@/components/button";

export function SiteFooter() {
  const { t } = useTranslations();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="w-full border-t border-[#2E3940]">
      <div className="flex flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center sm:px-22.5 sm:py-10">
        {/* Left: logo + nav */}
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-20">
          {/* SAA Logo */}
          <Image
            src={footerLogo}
            alt="SAA 2025"
            width={69}
            height={64}
            className="h-16 w-auto shrink-0"
          />

          {/* Nav links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-2 sm:gap-0"
          >
            {/* About SAA 2025 — scroll to top */}
            <Button onClick={scrollToTop} variant="text">
              {t("home.footer.aboutSaa")}
            </Button>

            {/* Award Information — /awards */}
            <Button variant="text">
              <Link href="/awards">{t("home.footer.awardsInfo")}</Link>
            </Button>
            {/* Sun* Kudos — /kudos */}
            <Button variant="text">
              <Link href="/kudos">{t("home.footer.kudos")}</Link>
            </Button>

            {/* Community Standards — no route yet; real disabled control so AT
                announces it as unavailable. TODO: link when the route exists. */}
            <Button variant="text">
              <Link href="#">{t("home.footer.communityStandards")}</Link>
            </Button>
          </nav>
        </div>

        {/* Right: copyright */}
        <p className="shrink-0 text-base font-bold leading-6 text-white">
          {t("home.footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
