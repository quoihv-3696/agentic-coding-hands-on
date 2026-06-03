"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/i18n/i18n-context";

/**
 * "Root Further" theme content: the large ROOT FURTHER wordmark, the body
 * paragraphs (justified) and the proverb quote, centered on the dark background.
 */
export function RootFurtherSection() {
  const { t } = useTranslations();
  const body1 = t("home.rootFurther.body1").split("\n");
  const body2 = t("home.rootFurther.body2").split("\n");

  return (
    <section className="px-6 py-20 sm:px-10 lg:py-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-white">
        <Image
          src="/home/title.png"
          alt={t("home.rootFurther.title")}
          width={290}
          height={134}
          className="h-auto w-72.5 max-w-full"
        />

        <div className="space-y-4 text-justify text-base leading-relaxed text-white/90 sm:text-lg">
          {body1.map((p, i) => (
            <p key={`b1-${i}`}>{p}</p>
          ))}
        </div>

        <blockquote className="space-y-1 text-center">
          <p className="text-xl font-bold sm:text-2xl">
            “{t("home.rootFurther.quote")}”
          </p>
          <p className="text-sm text-white/60">
            {t("home.rootFurther.quoteSource")}
          </p>
        </blockquote>

        <div className="space-y-4 text-justify text-base leading-relaxed text-white/90 sm:text-lg">
          {body2.map((p, i) => (
            <p key={`b2-${i}`}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
