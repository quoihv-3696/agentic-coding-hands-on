"use client";

import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "@/lib/i18n/i18n-context";
import revival from "@/assets/images/profile/revival.png";
import touchOfLight from "@/assets/images/profile/touch_of_light.png";
import stayGold from "@/assets/images/profile/stay_gold.png";
import flowToHorizon from "@/assets/images/profile/flow_to_horizon.png";
import beyondTheBoundary from "@/assets/images/profile/beyond_the_boundary.png";
import rootFurther from "@/assets/images/profile/root_further.png";

/**
 * The 6 collectible icons, fixed left→right order (per clarifications).
 * Rendered as a static full-color showcase — the unlock mechanic (hearts →
 * Secret Box → drop) is deferred this iteration, so all icons always show.
 */
const COLLECTIBLES: { src: StaticImageData; label: string }[] = [
  { src: revival, label: "REVIVAL" },
  { src: touchOfLight, label: "TOUCH OF LIGHT" },
  { src: stayGold, label: "STAY GOLD" },
  { src: flowToHorizon, label: "FLOW TO HORIZON" },
  { src: beyondTheBoundary, label: "BEYOND THE BOUNDARY" },
  { src: rootFurther, label: "ROOT FUTHER" },
];

interface ProfileCollectiblesProps {
  /** Profile owner's display name (for the "other" caption). */
  displayName: string;
  isOwner: boolean;
}

export function ProfileCollectibles({ displayName, isOwner }: ProfileCollectiblesProps) {
  const { t } = useTranslations();
  const caption = isOwner
    ? t("profile.collectionTitleOwn")
    : t("profile.collectionTitleOther").replace("{name}", () => displayName);

  return (
    <section className="flex flex-col items-center gap-4">
      <ul className="flex flex-wrap items-start justify-center gap-4">
        {COLLECTIBLES.map((icon) => (
          <li key={icon.label} className="flex w-20 flex-col items-center gap-2">
            <Image
              src={icon.src}
              alt={icon.label}
              width={64}
              height={64}
              className="size-16 rounded-full object-cover"
            />
            <span className="text-center font-[Montserrat] text-[10px] font-bold uppercase leading-tight text-white">
              {icon.label}
            </span>
          </li>
        ))}
      </ul>
      <p
        className="font-[Montserrat] text-base font-bold leading-7 text-white"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {caption}
      </p>
    </section>
  );
}
