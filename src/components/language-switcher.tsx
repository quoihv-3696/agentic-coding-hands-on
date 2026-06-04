"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import type { Locale } from "@/lib/i18n/config";
import { ChevronDownIcon } from "@/components/icons";
import { VietnamFlag, UkFlag } from "@/components/flags";
import { Dropdown, type DropdownItem } from "@/components/dropdown";
import { Button } from "@/components/button";

const OPTIONS = [
  { code: "vi", labelKey: "language.vn", Flag: VietnamFlag },
  { code: "en", labelKey: "language.en", Flag: UkFlag },
] as const;

function Flag({ Component }: { Component: typeof VietnamFlag }) {
  return (
    <span className="flex size-6 items-center justify-center overflow-hidden rounded-sm">
      <Component className="h-full w-full" />
    </span>
  );
}

/**
 * Shared VN/EN language switcher — used by both the login and site headers.
 * Text trigger (current flag + label + chevron) over the shared Dropdown.
 */
export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslations();
  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

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
      <Button variant="text" aria-label={t("language.switch")} className="group">
        <Flag Component={current.Flag} />
        {t(current.labelKey)}
        <ChevronDownIcon className="size-6 transition-transform group-data-[state=open]:rotate-180" />
      </Button>
    </Dropdown>
  );
}
