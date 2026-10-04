import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@/shared/ui/Sidebar";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// Test infrastructure only (the Radix measurements and timers jsdom lacks,
// and matchMedia, which the sidebar reads the md breakpoint through).
beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
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
