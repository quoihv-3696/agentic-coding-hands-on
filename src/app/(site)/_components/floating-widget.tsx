"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CloseIcon, PenIcon } from "@/components/icons";
import { useTranslations } from "@/lib/i18n/i18n-context";
import theleLightning from "@/assets/icons/thele-lightning.svg";

import { KudosRulesDrawer } from "./kudos-rules-drawer";
import { KudosFormDialog } from "./kudos-form/kudos-form-dialog";

// thele-lightning.svg is multicolor (gradients) — rendered via next/image

export function FloatingWidget() {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  // True while a menu item is opening the drawer — so the menu's close handler
  // lets the drawer take focus instead of yanking it back to the FAB.
  const openingDrawerRef = useRef(false);
  // True while a menu item is opening the form dialog — same pattern.
  const openingFormRef = useRef(false);
  const { t } = useTranslations();

  // Pill styling shared by the menu actions (rendered as DropdownMenuItem so
  // Radix keyboard nav / roving focus / ARIA menuitem semantics all work).
  const pillClass =
    "flex h-14 items-center justify-start gap-3 rounded-full bg-primary px-6 text-base font-semibold text-primary-2 gold-shadow";

  return (
    <>
      <div className="fixed bottom-6 right-5 z-50">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          {/* Pill actions stacked above the trigger. Rendered as real
              DropdownMenuItems (keyboard nav + ARIA menuitem semantics); the
              menu chrome is stripped so each item reads as a standalone pill. */}
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={12}
            className="flex w-auto min-w-0 flex-col gap-2 border-none bg-transparent p-0 shadow-none ring-0"
            onCloseAutoFocus={(e) => {
              // Manage focus ourselves. Open the drawer/dialog only AFTER the
              // menu has closed (here) so the overlay's own autofocus wins
              // instead of racing the menu's focus release (which would drop
              // to <body>).
              e.preventDefault();
              if (openingDrawerRef.current) {
                openingDrawerRef.current = false;
                setDrawerOpen(true);
                return;
              }
              if (openingFormRef.current) {
                openingFormRef.current = false;
                setFormOpen(true);
                return;
              }
              fabRef.current?.focus();
            }}
          >
            {/* "Thể lệ" */}
            <DropdownMenuItem
              onSelect={() => {
                openingDrawerRef.current = true;
              }}
              className={`${pillClass} cursor-pointer focus:bg-[#FFF8E1] focus:text-primary-2`}
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
            </DropdownMenuItem>

            {/* "Viết KUDOS" — opens the write/send form dialog */}
            <DropdownMenuItem
              onSelect={() => {
                openingFormRef.current = true;
              }}
              className={`${pillClass} cursor-pointer focus:bg-[#FFF8E1] focus:text-primary-2`}
            >
              <PenIcon className="size-6 shrink-0 text-primary-2" />
              {t("home.widget.writeKudos")}
            </DropdownMenuItem>
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
        onWriteKudos={() => {
          // Close the rules drawer, then open the write/send form.
          setDrawerOpen(false);
          setFormOpen(true);
        }}
      />

      <KudosFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) fabRef.current?.focus();
        }}
      />
    </>
  );
}
