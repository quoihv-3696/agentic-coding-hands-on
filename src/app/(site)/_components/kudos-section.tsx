"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/button";
import { UpIcon } from "@/components/icons";
import kudosBg from "@/assets/images/home/kudos-bg.png";
import kudosLogo from "@/assets/images/home/kudos-wordmark.svg";

/**
 * Sun* Kudos section (mms_D1_Sunkudos, node 3390:10349).
 * Design: 1224×500 dark panel with rounded-2xl, background image, left text
 * block, and the KUDOS logo on the right.
 */
export function KudosSection() {
  const { t } = useTranslations();

  return (
    <section className="w-full">
      {/*
       * ≥1264px: the image (in-flow) sizes the card, content is overlaid, height ≤500px.
       * <1264px: card goes full-width, the image becomes a cover background and the
       * content (in normal flow) drives the height so nothing clips; fonts + logo shrink.
       */}
      <div className="relative mx-auto w-full overflow-hidden rounded-2xl min-[1264px]:w-fit">
        <Image
          src={kudosBg}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover min-[1264px]:relative min-[1264px]:inset-auto min-[1264px]:h-auto min-[1264px]:max-h-125 min-[1264px]:w-auto"
        />

        {/* Content layer */}
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 p-6 sm:p-8 min-[1264px]:absolute min-[1264px]:inset-0 min-[1264px]:flex-row min-[1264px]:items-center min-[1264px]:gap-10 min-[1264px]:p-13">
          {/* Left: text block */}
          <div className="flex max-w-114.25 flex-col gap-6 min-[1264px]:gap-8">
            {/* Title group */}
            <div className="flex flex-col gap-3 min-[1264px]:gap-4">
              {/* Label */}
              <p className="text-lg font-bold leading-7 text-white min-[1264px]:text-2xl min-[1264px]:leading-8">
                {t("home.kudos.label")}
              </p>
              {/* Gold title */}
              <p className="text-4xl font-bold leading-tight tracking-[-0.25px] text-[#FFEA9E] min-[1264px]:text-[57px] min-[1264px]:leading-16">
                {t("home.kudos.title")}
              </p>
              {/* Body copy — preserve newlines from translation */}
              <p className="whitespace-pre-line text-sm font-bold leading-6 tracking-[0.5px] text-white min-[1264px]:text-base">
                {t("home.kudos.description")}
              </p>
            </div>

            {/* CTA — Button asChild renders a single valid <a> (no <a><button>) */}
            <div>
              <Button asChild variant="primary" rightIcon={<UpIcon />}>
                <Link href="/kudos">{t("home.kudos.detail")}</Link>
              </Button>
            </div>
          </div>

          {/* Right: KUDOS logo — shrinks below 1264px */}
          <div className="flex shrink-0 items-center justify-center">
            <Image
              src={kudosLogo}
              alt={t("home.kudos.title")}
              width={364}
              height={74}
              className="h-auto w-44 min-[1264px]:w-91"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
