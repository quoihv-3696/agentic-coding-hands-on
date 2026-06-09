"use client";

import type { RefObject } from "react";

import { Button } from "@/components/button";
import { CloseIcon, PenIcon } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslations } from "@/lib/i18n/i18n-context";

import { KudosRulesContent } from "./kudos-rules-content";

interface KudosRulesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Focus returns here when the drawer closes (the FAB trigger). */
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
  /** Opens the write/send Kudos form (closes the drawer first). */
  onWriteKudos?: () => void;
}

export function KudosRulesDrawer({
  open,
  onOpenChange,
  returnFocusRef,
  onWriteKudos,
}: KudosRulesDrawerProps) {
  const { t } = useTranslations();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col sm:w-138.5 sm:max-w-none"
        // Clicking the overlay must NOT close the drawer (only Đóng / Escape).
        onInteractOutside={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          if (returnFocusRef?.current) {
            e.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>{t("kudosRules.title")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("kudosRules.description")}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <KudosRulesContent />
        </div>

        {/* Sticky footer */}
        <SheetFooter>
          <Button
            variant="secondary"
            leftIcon={<CloseIcon className="size-6" />}
            onClick={() => onOpenChange(false)}
            className="w-fit"
          >
            {t("kudosRules.buttons.close")}
          </Button>
          {/* Opens the write/send Kudos form (drawer closes first). */}
          <Button
            variant="primary"
            onClick={() => onWriteKudos?.()}
            leftIcon={<PenIcon className="size-6" />}
            className="flex-1"
          >
            {t("kudosRules.buttons.writeKudos")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
