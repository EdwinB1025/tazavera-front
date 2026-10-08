import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { OfferingFacets, offeringFacetsTexts } from "@/features/offering-facets";
import { parseOfferingFilters } from "../model/query";
import { appliedOfferingFilters } from "../model/applied";
import type { OfferingFacetOptions } from "../model/options";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/en/offerings",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

vi.mock("../api/search-coffees", () => ({
  searchCoffees: async () => [
    {
      value: "Huila El Mirador",
      label: "Huila El Mirador",
      detail: "Colombia · Huila · washed · Caturra",
    },
  ],
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver; Radix Slider and Popover measure with one.
// cmdk scrolls the active option into view, which jsdom lacks too.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

beforeEach(() => {
  nav.push.mockReset();
  nav.search = "";
});

/**
 * Offering facet panel (design.md D7; spec "Offering facets in the sidebar",
 * "Offering facet options unavailable", "Offering filter state in the URL",
 * "Applied offering filters").
 */

const TEXTS = offeringFacetsTexts(getMessages("filters", "en"));

const OPTIONS: OfferingFacetOptions = {
  countries: ["Colombia", "Ethiopia"],
  regions: ["Huila", "Sidama"],
  processes: ["natural", "washed"],
  varieties: ["Caturra"],
  producers: ["Bensa"],
  tasteNotes: [{ value: "F", label: "Fruity", children: [{ value: "B", label: "Berry" }] }],
};

function renderPanel(search: string, options: OfferingFacetOptions = OPTIONS) {
  nav.search = search;
  const values = parseOfferingFilters(new URLSearchParams(search));
  return render(<OfferingFacets values={values} options={options} texts={TEXTS} />);
}

function radio(group: string, name: string): HTMLInputElement {
  return within(screen.getByRole("radiogroup", { name })).getByRole("radio", {
    name: group,
    hidden: true,
  }) as HTMLInputElement;
}

describe("OfferingFacets (design.md D7)", () => {
  it("shows the eleven facets in the spec order", () => {
    renderPanel("");
    const facets = [
      screen.getByRole("combobox", { name: "Coffee" }),
      screen.getByRole("radiogroup", { name: "Verification" }),
      screen.getByRole("group", { name: "Average score" }),
      screen.getByRole("group", { name: "Taste notes" }),
      screen.getByRole("radiogroup", { name: "Origin country" }),
      screen.getByRole("radiogroup", { name: "Origin region" }),
      screen.getByRole("radiogroup", { name: "Process" }),
      screen.getByRole("radiogroup", { name: "Variety" }),
      screen.getByRole("combobox", { name: "Producer" }),
      screen.getByRole("combobox", { name: "Roastery" }),
      screen.getByRole("textbox", { name: "City" }),
    ];
    for (let index = 1; index < facets.length; index += 1) {
      expect(
        facets[index - 1]!.compareDocumentPosition(facets[index]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("writes the chosen coffee's name to coffeeName without page", async () => {
    renderPanel("page=2");
    fireEvent.change(screen.getByRole("combobox", { name: "Coffee" }), {
      target: { value: "hui" },
    });
    fireEvent.click(await screen.findByRole("option", { name: /Huila El Mirador/ }));
    expect(nav.push).toHaveBeenCalledWith("/en/offerings?coffeeName=Huila+El+Mirador", {
      scroll: false,
    });
  });

  it("shows the values of its props as selected", () => {
    renderPanel("verified=1&process=washed&cuppingAvgMin=80");
    expect(radio("Verified", "Verification").checked).toBe(true);
    expect(radio("washed", "Process").checked).toBe(true);
    expect(radio("Any", "Origin country").checked).toBe(true);
    expect((screen.getByRole("spinbutton", { name: "From" }) as HTMLInputElement).value).toBe("80");
    expect((screen.getByRole("spinbutton", { name: "To" }) as HTMLInputElement).value).toBe("100");
  });

  it("navigates to the new query without page when a process is chosen", () => {
    renderPanel("process=washed&page=3");
    fireEvent.click(radio("natural", "Process"));
    expect(nav.push).toHaveBeenCalledWith("/en/offerings?process=natural", { scroll: false });
  });

  it("disables the five coffee-based facets with Options unavailable when the coffees fail", () => {
    renderPanel("", {
      ...OPTIONS,
      countries: null,
      regions: null,
      processes: null,
      varieties: null,
      producers: null,
    });
    for (const name of ["Origin country", "Origin region", "Process", "Variety"]) {
      const group = screen.getByRole("radiogroup", { name });
      for (const input of within(group).getAllByRole("radio", { hidden: true })) {
        expect((input as HTMLInputElement).disabled).toBe(true);
      }
    }
    expect((screen.getByRole("combobox", { name: "Producer" }) as HTMLInputElement).disabled).toBe(
      true,
    );
    expect(screen.getAllByText("Options unavailable")).toHaveLength(5);
    expect((screen.getByRole("combobox", { name: "Coffee" }) as HTMLInputElement).disabled).toBe(
      false,
    );
  });

  it("disables Taste notes with Options unavailable when the taxonomy fails", () => {
    renderPanel("", { ...OPTIONS, tasteNotes: null });
    const group = screen.getByRole("group", { name: "Taste notes" });
    expect(within(group).getByText("Options unavailable")).toBeDefined();
    expect(screen.getAllByText("Options unavailable")).toHaveLength(1);
  });

  it("shows the applied chips, removes one and clears all keeping the sort", () => {
    const search = "process=washed&originCountry=Colombia&cataRef=B&orderBy=cupping_avg&orderDirection=desc";
    renderPanel(search);
    const applied = appliedOfferingFilters(parseOfferingFilters(new URLSearchParams(search)), {
      tasteNotes: OPTIONS.tasteNotes,
      texts: TEXTS,
    });
    for (const entry of applied) {
      expect(
        screen.getByRole("button", { name: `Remove filter: ${entry.facet}: ${entry.value}` }),
      ).toBeDefined();
    }
    fireEvent.click(screen.getByRole("button", { name: "Remove filter: Process: washed" }));
    expect(nav.push).toHaveBeenLastCalledWith(
      "/en/offerings?originCountry=Colombia&cataRef=B&orderBy=cupping_avg&orderDirection=desc",
      { scroll: false },
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(nav.push).toHaveBeenLastCalledWith(
      "/en/offerings?orderBy=cupping_avg&orderDirection=desc",
      { scroll: false },
    );
  });

  it("shows no chips and no Clear all without filters", () => {
    renderPanel("orderBy=cupping_avg&orderDirection=desc");
    expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
  });
});
