"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { UpIcon } from "@/components/icons";
import { AWARD_CATEGORIES, awardHref } from "@/lib/awards/categories";
import topTalent from "@/assets/images/home/awards/top-talent.png";
import topProject from "@/assets/images/home/awards/top-project.png";
import topProjectLeader from "@/assets/images/home/awards/top-project-leader.png";
import bestManager from "@/assets/images/home/awards/best-manager.png";
import signature2025Creator from "@/assets/images/home/awards/signature-2025-creator.png";
import mvp from "@/assets/images/home/awards/mvp.png";
import { Button } from "@/components/button";
import { Separator } from "@/components/ui/separator";

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
    <section className="">
      <div className="mx-auto max-w-306">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-white/60">
            {t("home.awards.sectionLabel")}
          </p>
          <Separator className="w-full bg-white/20" />
          <h2 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
            {t("home.awards.sectionTitle")}
          </h2>
        </div>

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

              <div className="px-2">
                <h3 className="text-2xl text-primary">{t(c.titleKey)}</h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-white/60">
                  {t(c.descKey)}
                </p>
                <Button
                  variant="text"
                  className="w-fit p-0"
                  rightIcon={<UpIcon />}
                >
                  {t("home.awards.detail")}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
