import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import type { FilteredOfferingsResultsProps } from "@/widgets/offering-list";
import { OfferingsScreen } from "@/pages/offerings";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  results.props = null;
});

/**
 * Catalog screen tests (add-offering-catalog design.md D8, D9; spec "Catalog
 * heading and toolbar slot"; extract-filtered-offerings design.md D5, D7).
 * The results composition is tested in its widget, so it is replaced at the
 * widget's public API by a stub that records its props.
 */

const results = vi.hoisted(() => ({
  props: null as FilteredOfferingsResultsProps | null,
}));

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    FilteredOfferingsResults: (props: FilteredOfferingsResultsProps) => {
      results.props = props;
      return <div data-testid="filtered-offerings-results" />;
    },
  };
});

describe("OfferingsScreen", () => {
  it("renders the results with the route's locale, address, path and texts and no fixed query (extract-filtered-offerings design.md D5)", () => {
    const searchParams = { process: "washed", page: "2" };
    render(<OfferingsScreen locale="es" searchParams={searchParams} />);
    const landing = getMessages("landing", "es");
    const catalog = getMessages("catalog", "es");
    const filters = getMessages("filters", "es");
    expect(results.props?.locale).toBe("es");
    expect(results.props?.searchParams).toBe(searchParams);
    expect(results.props?.path).toBe("/es/offerings");
    expect(results.props).not.toHaveProperty("fixedQuery");
    expect(results.props?.texts).toEqual({
      coffeeshopCaption: landing.cardCoffeeshopCaption,
      roasterCaption: landing.cardRoasterCaption,
      evaluationsLabel: landing.cardEvaluationsLabel,
      defectiveLabel: landing.cardDefectiveLabel,
      viewLabel: landing.cardViewLabel,
      viewEvaluationsLabel: landing.cardViewEvaluationsLabel,
      evaluateLabel: landing.cardEvaluateLabel,
      verifiedLabel: landing.cardVerifiedLabel,
      provisionalLabel: landing.cardProvisionalLabel,
      ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
      ratingExcellentLabel: landing.cardRatingExcellentLabel,
      ratingGoodLabel: landing.cardRatingGoodLabel,
      ratingCommercialLabel: landing.cardRatingCommercialLabel,
      previousLabel: landing.paginationPreviousLabel,
      nextLabel: landing.paginationNextLabel,
      navigationLabel: landing.paginationNavigationLabel,
      pageLabel: landing.paginationPageLabel,
      emptyMessage: catalog.listEmptyMessage,
      errorMessage: catalog.listErrorMessage,
      retryLabel: landing.listRetryLabel,
      resultCount: catalog.resultCount,
      noMatches: filters.noMatches,
      clearAll: filters.clearAll,
    });
  });
});
