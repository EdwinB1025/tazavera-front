import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Message catalog guard (spec "Message catalog structure"). Every area under
 * `messages/` defines the same set of text keys in `es`, `en` and `ca`; a key
 * missing from an area's catalog in one locale fails naming the area, the
 * locale and the key (spec: "Missing text key detected"). With zero areas the
 * guard passes: it verifies structure as areas arrive.
 */

const LOCALES = ["es", "en", "ca"] as const;
const MESSAGES_DIR = pathResolve(process.cwd(), "messages");

describe("message catalog guard (spec: Message catalog structure)", () => {
  function listAreas(): Set<string> {
    const areas = new Set<string>();
    if (!existsSync(MESSAGES_DIR)) return areas;
    for (const locale of LOCALES) {
      const dir = pathResolve(MESSAGES_DIR, locale);
      if (!existsSync(dir)) continue;
      for (const entry of readdirSync(dir)) {
        if (entry.endsWith(".json")) areas.add(entry.slice(0, -".json".length));
      }
    }
    return areas;
  }

  function readKeys(locale: string, area: string): Set<string> {
    const file = pathResolve(MESSAGES_DIR, locale, `${area}.json`);
    if (!existsSync(file)) return new Set();
    const catalog = JSON.parse(readFileSync(file, "utf-8")) as Record<
      string,
      unknown
    >;
    return new Set(Object.keys(catalog));
  }

  it("every area defines the same set of text keys in es, en and ca", () => {
    const offenders: string[] = [];

    for (const area of listAreas()) {
      const keysPerLocale = new Map<string, Set<string>>(
        LOCALES.map((locale) => [locale, readKeys(locale, area)]),
      );
      const union = new Set<string>();
      for (const keys of keysPerLocale.values()) {
        for (const key of keys) union.add(key);
      }

      for (const key of [...union].sort()) {
        for (const locale of LOCALES) {
          if (!keysPerLocale.get(locale)!.has(key)) {
            offenders.push(
              `area "${area}", locale "${locale}" is missing the key "${key}"`,
            );
          }
        }
      }
    }

    expect(
      offenders,
      `text keys missing from an area's catalog: ${offenders.join("; ")}`,
    ).toEqual([]);
  });
});
