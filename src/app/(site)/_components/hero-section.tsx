"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { UpIcon } from "@/components/icons";
import { HeroCountdown } from "@/components/countdown/hero-countdown";
import rootFurtherLogo from "@/assets/images/login/logo.png";
import { Button } from "@/components/button";

/**
 * Homepage hero content: the "ROOT FURTHER" wordmark, the live event countdown,
 * event details, and the two primary CTAs. Left-aligned over the dark side of
 * the page-level Key Visual (the background lives on the page, not here).
 */
export function HeroSection() {
  const { t } = useTranslations();

  return (
    <section className="flex flex-col items-start gap-10 pt-20 mx-auto max-w-306">
      <Image
        src={rootFurtherLogo}
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
        <Link href="/awards">
          <Button variant="primary" rightIcon={<UpIcon />}>
            {t("home.hero.ctaAwards")}
          </Button>
        </Link>
        <Link href="/kudos">
          <Button variant="secondary" rightIcon={<UpIcon />}>
            {t("home.hero.ctaKudos")}
          </Button>
        </Link>
      </div>
    </section>
  );
}
