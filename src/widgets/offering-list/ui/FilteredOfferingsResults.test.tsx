import { describe, it, expect, afterEach, vi } from "vitest";
import { startTransition, type ReactElement } from "react";
import { render, cleanup, screen, act } from "@testing-library/react";
import { ClearFiltersButton } from "@/shared/ui";
import { CATALOG_GRID_CLASSES } from "../lib/grid";
import type { OfferingsProps } from "./Offerings";
import {
  FilteredOfferingsResults,
  type FilteredOfferingsResultsTexts,
} from "./FilteredOfferingsResults";

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

vi.mock("./Offerings", () => ({
  Offerings: (props: OfferingsProps) => {
    block.props = props;
    // Never settles, so the boundary keeps showing its fallback.
    if (block.suspend) throw new Promise<void>(() => {});
    return <div data-testid="offerings-block" />;
  },
}));

vi.mock("./OfferingSkeletonCard", () => ({
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
  it("shows three skeleton cards in the catalog grid inside a container while the list loads (spec: Loading)", () => {
    block.suspend = true;
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{}}
        path="/es/offerings"
        texts={TEXTS}
      />,
    );
    const skeletons = screen.getAllByTestId("skeleton-card");
    expect(skeletons).toHaveLength(3);
    const grid = skeletons[0].parentElement!;
    expect(grid.getAttribute("class")).toBe(CATALOG_GRID_CLASSES);
    expect(grid.parentElement!.getAttribute("class")).toBe("@container");
    expect(screen.queryByTestId("offerings-block")).toBeNull();
  });

  it("passes the locale, the path, the catalog grid and the kept query to the list (add-offering-catalog design.md D1, D10)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{
          verified: "1",
          orderBy: "cupping_avg",
          cataRef: ["01JREFA", "01JREFB"],
          foo: "1",
          page: "2",
        }}
        path="/es/offerings"
        texts={TEXTS}
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

  it("shows the filtered empty message and Clear all when a filter is applied (add-offering-facets design.md D9)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{ process: "washed" }}
        path="/es/offerings"
        texts={TEXTS}
      />,
    );
    expect(block.props?.texts.emptyMessage).toBe("noMatches");
    const action = block.props?.emptyAction as ReactElement<{
      label: string;
      keep: readonly string[];
    }>;
    expect(action.type).toBe(ClearFiltersButton);
    expect(action.props.label).toBe(TEXTS.clearAll);
    expect(action.props.keep).toEqual(["orderBy", "orderDirection"]);
  });

  it("keeps the unfiltered empty message and no action with only a sort (add-offering-facets design.md D9)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{ orderBy: "cupping_avg", orderDirection: "desc" }}
        path="/es/offerings"
        texts={TEXTS}
      />,
    );
    expect(block.props?.texts.emptyMessage).toBe("emptyMessage");
    expect(block.props?.emptyAction).toBeUndefined();
  });

  it("forces the fixed keys over the address (spec: Fixed key overrides the address)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{ coffeeshopUlid: "X", process: "washed" }}
        path="/es/offerings"
        fixedQuery={{ coffeeshopUlid: "Y" }}
        texts={TEXTS}
      />,
    );
    expect(block.props?.query).toEqual({ coffeeshopUlid: "Y", process: "washed" });
  });

  it("keeps the fixed key when the address only carries a page (spec: Fixed key survives Clear all and paging)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{ page: "2" }}
        path="/es/offerings"
        fixedQuery={{ coffeeshopUlid: "Y" }}
        texts={TEXTS}
      />,
    );
    expect(block.props?.query).toEqual({ coffeeshopUlid: "Y", page: "2" });
  });

  it("adds the pagination keys to the links only, never to the request (add-coffeeshop-directory spec: Pagination stays on the detail)", () => {
    render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{ process: "washed", tab: "offerings" }}
        path="/es/coffeeshops/01SHOP"
        fixedQuery={{ coffeeshopUlid: "01SHOP" }}
        paginationQuery={{ tab: "offerings" }}
        texts={TEXTS}
      />,
    );
    expect(block.props?.query).toEqual({ process: "washed", coffeeshopUlid: "01SHOP" });
    expect(block.props?.paginationQuery).toEqual({ tab: "offerings" });
  });

  // fix-production-aut-findings design.md D8: a page change runs as a
  // transition (`router.push`), during which React keeps an already revealed
  // boundary on its old content; the list's boundary must show its skeleton
  // at once instead.
  it("shows the skeleton cards at once when another page is requested (spec: Loading state on page change)", async () => {
    const { rerender } = render(
      <FilteredOfferingsResults
        locale="es"
        searchParams={{ page: "1" }}
        path="/es/offerings"
        texts={TEXTS}
      />,
    );
    expect(screen.getByTestId("offerings-block")).toBeDefined();
    block.suspend = true;
    await act(async () => {
      startTransition(() => {
        rerender(
          <FilteredOfferingsResults
            locale="es"
            searchParams={{ page: "2" }}
            path="/es/offerings"
            texts={TEXTS}
          />,
        );
      });
    });
    expect(screen.getAllByTestId("skeleton-card")).toHaveLength(3);
    expect(screen.queryByTestId("offerings-block")).toBeNull();
  });
});
