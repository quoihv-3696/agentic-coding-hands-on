"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { ArrowUpRightIcon } from "@/components/icons";
import { AWARD_CATEGORIES, awardHref } from "@/lib/awards/categories";
import topTalent from "@/assets/images/home/awards/top-talent.png";
import topProject from "@/assets/images/home/awards/top-project.png";
import topProjectLeader from "@/assets/images/home/awards/top-project-leader.png";
import bestManager from "@/assets/images/home/awards/best-manager.png";
import signature2025Creator from "@/assets/images/home/awards/signature-2025-creator.png";
import mvp from "@/assets/images/home/awards/mvp.png";

/** Award graphic keyed by category slug. */
const AWARD_IMAGES: Record<string, StaticImageData> = {
  "top-talent": topTalent,
  "top-project": topProject,
  "top-project-leader": topProjectLeader,
  "best-manager": bestManager,
  "signature-2025-creator": signature2025Creator,
  mvp,
};

/**
 * "Hệ thống giải thưởng" — section header + a responsive grid of award category
 * cards (3 columns desktop, 2 columns tablet/mobile). Each card is a single link
 * to /awards#<slug>; the thumbnail is the full award graphic (glowing ring +
 * name + glow baked into the asset).
 */
export function AwardsSection() {
  const { t } = useTranslations();

  return (
    <section className="px-6 py-20 sm:px-10 lg:px-36 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-wide text-white/60">
          {t("home.awards.sectionLabel")}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[#FFD466] sm:text-4xl">
          {t("home.awards.sectionTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-white/70">
          {t("home.awards.sectionDesc")}
        </p>

        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-6">
          {AWARD_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={awardHref(c.slug)}
              className="group flex flex-col gap-4 rounded-2xl p-4 transition duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-square">
                <Image
                  src={AWARD_IMAGES[c.slug]}
                  alt=""
                  aria-hidden
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 1024px) 45vw, 30vw"
                />
              </div>

              <h3 className="text-lg font-bold text-white">{t(c.titleKey)}</h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-white/60">
                {t(c.descKey)}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FFD466]">
                {t("home.awards.detail")}
                <ArrowUpRightIcon className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
