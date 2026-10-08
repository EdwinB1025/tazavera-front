import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { SidebarProvider, Sidebar, SidebarTrigger, useSidebar, SidebarMenuButton } from "@/shared/ui/Sidebar";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  mobile = false;
});

// matchMedia mock whose viewport can be switched per case; listeners are
// notified so `useIsMobile` re-reads it. Test infrastructure only.
let mobile = false;
const mediaListeners = new Set<() => void>();

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
  it("reports whether a sidebar is mounted (design.md D3)", () => {
    function Probe() {
      const { present } = useSidebar();
      return <p>{present ? "present" : "absent"}</p>;
    }
    const { rerender } = render(
      <SidebarProvider>
        <Probe />
      </SidebarProvider>,
    );
    expect(screen.getByText("absent")).toBeDefined();
    rerender(
      <SidebarProvider>
        <Probe />
        <Sidebar label="Sidebar">Navigation</Sidebar>
        <SidebarTrigger>Toggle</SidebarTrigger>
      </SidebarProvider>,
    );
    expect(screen.getByText("present")).toBeDefined();
    // collapsed from md it renders nothing but stays registered
    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.getByText("present")).toBeDefined();
    rerender(
      <SidebarProvider>
        <Probe />
      </SidebarProvider>,
    );
    expect(screen.getByText("absent")).toBeDefined();
  });

  it("renders the entry as a button with the hover label (design.md D7)", () => {
    render(<SidebarMenuButton>Offerings</SidebarMenuButton>);
    const button = screen.getByRole("button", { name: "Offerings" });
    expect(button.className).toContain("hover:bg-nav-hover");
    expect(button.className).toContain("hover:text-nav-text-hover");
  });

  it("is remapped to semantic and radius tokens only", () => {
    const source = readFileSync(
      pathResolve(process.cwd(), "src/shared/ui/Sidebar.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(
      /-(cream|sage|petrol|moss|chartreuse|oxblood|brown|score|night|brand)-/,
    );
    for (const match of source.matchAll(
      /(?<![\w-])((?:[a-z-]+:)*rounded(?:-[a-z0-9]+)?(?:-\[[^\]]+\])?)/g,
    )) {
      const bare = match[1]!.replace(/^[a-z-]+:/, "");
      expect(
        ["rounded-pill", "rounded-container", "rounded-field", "rounded-check", "rounded-full", "rounded-none"],
        `${match[1]!} is not a radius token`,
      ).toContain(bare);
    }
  });
});
