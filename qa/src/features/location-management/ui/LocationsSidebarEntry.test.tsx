import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SidebarMenu } from "@/shared/ui";
import { LocationsSidebarEntry } from "@/features/location-management";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The "Manage locations" sidebar entry (design.md D8; spec "Management
 * sidebar entry"): one link to the locations route with the `MapPin` icon
 * and its label, marked current only when `current`.
 */
describe("LocationsSidebarEntry (design.md D8)", () => {
  it("has no aria-current and no active state when not current", () => {
    render(
      <SidebarMenu>
        <LocationsSidebarEntry locale="es" label="texts.sidebarEntry" current={false} />
      </SidebarMenu>,
    );
    const link = screen.getByRole("link", { name: "texts.sidebarEntry" });
    expect(link.hasAttribute("aria-current")).toBe(false);
    expect(link.getAttribute("data-active")).toBe("false");
  });
});
