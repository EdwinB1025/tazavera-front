import { describe, it, expect, afterEach, vi } from "vitest";
import type { ReactElement } from "react";
import { render, cleanup, screen } from "@testing-library/react";
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
  verifiedLabel: "verifiedLabel",
  provisionalLabel: "provisionalLabel",
  ratingExceptionalLabel: "ratingExceptionalLabel",
  ratingExcellentLabel: "ratingExcellentLabel",
  ratingGoodLabel: "ratingGoodLabel",
  ratingCommercialLabel: "ratingCommercialLabel",
  previousLabel: "previousLabel",
  nextLabel: "nextLabel",
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
