import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ShowOnMapButton } from "@/widgets/coffeeshop-list/ui/ShowOnMapButton";

afterEach(() => {
  cleanup();
});

const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/es/coffeeshops",
  useSearchParams: () => new URLSearchParams("city=Barcelona&orderBy=name&orderDirection=desc&page=2"),
}));

/**
 * The card's map action (add-coffeeshop-directory design.md D13; spec "Show a
 * coffee shop on the map").
 */
describe("ShowOnMapButton", () => {
  it("opens the map view focused on the coffee shop, keeping the query (spec: Focus from a card)", () => {
    render(<ShowOnMapButton ulid="01SHOP" name="Nomad Coffee" label="Ver {name} en el mapa" />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Nomad Coffee en el mapa" }));
    expect(nav.push).toHaveBeenCalledWith(
      "/es/coffeeshops?city=Barcelona&orderBy=name&orderDirection=desc&page=2&view=map&focus=01SHOP",
      { scroll: false },
    );
  });
});
