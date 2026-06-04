"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import footerLogo from "@/assets/images/home/footer-logo.png";

export function SiteFooter() {
  const { t } = useTranslations();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="w-full" style={{ borderTop: "1px solid #2E3940" }}>
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
            <button
              onClick={scrollToTop}
              className="px-4 py-4 text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors hover:text-[#FFEA9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]"
            >
              {t("home.footer.aboutSaa")}
            </button>

            {/* Award Information — /awards */}
            <Link
              href="/awards"
              className="px-4 py-4 text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors hover:text-[#FFEA9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]"
              style={{
                backgroundColor: "rgba(255, 234, 158, 0.10)",
                textShadow: "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287",
              }}
            >
              {t("home.footer.awardsInfo")}
            </Link>

            {/* Sun* Kudos — /kudos */}
            <Link
              href="/kudos"
              className="px-4 py-4 text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors hover:text-[#FFEA9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]"
            >
              {t("home.footer.kudos")}
            </Link>

            {/* Community Standards — no route yet */}
            {/* TODO: route when built */}
            <span
              className="cursor-default px-4 py-4 text-base font-bold leading-6 tracking-[0.15px] text-white/50 select-none"
              aria-disabled="true"
            >
              {t("home.footer.communityStandards")}
            </span>
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
