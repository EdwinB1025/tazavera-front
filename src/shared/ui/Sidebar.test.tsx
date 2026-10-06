import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SIDEBAR_ID,
  useSidebar,
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

  it("renders the entry as its child link with asChild (design.md D7)", () => {
    const { container } = render(
      <SidebarMenuButton asChild isActive icon={Check}>
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

  it("takes its icons from the shared icon entry point", () => {
    const source = readFileSync(
      pathResolve(process.cwd(), "src/shared/ui/Sidebar.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/from\s+["']lucide-react/);
  });

  it("leaves no generated shadcn control duplicates in src/shared/ui", () => {
    const entries = readdirSync(pathResolve(process.cwd(), "src/shared/ui"));
    for (const duplicate of [
      "button.tsx",
      "input.tsx",
      "select.tsx",
      "checkbox.tsx",
      "radio.tsx",
      "textarea.tsx",
    ]) {
      expect(entries, `${duplicate} duplicates a project control`).not.toContain(
        duplicate,
      );
    }
  });
});
