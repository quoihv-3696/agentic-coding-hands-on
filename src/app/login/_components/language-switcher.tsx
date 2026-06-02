"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { VietnamFlag, UkFlag } from "@/components/flags";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { Locale } from "@/lib/i18n/config";

const OPTIONS: { code: Locale; labelKey: string; Flag: typeof VietnamFlag }[] = [
  { code: "vi", labelKey: "language.vn", Flag: VietnamFlag },
  { code: "en", labelKey: "language.en", Flag: UkFlag },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  const select = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("login.switchLanguage")}
        className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
      >
        <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm">
          <current.Flag className="h-full w-full" />
        </span>
        <span>{t(current.labelKey)}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-white transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-32 overflow-hidden rounded-xl border border-white/10 bg-black/95 p-1 shadow-xl backdrop-blur"
        >
          {OPTIONS.map((opt) => {
            const selected = opt.code === locale;
            return (
              <li key={opt.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(opt.code)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide text-white transition-colors ${
                    selected ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                >
                  <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm">
                    <opt.Flag className="h-full w-full" />
                  </span>
                  <span>{t(opt.labelKey)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
