"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import type { Locale } from "@/lib/i18n/config";
import { ChevronDownIcon } from "@/components/icons";
import { VietnamFlag, UkFlag } from "@/components/flags";
import { Dropdown, type DropdownItem } from "@/components/common/dropdown";

const OPTIONS = [
  { code: "vi" as const, labelKey: "language.vn", Flag: VietnamFlag },
  { code: "en" as const, labelKey: "language.en", Flag: UkFlag },
];

function Flag({ Component }: { Component: typeof VietnamFlag }) {
  return (
    <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm">
      <Component className="h-full w-full" />
    </span>
  );
}

/** Home-header language switcher: text trigger (VN/EN) over the shared Dropdown. */
export function LanguageMenu() {
  const { t, locale, setLocale } = useTranslations();

  const items: DropdownItem[] = OPTIONS.map((o) => ({
    value: o.code,
    label: t(o.labelKey),
    icon: <Flag Component={o.Flag} />,
  }));

  return (
    <Dropdown
      items={items}
      value={locale}
      onSelect={(value) => setLocale(value as Locale)}
      align="end"
    >
      <button
        type="button"
        aria-label={t("home.header.switchLanguage")}
        className="group flex items-center gap-1 rounded-full px-2 py-1 font-medium text-white/90 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t(locale === "en" ? "language.en" : "language.vn")}
        <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </button>
    </Dropdown>
  );
}
