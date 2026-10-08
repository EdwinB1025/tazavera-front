import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CoffeeshopsViewToggle } from "./CoffeeshopsViewToggle";

afterEach(() => {
  cleanup();
});

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "city=Barcelona&page=2" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/es/coffeeshops",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

/**
 * The directory's view control (add-coffeeshop-directory design.md D13; spec
 * "Directory view toggle").
 */
describe("CoffeeshopsViewToggle", () => {
  it("writes the map view keeping the filters, sort and page (spec: Switch to the map)", () => {
    render(<CoffeeshopsViewToggle texts={{ viewToggleLabel: "Vista", viewList: "Lista", viewMap: "Mapa" }} />);
    expect(screen.getByRole("radio", { name: "Lista" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "Mapa" }));
    expect(nav.push).toHaveBeenCalledWith("/es/coffeeshops?city=Barcelona&page=2&view=map", { scroll: false });
  });
});
