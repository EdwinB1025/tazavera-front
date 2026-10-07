import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { SidebarProvider } from "@/shared/ui";
import { OfferingsToolbar, offeringFacetsTexts, parseOfferingFilters } from "@/features/offering-facets";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/en/offerings",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// Below md, so the trigger always renders. Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  nav.push.mockReset();
  nav.search = "";
});

const TEXTS = offeringFacetsTexts(getMessages("filters", "en"));

function renderToolbar(search: string, count = 0) {
  nav.search = search;
  const { sort } = parseOfferingFilters(new URLSearchParams(search));
  render(
    <SidebarProvider>
      <OfferingsToolbar count={count} sort={sort} texts={TEXTS} />
    </SidebarProvider>,
  );
  return screen.getByRole("combobox", { name: "Sort by" }) as HTMLSelectElement;
}

/** The offerings body toolbar (design.md D6, D8; spec "Offering sort", "Offerings filter toolbar"). */
describe("OfferingsToolbar (design.md D8)", () => {
  it("reads Filters without applied values and Filters (2) with two", () => {
    renderToolbar("");
    expect(screen.getByRole("button", { name: "Filters" })).toBeDefined();
    cleanup();
    renderToolbar("", 2);
    expect(screen.getByRole("button", { name: "Filters (2)" })).toBeDefined();
  });

  it("lists the six sort options in order", () => {
    const select = renderToolbar("");
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Default order",
      "Highest score",
      "Lowest score",
      "Most evaluated",
      "Newest",
      "Oldest",
    ]);
  });

  it("selects the current sort", () => {
    const select = renderToolbar("orderBy=cupping_avg&orderDirection=desc");
    expect(select.value).toBe("score-desc");
  });

  it("writes both sort keys without page", () => {
    const select = renderToolbar("process=washed&page=2");
    fireEvent.change(select, { target: { value: "most-evaluated" } });
    expect(nav.push).toHaveBeenCalledWith(
      "/en/offerings?process=washed&orderBy=evaluation_count&orderDirection=desc",
      { scroll: false },
    );
  });

  it("starts the sort field at 12rem and lets it grow to 16rem, so the toolbar keeps one row at 375px", () => {
    const select = renderToolbar("", 1);
    const field = select.closest("div.grow");
    expect(field).not.toBeNull();
    expect(field!.className.split(" ")).toEqual(
      expect.arrayContaining(["basis-48", "min-w-48", "max-w-64", "grow", "ml-auto"]),
    );
  });

  it("removes both keys for Default order", () => {
    const select = renderToolbar("orderBy=cupping_avg&orderDirection=desc&city=Lima");
    fireEvent.change(select, { target: { value: "default" } });
    expect(nav.push).toHaveBeenCalledWith("/en/offerings?city=Lima", { scroll: false });
  });
});
