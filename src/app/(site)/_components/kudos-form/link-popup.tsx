"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

interface LinkPopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { text: string; url: string }) => void;
  /** Pre-fill text when cursor is over selected text */
  initialText?: string;
}

export function LinkPopup({ open, onClose, onSave, initialText = "" }: LinkPopupProps) {
  const { t } = useTranslations();
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState("");

  function reset() {
    setText("");
    setUrl("");
  }

  function handleSave() {
    if (!url.trim()) return;
    onSave({ text: text.trim(), url: url.trim() });
    reset();
  }

  // Reset fields on ANY close (cancel / overlay / escape) so a reopen starts clean.
  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(752px,calc(100vw-2rem))] sm:max-w-188 rounded-3xl border-none bg-[#FFF8E1] p-10 shadow-2xl"
        aria-describedby={undefined}
      >
        {/* Title — design: "Thêm đường dẫn", 32px bold */}
        <DialogTitle className="text-3xl font-bold leading-10 text-[#00101A]">
          {t("kudosForm.linkHeading")}
        </DialogTitle>

        <div className="flex flex-col gap-8">
          {/* B: Nội dung — display text of the link */}
          <div className="flex items-center gap-4">
            <span className="w-28 shrink-0 text-[22px] font-bold leading-7 text-[#00101A]">
              Nội dung
            </span>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("kudosForm.bodyPlaceholder")}
              className="h-14 flex-1 rounded-lg border border-[#998C5F] bg-white px-6 font-bold text-[#00101A] placeholder:font-bold placeholder:text-[#999] focus-visible:ring-[#998C5F]"
            />
          </div>

          {/* C: URL */}
          <div className="flex items-center gap-4">
            <span className="w-28 shrink-0 text-[22px] font-bold leading-7 text-[#00101A]">
              URL
            </span>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("kudosForm.linkPlaceholder")}
              type="url"
              className="h-14 flex-1 rounded-lg border border-[#998C5F] bg-white px-6 font-bold text-[#00101A] placeholder:font-bold placeholder:text-[#999] focus-visible:ring-[#998C5F]"
            />
          </div>

          {/* D: Actions — Cancel (secondary) + Save (primary gold) */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "flex h-15 items-center justify-center gap-2 rounded px-10",
                "border border-[#998C5F] bg-[rgba(255,234,158,0.1)]",
                "text-base font-bold leading-6 text-[#00101A]",
                "hover:bg-[rgba(255,234,158,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]",
              )}
            >
              {t("kudosForm.cancel")}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!url.trim()}
              className={cn(
                "flex h-15 flex-1 items-center justify-center gap-2 rounded-lg",
                "bg-[#FFEA9E] text-[22px] font-bold leading-7 text-[#00101A]",
                "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {/* "Lưu" — from Figma design */}
              Lưu
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
