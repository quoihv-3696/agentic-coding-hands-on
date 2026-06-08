"use client";

import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { Separator } from "@/components/ui/separator";
import { DiamondIcon, LicenseIcon, TargetIcon } from "@/components/icons";
import type { AwardDetail } from "@/lib/awards/award-details";

export interface AwardCardProps {
  slug: string;
  image: StaticImageData;
  titleKey: string;
  detail: AwardDetail;
  imageSide: "left" | "right";
  showDivider: boolean;
}

export function AwardCard({
  slug,
  image,
  titleKey,
  detail,
  imageSide,
  showDivider,
}: AwardCardProps) {
  const { t } = useTranslations();

  return (
    <div id={slug} className="scroll-mt-24 flex flex-col gap-20">
      {/* Card row — image side alternates at lg+ */}
      <div
        className={`flex flex-col gap-20 lg:flex-row lg:items-start lg:gap-20 ${
          imageSide === "right" ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Trophy image */}
        <div className="mx-auto w-full max-w-84 shrink-0 lg:mx-0 lg:w-84">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl -mt-1.5">
            <Image
              src={image}
              alt=""
              aria-hidden
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 80vw, 336px"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {/* Title */}
          <div className="flex items-center gap-4">
            <TargetIcon className="size-6 shrink-0" aria-hidden />
            <h2 className="text-2xl font-bold text-primary">{t(titleKey)}</h2>
          </div>

          {/* Long description */}
          <p
            className="text-white/90"
            style={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "24px",
              letterSpacing: "0.5px",
              textAlign: "justify",
            }}
          >
            {t(detail.longDescKey)}
          </p>

          {/* Divider */}
          <Separator className="bg-[#2E3940]" />

          {/* Quantity row */}
          <div className="flex items-center gap-4 pr-4">
            <DiamondIcon className="size-6 shrink-0 " aria-hidden />
            <span className="text-2xl font-bold text-primary min-w-67.5">
              {t("awardsPage.quantityLabel")}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span className="text-4xl font-bold leading-11 text-white">
                {detail.quantity}
              </span>
              <span className="text-sm font-bold leading-5 text-white/80">
                {t(detail.quantityUnitKey)}
              </span>
            </span>
          </div>

          {/* Divider */}
          <Separator className="bg-[#2E3940]" />

          {/* Prize row(s) */}
          <div className="flex flex-col gap-4">
            {detail.prizes.map((prize, i) => (
              <div key={prize.valueKey}>
                {/* "Or" separator between prizes for Signature */}
                {i > 0 && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm font-bold text-white/60">
                      {t("awardsPage.or")}
                    </span>
                    <div className="h-px flex-1 bg-[#2E3940]" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {/* Prize label row */}
                  <div className="flex items-center gap-4">
                    <LicenseIcon className="size-6 shrink-0" aria-hidden />
                    <span className="text-2xl font-bold text-primary">
                      {t("awardsPage.prizeLabel")}
                    </span>
                  </div>
                  {/* Prize value */}
                  <div className="flex flex-col gap-1 pl-10">
                    <span className="text-4xl font-bold leading-11 text-white">
                      {t(prize.valueKey)}
                    </span>
                    <span className="text-sm font-bold leading-5 text-white/80">
                      {t(prize.noteKey)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card divider (not after last card) */}
      {showDivider && <Separator className="bg-[#2E3940]" />}
    </div>
  );
}
