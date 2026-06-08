"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CloseIcon, PenIcon } from "@/components/icons";
import { useTranslations } from "@/lib/i18n/i18n-context";
import theleLightning from "@/assets/icons/thele-lightning.svg";

import { KudosRulesDrawer } from "./kudos-rules-drawer";

// thele-lightning.svg is multicolor (gradients) — rendered via next/image

export function FloatingWidget() {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslations();

  return (
    <>
      <div className="fixed bottom-6 right-5 z-50">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          {/* Pill actions stacked above the trigger — rendered inside the dropdown */}
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={12}
            className="flex w-auto min-w-0 flex-col gap-2 border-none bg-transparent p-0 shadow-none ring-0"
            // Suppress default menu styles so pills render as standalone buttons
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {/* "Thể lệ" pill */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDrawerOpen(true);
              }}
              className="flex h-14 items-center gap-3 rounded-full bg-primary px-6 font-semibold text-primary-2 gold-shadow transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              <Image
                src={theleLightning}
                alt=""
                aria-hidden
                width={24}
                height={24}
                className="shrink-0"
              />
              {t("home.widget.rules")}
            </button>

            {/* "Viết KUDOS" pill — inert for now (kudos form is a future task).
                aria-disabled advertises the no-op state to assistive tech while
                keeping the gold design look. */}
            <button
              type="button"
              aria-disabled
              className="flex h-14 items-center gap-3 rounded-full bg-primary px-6 font-semibold text-primary-2 gold-shadow transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              <PenIcon className="size-6 shrink-0 text-primary-2" />
              {t("home.widget.writeKudos")}
            </button>
          </DropdownMenuContent>

          {/* FAB trigger — collapsed: gold pill (pen / lightning);
              expanded: red circular ✕ toggle. */}
          <DropdownMenuTrigger asChild>
            <button
              ref={fabRef}
              type="button"
              aria-label={
                open
                  ? t("home.widget.collapseLabel")
                  : t("home.widget.expandLabel")
              }
              aria-expanded={open}
              className={
                open
                  ? "flex size-14 items-center justify-center rounded-full bg-error text-secondary-1 transition-all motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                  : "flex h-14 items-center gap-2 rounded-full bg-primary px-4 text-primary-2 gold-shadow transition-all motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
              }
            >
              {open ? (
                <CloseIcon className="size-6" aria-hidden />
              ) : (
                <>
                  <PenIcon className="size-6 shrink-0 text-primary-2" />
                  <span
                    className="select-none text-2xl font-bold leading-8 text-primary-2"
                    aria-hidden
                  >
                    /
                  </span>
                  <Image
                    src={theleLightning}
                    alt=""
                    aria-hidden
                    width={24}
                    height={24}
                    className="shrink-0"
                  />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>

      <KudosRulesDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        returnFocusRef={fabRef}
      />
    </>
  );
}
