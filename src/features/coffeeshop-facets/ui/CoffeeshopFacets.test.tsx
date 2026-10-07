import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { CoffeeshopFacets, coffeeshopFacetsTexts, parseCoffeeshopFilters } from "@/features/coffeeshop-facets";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/es/coffeeshops",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  nav.push.mockReset();
});

/**
 * Coffee shop facet panel (add-coffeeshop-directory design.md D5; specs
 * "Coffee shop facets in the sidebar", "Coffee shop filter state in the URL"
 * and "Applied coffee shop filters").
 */

const TEXTS = coffeeshopFacetsTexts(getMessages("coffeeshops", "es"), getMessages("filters", "es"));

function renderPanel(search: string) {
  nav.search = search;
  return render(
    <CoffeeshopFacets values={parseCoffeeshopFilters(new URLSearchParams(search))} texts={TEXTS} />,
  );
}

describe("CoffeeshopFacets", () => {
  it("shows Name, Postal code, City and Verified offerings in order with the chips and Clear all (spec: Facets in order)", () => {
    renderPanel("city=Barcelona");
    const panel = screen.getByRole("search", { name: "Filtros" });
    const facets = [
      screen.getByRole("searchbox", { name: "Nombre" }),
      screen.getByRole("textbox", { name: "Código postal" }),
      screen.getByRole("textbox", { name: "Ciudad" }),
      screen.getByRole("radiogroup", { name: "Ofertas verificadas" }),
    ];
    for (let index = 1; index < facets.length; index++) {
      expect(
        facets[index - 1]!.compareDocumentPosition(facets[index]!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(within(panel).getByText("Ej.: 08012")).toBeDefined();
    expect(within(panel).getByRole("button", { name: "Quitar filtro: Ciudad: Barcelona" })).toBeDefined();
    expect(within(panel).getByRole("button", { name: "Borrar todo" })).toBeDefined();
  });

  it("shows the values of the address (spec: Values from the address)", () => {
    renderPanel("name=nomad&verified=1");
    expect((screen.getByRole("searchbox", { name: "Nombre" }) as HTMLInputElement).value).toBe("nomad");
    const verified = within(screen.getByRole("radiogroup", { name: "Ofertas verificadas" })).getByRole(
      "radio",
      { name: "Con ofertas verificadas", hidden: true },
    ) as HTMLInputElement;
    expect(verified.checked).toBe(true);
  });

  it("writes the postal code, keeping the other keys and dropping the page (spec: Commit a text facet)", () => {
    renderPanel("city=Barcelona&orderBy=name&orderDirection=desc&view=map&page=2");
    const field = screen.getByRole("textbox", { name: "Código postal" });
    fireEvent.change(field, { target: { value: "08012" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(nav.push).toHaveBeenCalledWith(
      "/es/coffeeshops?city=Barcelona&orderBy=name&orderDirection=desc&view=map&postalCode=08012",
      { scroll: false },
    );
  });

  it("removes the name key when the Name facet is emptied (spec: Clear a facet)", () => {
    renderPanel("name=nomad&city=Barcelona");
    const field = screen.getByRole("searchbox", { name: "Nombre" });
    fireEvent.change(field, { target: { value: "" } });
    fireEvent.blur(field);
    expect(nav.push).toHaveBeenCalledWith("/es/coffeeshops?city=Barcelona", { scroll: false });
  });

  it("removes only the postal code and the page with its chip (spec: Remove one chip)", () => {
    renderPanel("postalCode=08012&city=Barcelona&orderBy=name&orderDirection=desc&view=map&page=2");
    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro: Código postal: 08012" }));
    expect(nav.push).toHaveBeenCalledWith(
      "/es/coffeeshops?city=Barcelona&orderBy=name&orderDirection=desc&view=map",
      { scroll: false },
    );
  });

  it("keeps only the sort and the view on Clear all (spec: Clear all)", () => {
    renderPanel("name=nomad&city=Barcelona&verified=1&orderBy=name&orderDirection=desc&view=map");
    fireEvent.click(screen.getByRole("button", { name: "Borrar todo" }));
    expect(nav.push).toHaveBeenCalledWith("/es/coffeeshops?orderBy=name&orderDirection=desc&view=map", {
      scroll: false,
    });
  });
});
