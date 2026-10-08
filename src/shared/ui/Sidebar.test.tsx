import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SIDEBAR_ID,
  SidebarMenuButton,
} from "@/shared/ui/Sidebar";
import { Check } from "@/shared/ui/icons";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  mobile = false;
});

// matchMedia mock whose viewport can be switched per case; listeners are
// notified so `useIsMobile` re-reads it. Test infrastructure only.
let mobile = false;
const mediaListeners = new Set<() => void>();
function setMobile(value: boolean) {
  mobile = value;
  act(() => {
    for (const listener of mediaListeners) listener();
  });
}

// Test infrastructure only (the Radix measurements and timers jsdom lacks,
// and matchMedia, which the sidebar reads the md breakpoint through).
beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = ((query: string) => ({
    matches: mobile,
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: () => void) =>
      mediaListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      mediaListeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

/**
 * Sidebar tests (design.md D6, D11; spec "Management sidebar" — collapsible
 * from `md`). Written before the component exists (task 8.2); the import
 * fails to resolve until then, so the file runs and fails as required.
 */
describe("Sidebar (design.md D6, D11)", () => {
  function renderSidebar() {
    render(
      <SidebarProvider>
        <Sidebar>Navigation</Sidebar>
        <SidebarTrigger>Toggle</SidebarTrigger>
      </SidebarProvider>,
    );
  }

  it("is collapsible from md (design.md D11)", () => {
    renderSidebar();
    const toggle = screen.getByRole("button", { name: "Toggle" });
    fireEvent.click(toggle);
    // collapsed: the trigger reports the state change
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders a labelled aside expanded on arrival from md (design.md D3, D8)", () => {
    render(
      <SidebarProvider>
        <Sidebar label="Sidebar">Navigation</Sidebar>
        <SidebarTrigger>Toggle</SidebarTrigger>
      </SidebarProvider>,
    );
    const aside = screen.getByRole("complementary", { name: "Sidebar" });
    expect(aside.tagName).toBe("ASIDE");
    expect(aside.id).toBe(SIDEBAR_ID);
    expect(aside.className).toContain("variant-inverse");
    expect(
      screen.getByRole("button", { name: "Toggle" }).getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("is closed on arrival below md and opens as a dialog (design.md D3, D8)", () => {
    mobile = true;
    render(
      <SidebarProvider>
        <Sidebar label="Sidebar">Navigation</Sidebar>
        <SidebarTrigger>Toggle</SidebarTrigger>
      </SidebarProvider>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Toggle" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    const dialog = screen.getByRole("dialog");
    expect(dialog.id).toBe(SIDEBAR_ID);
    const inner = screen.getByText("Navigation");
    expect(dialog.contains(inner)).toBe(true);
    expect(inner.className).toContain("variant-inverse");
    // the mobile toggle leaves the desktop state untouched
    setMobile(false);
    expect(screen.getByRole("complementary", { name: "Sidebar" })).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Toggle" }).getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("renders the entry as its child link with asChild (design.md D7)", () => {
    const { container } = render(
      <SidebarMenuButton asChild isActive icon={Check}>
        {/* A plain anchor stands for the area's link (task 3.1). */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/es/manage/offerings" aria-current="page">
          Offerings
        </a>
      </SidebarMenuButton>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    const link = screen.getByRole("link", { name: "Offerings" });
    expect(link.getAttribute("href")).toBe("/es/manage/offerings");
    expect(link.className).toContain("type-sidebar-item");
    expect(link.className).toContain("hover:bg-nav-hover");
    expect(link.className).toContain("hover:text-nav-text-hover");
    expect(link.getAttribute("data-active")).toBe("true");
    expect(link.getAttribute("aria-current")).toBe("page");
    const icon = link.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(link.firstChild).toBe(icon);
    expect(link.lastChild?.textContent).toBe("Offerings");
    expect(container.firstChild).toBe(link);
  });
});
