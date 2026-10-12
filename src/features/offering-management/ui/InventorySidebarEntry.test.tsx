import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SidebarMenu } from "@/shared/ui";
import { InventorySidebarEntry } from "@/features/offering-management";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The "Explore coffee inventory" sidebar entry (add-inventory-sidebar-entry
 * design.md D1, D2; spec "Management sidebar entry"): one link to the
 * inventory list with the `Compass` icon and its label.
 */
describe("InventorySidebarEntry (add-inventory-sidebar-entry D1)", () => {
  it("Inventory entry navigates: a link to /es/manage/inventory with the Compass icon and its label", () => {
    render(
      <SidebarMenu>
        <InventorySidebarEntry locale="es" label="texts.sidebarExploreInventory" current />
      </SidebarMenu>,
    );
    const link = screen.getByRole("link", { name: "texts.sidebarExploreInventory" });
    expect(link.getAttribute("href")).toBe("/es/manage/inventory");
    expect(link.querySelector("svg.lucide-compass")).not.toBeNull();
    expect(link.textContent).toBe("texts.sidebarExploreInventory");
    expect(link.getAttribute("aria-current")).toBe("page");
  });
});
