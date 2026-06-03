"use client";

import { ChevronDownIcon } from "@/components/icons";
import { VietnamFlag, UkFlag } from "@/components/flags";
import { useTranslations } from "@/lib/i18n/i18n-context";
import type { Locale } from "@/lib/i18n/config";
import { Dropdown, type DropdownItem } from "@/components/common/dropdown";

const OPTIONS = [
  { code: "vi", labelKey: "language.vn", Flag: VietnamFlag },
  { code: "en", labelKey: "language.en", Flag: UkFlag },
] as const;

function Flag({ Component }: { Component: typeof VietnamFlag }) {
  return (
    <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm">
      <Component className="h-full w-full" />
    </span>
  );
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslations();
  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  const items: DropdownItem[] = OPTIONS.map((opt) => ({
    value: opt.code,
    label: t(opt.labelKey),
    icon: <Flag Component={opt.Flag} />,
  }));

  return (
    <Dropdown
      items={items}
      value={locale}
      onSelect={(value) => setLocale(value as Locale)}
      align="end"
      className="w-32"
    >
      <button
        type="button"
        aria-label={t("login.switchLanguage")}
        className="group flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-sm font-semibold tracking-wide text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Flag Component={current.Flag} />
        <span>{t(current.labelKey)}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-white transition-transform group-data-[state=open]:rotate-180" />
      </button>
    </Dropdown>
  );
}
