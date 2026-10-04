import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/shared/ui/Sheet";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// The Radix popper and dismissable layer measure and arm on timers jsdom
// lacks. Test infrastructure only: no assertion below depends on it.
beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

/**
 * Sheet tests (design.md D6, D11; spec "Management sidebar" — the full-screen
 * overlay below `md`). Written before the component exists (task 8.2); the
 * import fails to resolve until then, so the file runs and fails as required.
 */
describe("Sheet (design.md D6, D11)", () => {
  function renderSheet() {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">Panel</SheetContent>
      </Sheet>,
    );
  }

  it("opens its content as an overlay from the trigger", () => {
    renderSheet();
    expect(screen.queryByText("Panel")).toBeNull();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Panel")).toBeDefined();
  });

  it("closes when the pointer goes outside it", async () => {
    renderSheet();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    // Radix arms its outside-pointerdown listener on the next tick and defers
    // a left-button dismissal to the click that completes it.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);
    expect(screen.queryByText("Panel")).toBeNull();
  });

  it("covers the screen below md (design.md D11: full-screen overlay)", () => {
    renderSheet();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    const panel = screen.getByText("Panel").parentElement!;
    expect(panel.className).toContain("h-full");
    expect(panel.className).toContain("w-full");
  });

  it("is remapped to semantic and radius tokens only", () => {
    const source = readFileSync(
      pathResolve(process.cwd(), "src/shared/ui/Sheet.tsx"),
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
      pathResolve(process.cwd(), "src/shared/ui/Sheet.tsx"),
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
