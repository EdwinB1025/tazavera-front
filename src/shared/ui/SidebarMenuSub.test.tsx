import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SidebarProvider } from "@/shared/ui/Sidebar";
import { SidebarMenuSub } from "@/shared/ui/SidebarMenuSub";

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

function renderSub() {
  render(
    <SidebarProvider>
      <SidebarMenuSub title="Filtros">
        <p>facets</p>
      </SidebarMenuSub>
    </SidebarProvider>,
  );
  return screen.getByRole("button", { name: "Filtros" });
}

/** Sidebar entry sub-section (collapse-sidebar-filters; spec app-shell "Sidebar entry sub-section"). */
describe("SidebarMenuSub (collapse-sidebar-filters)", () => {
  it("starts collapsed (spec: Closed by default)", () => {
    expect(renderSub().getAttribute("aria-expanded")).toBe("false");
  });

  it("expands when its toggle is activated (spec: Opens on its toggle)", () => {
    const toggle = renderSub();
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });
});
