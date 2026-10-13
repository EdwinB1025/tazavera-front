import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import {
  InventoryFacets,
  inventoryFacetsTexts,
  parseInventoryFilters,
} from "@/features/inventory-facets";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/en/manage/inventory",
  useSearchParams: () => new URLSearchParams(nav.search),
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

function renderPanel(search: string) {
  nav.search = search;
  return render(
    <InventoryFacets values={parseInventoryFilters(new URLSearchParams(search))} texts={TEXTS} />,
  );
}

describe("InventoryFacets", () => {
  it("Facets in order: six text facets showing the values of the address", async () => {
    renderPanel("coffeeName=geisha&city=Barcelona");
    const facets = [
      await screen.findByRole("combobox", { name: "Coffee name" }),
      screen.getByRole("textbox", { name: "Country" }),
      screen.getByRole("textbox", { name: "Region" }),
      screen.getByRole("textbox", { name: "Process" }),
      screen.getByRole("textbox", { name: "Producer" }),
      screen.getByRole("textbox", { name: "City" }),
    ];
    for (let index = 1; index < facets.length; index++) {
      expect(
        facets[index - 1]!.compareDocumentPosition(facets[index]!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(screen.getAllByRole("textbox")).toHaveLength(5);
    expect((facets[0] as HTMLInputElement).value).toBe("geisha");
    expect((facets[5] as HTMLInputElement).value).toBe("Barcelona");
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
});
