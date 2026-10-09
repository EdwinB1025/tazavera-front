/**
 * Message catalogs (design.md D10).
 *
 * One catalog per area and locale at `messages/{locale}/{area}.json`. This
 * module reads them from disk: `getMessages` returns one area's catalog for a
 * locale and rejects a locale the application does not support, so every
 * layer can read an area's catalog and screens pass the texts down as props.
 * Components never call the translation API.
 */

import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { hasLocale } from "next-intl";
import { routing } from "@/shared/config/locales";

/** One area's texts: flat text-key to rendered text. */
export type MessageCatalog = Record<string, string>;

const MESSAGES_DIR = pathResolve(process.cwd(), "messages");

function requireSupportedLocale(locale: string): void {
  if (!hasLocale(routing.locales, locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
}

/** One area's catalog for a locale (spec: "Message catalog structure"). */
export function getMessages(area: string, locale: string): MessageCatalog {
  requireSupportedLocale(locale);
  const file = pathResolve(MESSAGES_DIR, locale, `${area}.json`);
  return JSON.parse(readFileSync(file, "utf-8")) as MessageCatalog;
}
