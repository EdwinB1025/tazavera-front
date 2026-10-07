import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

  it("covers the screen below md (design.md D11: full-screen overlay)", () => {
    renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    // the panel is the element holding the content
    const panel = screen.getByText("Panel");
    expect(panel.className).toContain("h-full");
    expect(panel.className).toContain("w-full");
  });
});
