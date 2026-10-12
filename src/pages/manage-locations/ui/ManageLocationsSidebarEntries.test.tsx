import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider } from "@/widgets/app-sidebar";
import { ManageLocationsSidebarEntries } from "@/pages/manage-locations";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
// Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/es/manage/locations",
}));

const SESSION: Session = {
  state: "authenticated",
  user: { name: "Lucía", surname: "Pérez", role: "coffeeshop" },
};

/**
 * The locations route's sidebar (design.md D8; spec "Management sidebar
 * entry"): "Manage offerings" then "Manage locations", only the second
 * marked as the current entry.
 */
describe("ManageLocationsSidebarEntries (design.md D8)", () => {
  it("renders Manage offerings, Manage locations and Explore coffee inventory, only the second current", () => {
    render(
      <SidebarProvider>
        <AppSidebarProvider session={SESSION} toggleLabel="sidebar.toggle">
          <ManageLocationsSidebarEntries locale="es" />
        </AppSidebarProvider>
      </SidebarProvider>,
    );
    const offerings = screen.getByRole("link", { name: "Administrar ofertas" });
    const entries = Array.from(offerings.closest("ul")!.querySelectorAll("a"));
    expect(entries.map((a) => a.textContent)).toEqual([
      "Administrar ofertas",
      "Administrar ubicaciones",
      "Explorar inventario de café",
    ]);
    expect(entries.map((a) => a.getAttribute("href"))).toEqual([
      "/es/manage/offerings",
      "/es/manage/locations",
      "/es/manage/inventory",
    ]);
    expect(entries[0].hasAttribute("aria-current")).toBe(false);
    expect(entries[1].getAttribute("aria-current")).toBe("page");
    expect(entries[2].hasAttribute("aria-current")).toBe(false);
  });
});
