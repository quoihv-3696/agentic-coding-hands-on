"use client";

import Image from "next/image";

import { useTranslations } from "@/lib/i18n/i18n-context";
import newHero from "@/assets/images/kudos/badges/new-hero.png";
import risingHero from "@/assets/images/kudos/badges/rising-hero.png";
import superHero from "@/assets/images/kudos/badges/super-hero.png";
import legendHero from "@/assets/images/kudos/badges/legend-hero.png";

import revival from "@/assets/images/kudos/icons/revival.png";
import touchOfLight from "@/assets/images/kudos/icons/touch-of-light.png";
import stayGold from "@/assets/images/kudos/icons/stay-gold.png";
import flowToHorizon from "@/assets/images/kudos/icons/flow-to-horizon.png";
import beyondTheBoundary from "@/assets/images/kudos/icons/beyond-the-boundary.png";
import rootFurther from "@/assets/images/kudos/icons/root-further.png";

const HERO_TIERS = [
  { img: newHero, w: 110, h: 20, tierKey: "newHero", label: "New Hero" },
  { img: risingHero, w: 110, h: 20, tierKey: "risingHero", label: "Rising Hero" },
  { img: superHero, w: 109, h: 19, tierKey: "superHero", label: "Super Hero" },
  { img: legendHero, w: 110, h: 20, tierKey: "legendHero", label: "Legend Hero" },
] as const;

const COLLECTIBLE_ICONS = [
  { img: revival, w: 80, h: 88, nameKey: "revival" },
  { img: touchOfLight, w: 80, h: 104, nameKey: "touchOfLight" },
  { img: stayGold, w: 80, h: 88, nameKey: "stayGold" },
  { img: flowToHorizon, w: 80, h: 104, nameKey: "flowToHorizon" },
  { img: beyondTheBoundary, w: 80, h: 104, nameKey: "beyondTheBoundary" },
  { img: rootFurther, w: 80, h: 104, nameKey: "rootFurther" },
] as const;

export function KudosRulesContent() {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      {/* Section 1 — Hero badges */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold uppercase text-primary">
          {t("kudosRules.section1Heading")}
        </h2>
        <p className="text-[15px] leading-relaxed text-secondary-1">
          {t("kudosRules.section1Intro")}
        </p>
        <div className="flex flex-col gap-5">
          {HERO_TIERS.map(({ img, w, h, tierKey, label }) => (
            <div key={tierKey} className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Image
                  src={img}
                  alt={label}
                  width={w}
                  height={h}
                  className="shrink-0"
                />
                <span className="text-sm font-bold text-secondary-1">
                  {t(`kudosRules.tiers.${tierKey}.count`)}
                </span>
              </div>
              <p className="pl-1 text-sm leading-relaxed text-secondary-1/80">
                {t(`kudosRules.tiers.${tierKey}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 — Collectible icons */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold uppercase text-primary">
          {t("kudosRules.section2Heading")}
        </h2>
        <p className="text-[15px] leading-relaxed text-secondary-1">
          {t("kudosRules.section2Intro")}
        </p>
        <div className="grid grid-cols-3 gap-4">
          {COLLECTIBLE_ICONS.map(({ img, w, h, nameKey }) => (
            <div
              key={nameKey}
              className="flex flex-col items-center gap-2"
            >
              <Image
                src={img}
                alt={t(`kudosRules.icons.${nameKey}`)}
                width={w}
                height={h}
              />
              <span className="text-center text-xs font-bold uppercase tracking-wide text-secondary-1">
                {t(`kudosRules.icons.${nameKey}`)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[15px] leading-relaxed text-secondary-1">
          {t("kudosRules.section2Closing")}
        </p>
      </section>

      {/* Section 3 — Kudos Quốc Dân */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold uppercase text-primary">
          {t("kudosRules.section3Heading")}
        </h2>
        <p className="text-[15px] leading-relaxed text-secondary-1">
          {t("kudosRules.section3Body")}
        </p>
      </section>
    </div>
  );
}
