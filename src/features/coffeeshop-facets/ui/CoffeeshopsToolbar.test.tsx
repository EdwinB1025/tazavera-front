import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { SidebarProvider } from "@/shared/ui";
import { CoffeeshopsToolbar, coffeeshopFacetsTexts } from "@/features/coffeeshop-facets";

const nav = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/es/coffeeshops",
  useSearchParams: () => new URLSearchParams("city=Barcelona&page=2"),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  nav.push.mockReset();
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

/**
 * Coffee shop toolbar (add-coffeeshop-directory design.md D6; specs "Coffee
 * shop filter toolbar" and "Coffee shop sort").
 */

const TEXTS = coffeeshopFacetsTexts(getMessages("coffeeshops", "es"), getMessages("filters", "es"));

function renderToolbar(count: number) {
  return render(
    <SidebarProvider>
      <CoffeeshopsToolbar count={count} sort="name-asc" texts={TEXTS} />
    </SidebarProvider>,
  );
}

describe("CoffeeshopsToolbar", () => {
  it("counts the applied filters on the trigger (spec: Trigger count)", () => {
    renderToolbar(2);
    expect(screen.getByRole("button", { name: "Filtros (2)" })).toBeDefined();
  });

  it("keeps the trigger and the view control in one group and gives the sort a full-width wrapping row below md (spec: Toolbar wraps on a small viewport)", () => {
    render(
      <SidebarProvider>
        <CoffeeshopsToolbar count={0} sort="name-asc" texts={TEXTS} viewSlot={<div data-testid="view" />} />
      </SidebarProvider>,
    );
    const start = screen.getByTestId("view").parentElement!;
    expect(start.contains(screen.getByRole("button", { name: "Filtros" }))).toBe(true);
    const toolbar = start.parentElement!;
    const sort = toolbar.lastElementChild!;
    expect(sort.contains(screen.getByRole("combobox", { name: "Ordenar por" }))).toBe(true);
    expect(sort.classList.contains("w-full")).toBe(true);
    expect(toolbar.classList.contains("flex-wrap")).toBe(true);
  });

  it("writes the descending name order and drops the page (spec: Reverse order)", () => {
    renderToolbar(0);
    fireEvent.change(screen.getByRole("combobox", { name: "Ordenar por" }), {
      target: { value: "name-desc" },
    });
    expect(nav.push).toHaveBeenCalledWith(
      "/es/coffeeshops?city=Barcelona&orderBy=name&orderDirection=desc",
      { scroll: false },
    );
  });
});
