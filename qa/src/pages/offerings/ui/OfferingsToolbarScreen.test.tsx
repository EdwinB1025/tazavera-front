import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { offeringFacetsTexts } from "@/features/offering-facets";
import type { FilteredOfferingsToolbarProps } from "@/widgets/offering-list";
import { OfferingsToolbarScreen } from "@/pages/offerings";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  toolbar.props = null;
});

/**
 * Catalog toolbar screen tests (extract-filtered-offerings design.md D5, D7).
 * The toolbar composition is an async Server Component — untestable in
 * Vitest — so it is replaced at the widget's public API by a stub that
 * records its props.
 */

const toolbar = vi.hoisted(() => ({
  props: null as FilteredOfferingsToolbarProps | null,
}));

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    FilteredOfferingsToolbar: (props: FilteredOfferingsToolbarProps) => {
      toolbar.props = props;
      return <div data-testid="filtered-offerings-toolbar" />;
    },
  };
});

describe("OfferingsToolbarScreen", () => {
  it.each(["es", "ca"])(
    "renders the toolbar with the route's locale, address and the %s filters texts",
    (locale) => {
      const searchParams = { process: "washed" };
      render(<OfferingsToolbarScreen locale={locale} searchParams={searchParams} />);
      expect(toolbar.props?.locale).toBe(locale);
      expect(toolbar.props?.searchParams).toBe(searchParams);
      expect(toolbar.props?.texts).toEqual(
        offeringFacetsTexts(getMessages("filters", locale)),
      );
    },
  );
});
