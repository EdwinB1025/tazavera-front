import { describe, it, expect, vi } from "vitest";
import { getMessages } from "@/shared/lib/i18n";
import { generateMetadata } from "../../app/layout";

/**
 * Page metadata tests (design.md D13; the landing spec "Page metadata", "Metadata
 * by locale"). The document title is exactly `Tazavera` and the document
 * description is the metadata description text of the `landing` catalog of the
 * route's locale — the locale `getLocale()` reads from the request, the same
 * source the layout reads for `<html lang>` (design.md D13;
 * adopt-next-intl-routing design.md D3). The
 * create-next-app template metadata is replaced: its title and description text
 * no longer remain in `app/layout.tsx` (design.md D13).
 */

const request = vi.hoisted(() => ({ locale: "es" }));

vi.mock("next-intl/server", () => ({
  getLocale: async () => request.locale,
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

// `next/font` is compiler-transformed and cannot load in the test runner, and
// the fonts are not the unit under test.
vi.mock("@/app/fonts", () => ({
  nunito: { variable: "--font-nunito" },
  lora: { variable: "--font-lora" },
}));

describe("app/layout.tsx page metadata (spec: Metadata by locale)", () => {
  it.each(["es", "ca"] as const)(
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
