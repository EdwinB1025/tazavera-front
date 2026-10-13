import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import {
  InventoryFacets,
  inventoryFacetsTexts,
  parseInventoryFilters,
  type InventoryFacetOptions,
} from "@/features/inventory-facets";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/en/manage/inventory",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

vi.mock("@/entities/coffee/api/search-coffees", () => ({
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

// jsdom has no ResizeObserver; the combobox's popover measures with one.
// cmdk scrolls the active option into view, which jsdom lacks too, and
// matchMedia is missing as well. Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
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
});

/**
 * The inventory facet panel (add-coffee-inventory-explorer design.md D5;
 * specs "Inventory facets in the sidebar" and "Applied inventory filters").
 */

const TEXTS = inventoryFacetsTexts(
  getMessages("offering-management", "en"),
  getMessages("filters", "en"),
);

const OPTIONS = {
  countries: ["Colombia", "Ethiopia"],
  regions: ["Huila", "Nariño", "Yirgacheffe"],
  regionsByCountry: { Colombia: ["Huila", "Nariño"], Ethiopia: ["Yirgacheffe"] },
  processes: ["natural", "washed"],
};

const UNAVAILABLE: InventoryFacetOptions = {
  countries: null,
  regions: null,
  regionsByCountry: null,
  processes: null,
};

function choose(facet: string, option: string) {
  fireEvent.click(
    within(screen.getByRole("radiogroup", { name: facet })).getByRole("radio", { name: option }),
  );
}

function commitCity(value: string) {
  const city = screen.getByRole("textbox", { name: "Roastery city" });
  fireEvent.change(city, { target: { value } });
  fireEvent.keyDown(city, { key: "Enter" });
}

function renderPanel(search: string, options: InventoryFacetOptions = OPTIONS) {
  nav.search = search;
  return render(
    <InventoryFacets
      values={parseInventoryFilters(new URLSearchParams(search))}
      options={options}
      texts={TEXTS}
    />,
  );
}

describe("InventoryFacets", () => {
  it("Facets in order: six facets showing the values of the address", async () => {
    renderPanel("coffeeName=geisha&city=Barcelona");
    const facets = [
      await screen.findByRole("combobox", { name: "Coffee name" }),
      screen.getByRole("radiogroup", { name: "Country" }),
      screen.getByRole("radiogroup", { name: "Region" }),
      screen.getByRole("radiogroup", { name: "Process" }),
      screen.getByRole("textbox", { name: "Producer" }),
      screen.getByRole("textbox", { name: "Roastery city" }),
    ];
    for (let index = 1; index < facets.length; index++) {
      expect(
        facets[index - 1]!.compareDocumentPosition(facets[index]!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect((facets[0] as HTMLInputElement).value).toBe("geisha");
    expect((facets[5] as HTMLInputElement).value).toBe("Barcelona");
  });

  it("Choosing a coffee name: writes coffeeName and keeps the other filters", async () => {
    renderPanel("originCountry=Colombia");
    fireEvent.change(await screen.findByRole("combobox", { name: "Coffee name" }), {
      target: { value: "hui" },
    });
    fireEvent.click(await screen.findByRole("option", { name: /Huila El Mirador/ }));
    expect(nav.push).toHaveBeenCalledWith(
      "/en/manage/inventory?originCountry=Colombia&coffeeName=Huila+El+Mirador",
      { scroll: false },
    );
  });

  it("Remove one chip: drops only its key", () => {
    renderPanel("process=washed&originCountry=Colombia");
    fireEvent.click(screen.getByRole("button", { name: "Remove filter: Process: washed" }));
    expect(nav.push).toHaveBeenCalledWith("/en/manage/inventory?originCountry=Colombia", {
      scroll: false,
    });
  });

  it("Clear all: the bare inventory path", () => {
    renderPanel("process=washed&originCountry=Colombia&city=Barcelona");
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(nav.push).toHaveBeenCalledWith("/en/manage/inventory", { scroll: false });
  });

  it("Choosing a country: writes originCountry and keeps process", () => {
    renderPanel("process=washed");
    choose("Country", "Colombia");
    expect(nav.push).toHaveBeenCalledWith(
      "/en/manage/inventory?process=washed&originCountry=Colombia",
      { scroll: false },
    );
  });

  it("Regions narrowed by the country: only Colombia's regions, and Ethiopia drops the region", () => {
    renderPanel("originCountry=Colombia&originRegion=Huila");
    const region = within(screen.getByRole("radiogroup", { name: "Region" }));
    expect(region.getAllByRole("radio")).toHaveLength(3);
    expect(region.queryByRole("radio", { name: "Yirgacheffe" })).toBeNull();
    choose("Country", "Ethiopia");
    expect(nav.push).toHaveBeenCalledWith("/en/manage/inventory?originCountry=Ethiopia", {
      scroll: false,
    });
  });

  it("Choosing a process: writes process and keeps the other filters", () => {
    renderPanel("originCountry=Colombia");
    choose("Process", "washed");
    expect(nav.push).toHaveBeenCalledWith(
      "/en/manage/inventory?originCountry=Colombia&process=washed",
      { scroll: false },
    );
  });

  it("Roastery city label: the City facet writes city", () => {
    renderPanel("");
    commitCity("Barcelona");
    expect(nav.push).toHaveBeenCalledWith("/en/manage/inventory?city=Barcelona", { scroll: false });
  });

  it("Coffee catalog fails: the three list facets are disabled, the text facets keep working", () => {
    renderPanel("", UNAVAILABLE);
    for (const facet of ["Country", "Region", "Process"]) {
      const group = screen.getByRole("radiogroup", { name: facet });
      expect((within(group).getByRole("radio", { name: "Any" }) as HTMLInputElement).disabled).toBe(true);
    }
    expect(screen.getAllByText("Options unavailable")).toHaveLength(3);
    commitCity("Barcelona");
    expect(nav.push).toHaveBeenCalledWith("/en/manage/inventory?city=Barcelona", { scroll: false });
  });
});
