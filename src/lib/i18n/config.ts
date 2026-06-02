import vi from "./messages/vi.json";
import en from "./messages/en.json";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";
export const LOCALE_COOKIE = "saa-locale";

export const messages: Record<Locale, Record<string, unknown>> = { vi, en };

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
