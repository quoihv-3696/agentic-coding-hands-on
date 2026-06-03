"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { ArrowUpRightIcon } from "@/components/icons";
import { HeroCountdown } from "../countdown/hero-countdown";

/**
 * Homepage hero content: the "ROOT FURTHER" wordmark, the live event countdown,
 * event details, and the two primary CTAs. Left-aligned over the dark side of
 * the page-level Key Visual (the background lives on the page, not here).
 */
export function HeroSection() {
  const { t } = useTranslations();

  return (
    <section className="flex flex-col items-start gap-10 px-6 pb-24 pt-28 sm:px-10 lg:px-36 lg:pb-32 lg:pt-36">
      <Image
        src="/login/logo.png"
        alt={t("home.hero.title")}
        width={290}
        height={134}
        priority
        className="h-auto w-[clamp(13rem,22vw,18.125rem)]"
      />

      <HeroCountdown />

      {/* Event details */}
      <div className="space-y-1 text-white">
        <p>
          <span className="text-white/70">
            {t("home.hero.eventTimeLabel")}{" "}
          </span>
          <span className="font-semibold">{t("home.hero.eventTime")}</span>
        </p>
        <p>
          <span className="text-white/70">
            {t("home.hero.eventLocationLabel")}{" "}
          </span>
          <span className="font-semibold">{t("home.hero.eventLocation")}</span>
        </p>
        <p className="text-sm text-white/60">{t("home.hero.eventStream")}</p>
      </div>

      {/* CTAs — solid (awards) + outline (kudos), both rounded-8 with the arrow icon */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/awards"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 font-semibold text-[#00101A] transition-colors hover:bg-[#fff0bd]"
        >
          {t("home.hero.ctaAwards")}
          <ArrowUpRightIcon className="size-5" />
        </Link>
        <Link
          href="/kudos"
          className="inline-flex items-center gap-2 rounded-lg border border-[#FFEA9E] px-6 py-4 font-semibold text-[#FFEA9E] transition-colors hover:bg-[#FFEA9E] hover:text-[#00101A]"
        >
          {t("home.hero.ctaKudos")}
          <ArrowUpRightIcon className="size-5" />
        </Link>
      </div>
    </section>
  );
}
