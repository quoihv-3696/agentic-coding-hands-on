"use client";

import { useState } from "react";
import Image from "next/image";
import { PenIcon } from "@/components/icons";
import { useTranslations } from "@/lib/i18n/i18n-context";
import kudosLogoSmall from "@/assets/images/home/kudos-icon.svg";

/**
 * Floating Widget Button (mms_6_Widget Button, node 5022:15169).
 *
 * Anchored bottom-right of the viewport (standard floating action button —
 * the design's page-coordinate top:830px would fall off short viewports).
 * Box: 106×64, rounded-full, gold (#FFEA9E), gold-glow box-shadow.
 * Two icons: Pen (write kudos) + Kudos shield logo (SAA rules).
 * Separator "/" between them (dark text, Montserrat 700, 24px).
 *
 * Click → opens a stub "coming soon" menu (no defined options in spec).
 */
export function FloatingWidget() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslations();

  return (
    <>
      {/* Floating button — viewport bottom-right */}
      <div className="fixed bottom-6 right-5 z-50">
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t("home.widget.label")}
          className="flex h-16 w-26.5 items-center gap-2 rounded-full bg-[#FFEA9E] px-4 transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#00101A]"
          style={{
            boxShadow:
              "0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287",
          }}
        >
          {/* Left icon group: pen icon + "/" separator */}
          <span className="flex items-center gap-1">
            <PenIcon
              className="size-6 shrink-0"
              style={{ color: "#00101A" }}
            />
            <span
              className="select-none text-2xl font-bold leading-8 text-[#00101A]"
              style={{ fontFamily: "Montserrat" }}
              aria-hidden
            >
              /
            </span>
          </span>

          {/* Right icon: kudos logo (multicolor — rendered as image) */}
          <Image
            src={kudosLogoSmall}
            alt=""
            aria-hidden
            width={20}
            height={18}
            className="shrink-0"
          />
        </button>

        {/* Stub menu */}
        {open && (
          <div
            role="menu"
            aria-label={t("home.widget.label")}
            className="absolute bottom-[calc(100%+8px)] right-0 min-w-40 rounded-lg border border-[#2E3940] bg-[#001828] px-4 py-3 shadow-lg"
          >
            <p className="text-sm font-semibold text-white/60">
              {t("home.widget.comingSoon")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
