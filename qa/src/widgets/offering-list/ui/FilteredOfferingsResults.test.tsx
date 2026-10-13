import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { OfferingsProps } from "@/widgets/offering-list/ui/Offerings";
import {
  FilteredOfferingsResults,
  type FilteredOfferingsResultsTexts,
} from "@/widgets/offering-list/ui/FilteredOfferingsResults";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  block.suspend = false;
  block.props = null;
});

/**
 * Filtered offerings results tests (extract-filtered-offerings design.md D3,
 * D7; specs "Offering catalog page" — "Loading" —, "Catalog query
 * pass-through" and "Filtered offerings scoped by a host"). The query-driven
 * block is an async Server Component — untestable in Vitest — so it is
 * replaced at its module by a stub that records its props; the skeleton card
 * stub counts the fallback.
 */

const block = vi.hoisted(() => ({
  suspend: false,
  props: null as OfferingsProps | null,
}));

vi.mock("@/widgets/offering-list/ui/Offerings", () => ({
  Offerings: (props: OfferingsProps) => {
    block.props = props;
    // Never settles, so the boundary keeps showing its fallback.
    if (block.suspend) throw new Promise<void>(() => {});
    return <div data-testid="offerings-block" />;
  },
}));

vi.mock("@/widgets/offering-list/ui/OfferingSkeletonCard", () => ({
  OfferingSkeletonCard: () => <div data-testid="skeleton-card" />,
}));

const LIST_TEXTS = {
  coffeeshopCaption: "coffeeshopCaption",
  roasterCaption: "roasterCaption",
  evaluationsLabel: "evaluationsLabel",
  defectiveLabel: "defectiveLabel",
  viewLabel: "viewLabel",
  evaluateLabel: "evaluateLabel",
  viewEvaluationsLabel: "viewEvaluationsLabel",
  verifiedLabel: "verifiedLabel",
  provisionalLabel: "provisionalLabel",
  ratingExceptionalLabel: "ratingExceptionalLabel",
  ratingExcellentLabel: "ratingExcellentLabel",
  ratingGoodLabel: "ratingGoodLabel",
  ratingCommercialLabel: "ratingCommercialLabel",
  showNotesLabel: "Show the notes under {label}",
  hideNotesLabel: "Hide the notes under {label}",
  previousLabel: "previousLabel",
  nextLabel: "nextLabel",
  navigationLabel: "navigationLabel",
  pageLabel: "pageLabel {page}",
  emptyMessage: "emptyMessage",
  resultCount: "resultCount",
  errorMessage: "errorMessage",
  retryLabel: "retryLabel",
};

const TEXTS: FilteredOfferingsResultsTexts = {
  ...LIST_TEXTS,
  noMatches: "noMatches",
  clearAll: "clearAll",
};

describe("FilteredOfferingsResults", () => {
  it("passes no session to the block (add-specialist-evaluations design.md D6)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{}}
        path="/es/offerings"
        texts={TEXTS}
      />,
    );
    expect(block.props).not.toBeNull();
    expect(block.props).not.toHaveProperty("session");
  });

  it("feeds exactly the list texts to the list (add-offering-catalog design.md D16)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{}}
        path="/es/offerings"
        texts={TEXTS}
      />,
    );
    expect(block.props?.texts).toEqual(LIST_TEXTS);
  });

  it("does not count a fixed key as a filter (design.md D3)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{}}
        path="/es/offerings"
        fixedQuery={{ coffeeshopUlid: "Y" }}
        texts={TEXTS}
      />,
    );
    expect(block.props?.texts.emptyMessage).toBe("emptyMessage");
    expect(block.props?.emptyAction).toBeUndefined();
  });

});
