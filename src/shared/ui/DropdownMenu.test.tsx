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

  function renderNavMenu() {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent surface="nav">
          <DropdownMenuItem>Entry</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
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

  // ─── The surface variant (refine-app-header design.md D2) ───
  // The panel defaults to the card surface with exactly its current classes;
  // the nav surface swaps the panel's surface, text and radius tokens and the
  // rows' typographic role and hover pair, leaving the boundary, shadow and
  // geometry untouched. The `surface` prop and the nav classes do not exist
  // yet, so both cases run and fail until task 2.2 adds them.

  it("renders the card surface by default", () => {
    renderMenu();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    const panel = screen.getByRole("menu");
    // with no `surface` prop the panel keeps exactly today's classes
    for (const cls of [
      "bg-surface-card",
      "text-text-primary",
      "rounded-container",
      "border-border-strong",
      "shadow-md",
      "min-w-48",
      "p-1",
    ]) {
      expect(panel.classList.contains(cls), cls).toBe(true);
    }
  });

  it("renders the nav surface with the header's tokens", () => {
    renderNavMenu();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    const panel = screen.getByRole("menu");
    // the header's surface, text and field radius ...
    for (const cls of ["bg-nav-surface", "text-nav-text", "rounded-field"]) {
      expect(panel.classList.contains(cls), cls).toBe(true);
    }
    // ... and none of the card treatment
    for (const cls of [
      "bg-surface-card",
      "text-text-primary",
      "rounded-container",
    ]) {
      expect(panel.classList.contains(cls), cls).toBe(false);
    }
    // the boundary, shadow and geometry stay
    for (const cls of ["border-border-strong", "shadow-md", "min-w-48", "p-1"]) {
      expect(panel.classList.contains(cls), cls).toBe(true);
    }
    // rows: the nav row role and radius, with `nav-hover` and `nav-text-hover`
    // on hover and focus (spec "Entry hover")
    const row = screen.getByRole("menuitem", { name: "Entry" });
    for (const cls of ["type-navlist-item", "rounded-field"]) {
      expect(row.classList.contains(cls), cls).toBe(true);
    }
    for (const cls of [
      "hover:bg-nav-hover",
      "focus:bg-nav-hover",
      "hover:text-nav-text-hover",
      "focus:text-nav-text-hover",
    ]) {
      expect(row.classList.contains(cls), cls).toBe(true);
    }
  });

  // ─── The destructive arm on the nav surface (refine-app-header design.md D2;
  // corrections.md round 1, correction 4) ───
  // On the nav surface a destructive entry keeps `nav-text-destructive` at
  // rest, on hover and on focus, so the row's `nav-text-hover` classes never
  // turn it into the normal hover colour (spec "Header menu presentation",
  // "Destructive entry keeps its error colour"). The card set is unchanged and
  // keeps `data-[variant=destructive]:text-feedback-error`. The state wiring is
  // the build's choice (design.md D2) and the case asserts the classes chosen
  // here: per-variant overrides of the row's rest, hover and focus text. The
  // token and the classes do not exist yet (task 8.2), so the case runs and
  // fails until then.

  it("renders a destructive entry with the nav destructive text on the nav surface", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent surface="nav">
          <DropdownMenuItem>Entry</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    // the destructive entry: the same token in all three states
    const destructive = screen.getByRole("menuitem", { name: "Delete" });
    for (const cls of [
      "data-[variant=destructive]:text-nav-text-destructive",
      "data-[variant=destructive]:hover:text-nav-text-destructive",
      "data-[variant=destructive]:focus:text-nav-text-destructive",
    ]) {
      expect(destructive.classList.contains(cls), cls).toBe(true);
    }
    // a default entry keeps `nav-text` (type-navlist-item) with `nav-text-hover`
    // on hover and focus
    const row = screen.getByRole("menuitem", { name: "Entry" });
    for (const cls of [
      "type-navlist-item",
      "hover:text-nav-text-hover",
      "focus:text-nav-text-hover",
    ]) {
      expect(row.classList.contains(cls), cls).toBe(true);
    }
    // the card surface keeps its error text
    cleanup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Open" }));
    const cardEntry = screen.getByRole("menuitem", { name: "Delete" });
    expect(
      cardEntry.classList.contains("data-[variant=destructive]:text-feedback-error"),
      "data-[variant=destructive]:text-feedback-error",
    ).toBe(true);
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
