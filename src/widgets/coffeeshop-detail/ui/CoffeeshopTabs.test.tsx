import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CoffeeshopTabs } from "./CoffeeshopTabs";

afterEach(() => {
  cleanup();
});

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

/**
 * The detail's tabs (add-coffeeshop-directory design.md D8; spec "Coffee shop
 * detail tabs in the address").
 */
describe("CoffeeshopTabs", () => {
  it("shows the other panel and pushes its tab at the same route (spec: Switching tabs)", () => {
    render(
      <CoffeeshopTabs
        active="offerings"
        locale="es"
        ulid="01SHOP"
        labels={{ offerings: "Ofertas", locations: "Ubicaciones" }}
        offerings={<p>offerings panel</p>}
        locations={<p>locations panel</p>}
      />,
    );
    const tab = screen.getByRole("tab", { name: "Ubicaciones" });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    expect(router.push).toHaveBeenCalledWith("/es/coffeeshops/01SHOP?tab=locations");
    expect(screen.getByText("locations panel")).toBeDefined();
    expect(screen.queryByText("offerings panel")).toBeNull();
  });
});
