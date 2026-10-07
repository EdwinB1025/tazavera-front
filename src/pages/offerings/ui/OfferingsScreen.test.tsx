import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
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
  it("renders the eyebrow and the heading from the catalog texts of the route's locale (spec: Heading block)", () => {
    render(<OfferingsScreen locale="es" searchParams={{}} />);
    const es = getMessages("catalog", "es");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      es.listHeading,
    );
    expect(screen.getByText(es.listEyebrow)).toBeTruthy();
  });

  it("reads the catalog of the locale the route asks for (spec: Texts follow the locale)", () => {
    render(<OfferingsScreen locale="ca" searchParams={{}} />);
    const ca = getMessages("catalog", "ca");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      ca.listHeading,
    );
  });

  it("renders nothing in the toolbar region while no capability fills it (spec: Toolbar region contributes nothing)", () => {
    render(<OfferingsScreen locale="es" searchParams={{}} />);
    const heading = screen.getByRole("heading", { level: 1 });
    const headingBlock = heading.parentElement!;
    // The heading block is the only child of its container: no empty toolbar
    // element and so no gap below it.
    expect(headingBlock.parentElement!.childElementCount).toBe(1);
  });

  it("places the results on the page background (spec: Centered column on the page background)", () => {
    render(<OfferingsScreen locale="es" searchParams={{}} />);
    const section = screen
      .getByTestId("filtered-offerings-results")
      .closest("section")!;
    const classes = (section.getAttribute("class") ?? "").split(/\s+/);
    expect(classes).toContain("bg-surface-page");
    expect(classes).not.toContain("bg-surface-section");
  });

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
      evaluateLabel: landing.cardEvaluateLabel,
      verifiedLabel: landing.cardVerifiedLabel,
      provisionalLabel: landing.cardProvisionalLabel,
      ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
      ratingExcellentLabel: landing.cardRatingExcellentLabel,
      ratingGoodLabel: landing.cardRatingGoodLabel,
      ratingCommercialLabel: landing.cardRatingCommercialLabel,
      previousLabel: landing.paginationPreviousLabel,
      nextLabel: landing.paginationNextLabel,
      emptyMessage: catalog.listEmptyMessage,
      errorMessage: catalog.listErrorMessage,
      retryLabel: landing.listRetryLabel,
      resultCount: catalog.resultCount,
      noMatches: filters.noMatches,
      clearAll: filters.clearAll,
    });
  });
});
