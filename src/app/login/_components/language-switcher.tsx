"use client";

import { ChevronDownIcon } from "@/components/icons";
import { VietnamFlag, UkFlag } from "@/components/flags";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { Locale } from "@/lib/i18n/config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { code: Locale; labelKey: string; Flag: typeof VietnamFlag }[] = [
  { code: "vi", labelKey: "language.vn", Flag: VietnamFlag },
  { code: "en", labelKey: "language.en", Flag: UkFlag },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslations();
  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("login.switchLanguage")}
        className="group flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-sm font-semibold tracking-wide text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm">
          <current.Flag className="h-full w-full" />
        </span>
        <span>{t(current.labelKey)}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-white transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as Locale)}
        >
          {OPTIONS.map((opt) => (
            <DropdownMenuRadioItem
              key={opt.code}
              value={opt.code}
              className="gap-2.5 font-semibold tracking-wide"
            >
              <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm">
                <opt.Flag className="h-full w-full" />
              </span>
              <span>{t(opt.labelKey)}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
