import { describe, it, expect, vi } from "vitest";
import { getMessages } from "@/shared/lib/i18n";

/**
 * The directory's document metadata (add-coffeeshop-directory spec "Document
 * metadata"): both route files describe the document with the `coffeeshops`
 * catalog's description in the route's locale. The screens are mocked, so
 * only the route files' `generateMetadata` runs.
 */

vi.mock("@/pages/coffeeshops", () => ({ CoffeeshopsScreen: () => null }));
vi.mock("@/pages/coffeeshop-detail", () => ({ CoffeeshopDetailScreen: () => null }));

type MetadataRoute = {
  generateMetadata: (props: { params: Promise<Record<string, string>> }) => Promise<{ description?: unknown }>;
};

describe("the directory route files' metadata (spec: Document metadata)", () => {
  it("describe the document with the directory's description in the route's locale", async () => {
    const expected = getMessages("coffeeshops", "es").metaDescription;
    const list = (await import("./page")) as unknown as MetadataRoute;
    const detail = (await import("./[ulid]/page")) as unknown as MetadataRoute;
    expect((await list.generateMetadata({ params: Promise.resolve({ locale: "es" }) })).description).toBe(expected);
    expect(
      (await detail.generateMetadata({ params: Promise.resolve({ locale: "es", ulid: "01SHOP" }) })).description,
    ).toBe(expected);
  });
});
