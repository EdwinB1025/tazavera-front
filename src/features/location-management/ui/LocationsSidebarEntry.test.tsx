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
  it("renders a link to /es/manage/locations with the MapPin icon and its label, current when current", () => {
    render(
      <SidebarMenu>
        <LocationsSidebarEntry locale="es" label="texts.sidebarEntry" current />
      </SidebarMenu>,
    );
    const link = screen.getByRole("link", { name: "texts.sidebarEntry" });
    expect(link.getAttribute("href")).toBe("/es/manage/locations");
    expect(link.querySelector("svg.lucide-map-pin")).not.toBeNull();
    expect(link.textContent).toBe("texts.sidebarEntry");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.getAttribute("data-active")).toBe("true");
  });
});
