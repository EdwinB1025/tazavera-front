import { describe, it, expect, vi } from "vitest";
import { LOCALES } from "@/shared/config/locales";
import { getMessages } from "@/shared/lib/i18n";
import { generateMetadata } from "./layout";

/**
 * Page metadata tests (design.md D13; the landing spec "Page metadata", "Metadata
 * by locale"). The document title is exactly `Tazavera` and the document
 * description is the metadata description text of the `landing` catalog of the
 * route's locale — the locale the proxy forwards on the request as `x-locale`,
 * the same source the layout reads for `<html lang>` (design.md D13).
 */

const request = vi.hoisted(() => ({ locale: "es" }));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-locale": request.locale }),
}));

// `next/font` is compiler-transformed and cannot load in the test runner, and
// the fonts are not the unit under test.
vi.mock("@/app/fonts", () => ({
  nunito: { variable: "--font-nunito" },
  lora: { variable: "--font-lora" },
}));

describe("app/layout.tsx page metadata (spec: Metadata by locale)", () => {
  it("titles the document exactly `Tazavera`", async () => {
    for (const locale of LOCALES) {
      request.locale = locale;
      const metadata = await generateMetadata();
      expect(metadata.title).toBe("Tazavera");
    }
  });

  it.each(["en"] as const)(
    "describes the document with the metadata description text of the %s `landing` catalog",
    async (locale) => {
      request.locale = locale;
      const expected = getMessages("landing", locale).metaDescription;
      expect(expected, "the catalog carries a metadata description").toBeTruthy();
      const metadata = await generateMetadata();
      expect(metadata.description).toBe(expected);
    },
  );
});
