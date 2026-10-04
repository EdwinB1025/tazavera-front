/**
 * Message catalogs (design.md D10).
 *
 * One catalog per area and locale at `messages/{locale}/{area}.json`. This
 * module reads them from disk: `getMessages` returns one area's catalog for a
 * locale and rejects a locale the application does not support, so every
 * layer can read an area's catalog and screens pass the texts down as props.
 * Components never call the translation API.
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { isSupportedLocale } from "@/shared/config/locales";

/** One area's texts: flat text-key to rendered text. */
export type MessageCatalog = Record<string, string>;

/** Every area's catalog of one locale, namespaced by area. */
export type MessageCatalogs = Record<string, MessageCatalog>;

const MESSAGES_DIR = pathResolve(process.cwd(), "messages");

function requireSupportedLocale(locale: string): void {
  if (!isSupportedLocale(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
}

/** One area's catalog for a locale (spec: "Message catalog structure"). */
export function getMessages(area: string, locale: string): MessageCatalog {
  requireSupportedLocale(locale);
  const file = pathResolve(MESSAGES_DIR, locale, `${area}.json`);
  return JSON.parse(readFileSync(file, "utf-8")) as MessageCatalog;
}

/** Every area's catalog for a locale, namespaced by area. */
export function getCatalogs(locale: string): MessageCatalogs {
  requireSupportedLocale(locale);
  const catalogs: MessageCatalogs = {};
  for (const entry of readdirSync(pathResolve(MESSAGES_DIR, locale))) {
    if (!entry.endsWith(".json")) continue;
    const area = entry.slice(0, -".json".length);
    catalogs[area] = getMessages(area, locale);
  }
  return catalogs;
}
