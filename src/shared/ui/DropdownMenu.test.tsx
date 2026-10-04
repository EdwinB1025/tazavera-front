import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/ui/DropdownMenu";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// The Radix popper measures through ResizeObserver, which jsdom lacks. Test
// infrastructure only: no assertion below depends on it.
beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

/**
 * Dropdown menu tests (design.md D6; spec "Signed-in header and user menu"
 * closing behaviour). Written before the component exists (task 7.2); the
 * import fails to resolve until then, so the file runs and fails as required.
 *
 * jsdom has no CSS engine: the token remap is asserted on the source (no
 * literal colors, no primitive families, only allowlisted radii) and the
 * icon entry point and the absence of generated shadcn control duplicates on
 * the file set of `src/shared/ui`.
 */
describe("DropdownMenu (design.md D6)", () => {
  function renderMenu() {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuItem onSelect={onSelect}>Entry</DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    return { onSelect };
  }

  it("opens its content from the trigger", () => {
    renderMenu();
    expect(screen.queryByRole("menuitem", { name: "Entry" })).toBeNull();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("menuitem", { name: "Entry" })).toBeDefined();
  });

  it("closes after choosing an entry", () => {
    const { onSelect } = renderMenu();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Entry" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: "Entry" })).toBeNull();
  });

  it("closes when the pointer goes outside it", async () => {
    renderMenu();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    // Radix arms its outside-pointerdown listener on the next tick and defers
    // a left-button dismissal to the click that completes it.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);
    expect(screen.queryByRole("menuitem", { name: "Entry" })).toBeNull();
  });

  it("is remapped to semantic and radius tokens only", () => {
    const source = readFileSync(
      pathResolve(process.cwd(), "src/shared/ui/DropdownMenu.tsx"),
      "utf-8",
    );
    // no literal artwork colors: every color comes from a semantic token
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    // no primitive families: components use semantic tokens only
    expect(source).not.toMatch(
      /-(cream|sage|petrol|moss|chartreuse|oxblood|brown|score|night|brand)-/,
    );
    // only the radius tokens, intrinsic circles and the documented no-radius
    // cases (the radius guard's allowlist)
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
      pathResolve(process.cwd(), "src/shared/ui/DropdownMenu.tsx"),
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
