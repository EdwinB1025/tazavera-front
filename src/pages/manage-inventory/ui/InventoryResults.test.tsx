import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act, within } from "@testing-library/react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { SidebarProvider } from "@/shared/ui";
import {
  InventoryFacets,
  inventoryFacetsTexts,
  parseInventoryFilters,
} from "@/features/inventory-facets";

// The token client and the router are replaced by spies. Test
// infrastructure only.
const mocks = vi.hoisted(() => ({ request: vi.fn(), push: vi.fn(), search: "" }));
vi.mock("@/shared/api", () => ({
  publicRequest: vi.fn(),
  request: mocks.request,
}));
// The skeleton card's widget also exports actions that read the session.
vi.mock("@/features/auth", () => ({ useSession: vi.fn(), signIn: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/en/manage/inventory",
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

import { InventoryResults } from "./InventoryResults";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  mocks.request.mockReset();
  mocks.push.mockReset();
  // jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

/**
 * The inventory results with their filters (add-coffee-inventory-explorer
 * design.md D5, D6; specs "Inventory filter state in the URL", "Inventory
 * filter toolbar" and "Filtered inventory results").
 */

const FACET_TEXTS = inventoryFacetsTexts(
  getMessages("offering-management", "en"),
  getMessages("filters", "en"),
);

const TEXTS = {
  empty: "There is no coffee in the inventory.",
  error: "The coffee inventory could not be loaded.",
  retry: "Retry",
  view: "View",
  createOffering: "Create offering",
  process: "Process",
  variety: "Variety",
  roastLevel: "Roast level",
  altitude: "Altitude",
  producer: "Producer",
  certifications: "Certifications",
  roastery: "Roastery",
  roastLot: "Roast lot",
  productionDate: "Production date",
  trigger: "Filters",
  triggerWithCount: "Filters ({count})",
  noMatches: "No results match these filters.",
  clearAll: "Clear all",
  resultCount: "Results: {count}",
};

const ITEM: CoffeeInventoryItem = {
  ulid: "01K5Y4R7N2D9W6T3H8M1Q5V0XC",
  roastLot: "L-2026-014",
  productionDate: "2026-09-19",
  coffee: { name: "Huila El Mirador", country: "Colombia", region: "Huila", certifications: [] },
  roastery: { name: "Nómada Roasters" },
};

function answer(data: CoffeeInventoryItem[]) {
  return { ok: true, status: 200, json: async () => ({ data }) };
}

const OPTIONS = {
  countries: ["Colombia", "Ethiopia"],
  regions: ["Huila", "Nariño", "Yirgacheffe"],
  regionsByCountry: { Colombia: ["Huila", "Nariño"], Ethiopia: ["Yirgacheffe"] },
  processes: ["natural", "washed"],
};

/** The list and its facets for an address, as the route renders them. */
function page(search: string) {
  mocks.search = search;
  const values = parseInventoryFilters(new URLSearchParams(search));
  const count = Object.keys(values).length;
  return (
    <SidebarProvider>
      <InventoryFacets values={values} options={OPTIONS} texts={FACET_TEXTS} />
      <InventoryResults locale="en" query={values} count={count} texts={TEXTS} />
    </SidebarProvider>
  );
}

describe("InventoryResults with the inventory facets", () => {
  it("Commit a text facet: the address carries originRegion and the read is sent with it", async () => {
    mocks.request.mockResolvedValue(answer([ITEM]));
    const { rerender } = render(page("originCountry=Colombia"));
    await act(async () => {});

    fireEvent.click(
      within(screen.getByRole("radiogroup", { name: "Region" })).getByRole("radio", { name: "Huila" }),
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/en/manage/inventory?originCountry=Colombia&originRegion=Huila",
      { scroll: false },
    );
    rerender(page("originCountry=Colombia&originRegion=Huila"));
    await act(async () => {});
    expect(mocks.request.mock.calls.at(-1)![0]).toBe(
      "/coffeeInventory?originCountry=Colombia&originRegion=Huila",
    );
  });

  it("Out-of-range value in the address: neither it nor an unknown key reaches the API", async () => {
    mocks.request.mockResolvedValue(answer([ITEM]));
    render(page(`city=${"a".repeat(91)}&foo=bar`));
    await act(async () => {});

    expect(mocks.request.mock.calls[0]![0]).toBe("/coffeeInventory");
    expect((screen.getByRole("textbox", { name: "Roastery city" }) as HTMLInputElement).value).toBe("");
  });

  it("Trigger count: Filters (2) and no sort control", async () => {
    mocks.request.mockResolvedValue(answer([ITEM]));
    render(page("process=washed&city=Barcelona"));
    await act(async () => {});

    expect(screen.getByRole("button", { name: "Filters (2)" })).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: "Sort by" })).toBeNull();
  });

  it("Filtered empty: no matches and Clear all, not the empty message", async () => {
    mocks.request.mockResolvedValue(answer([]));
    render(page("process=washed"));

    expect(await screen.findByText(TEXTS.noMatches)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: TEXTS.clearAll }).length).toBeGreaterThan(0);
    expect(screen.queryByText(TEXTS.empty)).toBeNull();
  });

  it("Result count announced: Results: 2", async () => {
    mocks.request.mockResolvedValue(answer([ITEM, { ...ITEM, ulid: "01OTHER" }]));
    render(page(""));
    await act(async () => {});

    expect(screen.getByText("Results: 2").getAttribute("role")).toBe("status");
  });
});
