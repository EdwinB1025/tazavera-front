// src/shared/config/locale-names.ts
import type { Locale } from "./locales";

export type LocaleName = { name: string; lang: string };

export const LOCALE_NAMES: Record<Locale, LocaleName> = {
  es: { name: "Español", lang: "es" },
  en: { name: "English", lang: "en" },
  ca: { name: "Català", lang: "ca" },
};
