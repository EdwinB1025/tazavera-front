import { describe, it, expect, afterEach, vi } from "vitest";
import type { ReactElement } from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import {
  CATALOG_GRID_CLASSES,
  type OfferingsProps,
} from "@/widgets/offering-list";
import { ClearFiltersButton } from "@/shared/ui";
import { OfferingsScreen } from "@/pages/offerings";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  block.suspend = false;
  block.props = null;
});

/**
 * Catalog screen tests (add-offering-catalog design.md D8, D9, D10; specs
 * "Catalog heading and toolbar slot", "Offering catalog page" — "Loading" —
 * and "Catalog query pass-through"). The query-driven block is an async
 * Server Component — untestable in Vitest — so it is replaced at the widget's
 * public API by a stub that records its props; the skeleton card stub counts
 * the fallback.
 */

const block = vi.hoisted(() => ({
  suspend: false,
  props: null as OfferingsProps | null,
}));

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    Offerings: (props: OfferingsProps) => {
      block.props = props;
      // Never settles, so the boundary keeps showing its fallback.
      if (block.suspend) throw new Promise<void>(() => {});
      return <div data-testid="offerings-block" />;
    },
    OfferingSkeletonCard: () => <div data-testid="skeleton-card" />,
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

  it("shows three skeleton cards in the catalog grid inside a container while the list loads (spec: Loading)", () => {
    block.suspend = true;
    render(<OfferingsScreen locale="es" searchParams={{}} />);
    const skeletons = screen.getAllByTestId("skeleton-card");
    expect(skeletons).toHaveLength(3);
    const grid = skeletons[0].parentElement!;
    expect(grid.getAttribute("class")).toBe(CATALOG_GRID_CLASSES);
    expect(grid.parentElement!.getAttribute("class")).toBe("@container");
    expect(screen.queryByTestId("offerings-block")).toBeNull();
  });

  it("places the results on the page background (spec: Centered column on the page background)", () => {
    block.suspend = true;
    render(<OfferingsScreen locale="es" searchParams={{}} />);
    const section = screen.getAllByTestId("skeleton-card")[0].closest("section")!;
    const classes = (section.getAttribute("class") ?? "").split(/\s+/);
    expect(classes).toContain("bg-surface-page");
    expect(classes).not.toContain("bg-surface-section");
  });

  it("passes the path /{locale}/offerings and the kept query to the list (design.md D1, D10)", () => {
    render(
      <OfferingsScreen
        locale="es"
        searchParams={{
          verified: "1",
          orderBy: "cupping_avg",
          cataRef: ["01JREFA", "01JREFB"],
          foo: "1",
          page: "2",
        }}
      />,
    );
    expect(block.props?.locale).toBe("es");
    expect(block.props?.path).toBe("/es/offerings");
    // The `orderBy` without a direction is dropped (add-offering-facets
    // design.md D4).
    expect(block.props?.query).toEqual({
      verified: "1",
      cataRef: ["01JREFA", "01JREFB"],
      page: "2",
    });
    expect(block.props?.gridClassName).toBe(CATALOG_GRID_CLASSES);
  });

  it("passes no session to the block (add-specialist-evaluations design.md D6)", () => {
    render(<OfferingsScreen locale="es" searchParams={{}} />);
    expect(block.props).not.toBeNull();
    expect(block.props).not.toHaveProperty("session");
  });

  it("feeds the catalog's list messages and landing's card, pagination and retry texts to the list (design.md D16)", () => {
    render(<OfferingsScreen locale="es" searchParams={{}} />);
    const landing = getMessages("landing", "es");
    const catalog = getMessages("catalog", "es");
    expect(block.props?.texts).toEqual({
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
    });
  });

  it("shows the filtered empty message and Clear all when a filter is applied (add-offering-facets design.md D9)", () => {
    render(<OfferingsScreen locale="es" searchParams={{ process: "washed" }} />);
    expect(block.props?.texts.emptyMessage).toBe(getMessages("filters", "es").noMatches);
    expect(block.props?.emptyAction).toBeDefined();
    const action = block.props?.emptyAction as ReactElement<{
      label: string;
      keep: readonly string[];
    }>;
    expect(action.type).toBe(ClearFiltersButton);
    expect(action.props.label).toBe(getMessages("filters", "es").clearAll);
    expect(action.props.keep).toEqual(["orderBy", "orderDirection"]);
  });

  it("keeps the catalog's empty message and no action with only a sort (add-offering-facets design.md D9)", () => {
    render(
      <OfferingsScreen
        locale="es"
        searchParams={{ orderBy: "cupping_avg", orderDirection: "desc" }}
      />,
    );
    expect(block.props?.texts.emptyMessage).toBe(getMessages("catalog", "es").listEmptyMessage);
    expect(block.props?.emptyAction).toBeUndefined();
  });
});
