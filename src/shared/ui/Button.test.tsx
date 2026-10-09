import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/Button";
import { ArrowLeft } from "@/shared/ui/icons";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see buttons left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Button control tests (design.md D2–D6, spec "Action button …").
 * Written before the component is implemented (task 2.2); the import of
 * `Button` fails to resolve a component until task 2.3 implements it, so the
 * file runs and fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so state
 * classes are verified by their presence in `className` (they activate via the
 * matching pseudo-class in a real browser). Accessible names use the
 * `getByRole({ name })` query, which @testing-library/dom computes natively.
 */
describe("Button", () => {
  describe("activation (enabled, non-busy)", () => {
    // Happy-path counterpart of the rejection cases below (disabled → D5,
    // busy → D4): an enabled, non-busy button forwards the click exactly once.
    it("calls onClick once when clicked", () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Save</Button>);
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("size geometry (D3)", () => {
    it("base size is h-10 with px-4", () => {
      render(<Button size="base">Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("h-10");
      expect(btn.className).toContain("px-4");
      cleanup();

      render(<Button size="sm">Save</Button>);
      const sm = screen.getByRole("button");
      expect(sm.className).toContain("h-8");
      expect(sm.className).toContain("px-3");
    });
  });

  // spec "Action button widths" — scenario "Minimum width per size"
  // (unify-action-button-widths D2).
  it("a labelled button takes its size's minimum width and keeps its label on one line", () => {
    render(
      <>
        <Button size="base">Save</Button>
        <Button size="sm">View</Button>
      </>,
    );
    const base = screen.getByRole("button", { name: "Save" }).classList;
    const sm = screen.getByRole("button", { name: "View" }).classList;
    expect([base.contains("min-w-action-base"), base.contains("whitespace-nowrap")]).toEqual([true, true]);
    expect(sm.contains("min-w-action-sm")).toBe(true);
  });

  describe("icon and label layout (D3)", () => {
    it("renders the icon at 16px (size-4) with gap-2", () => {
      const { container } = render(
        <Button icon={ArrowLeft}>Back</Button>,
      );
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("gap-2");
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      // SVG elements expose className as SVGAnimatedString; read the attribute.
      expect(svg!.getAttribute("class")).toContain("size-4");
      // a plain icon is not animated
      expect(svg!.getAttribute("class")).not.toContain("animate-spin");
    });
  });

  describe("icon color follows the control (spec: Shared icon source)", () => {
    it('renders the icon with stroke="currentColor" and no color class of its own', () => {
      const { container } = render(<Button icon={ArrowLeft}>Back</Button>);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg!.getAttribute("stroke")).toBe("currentColor");
      // The icon carries no text-*/stroke-*/fill-* utility (in any state
      // prefix), so its color is the control's text color through currentColor.
      const colorClasses = (svg!.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((cls) => /^(?:[a-z-]+:)*(?:text|stroke|fill)-/.test(cls));
      expect(colorClasses).toEqual([]);
    });
  });

  describe("icon-only shape and accessible name (spec: accessible naming)", () => {
    it("base icon-only is square (w-10 h-10) and named via aria-label", () => {
      render(<Button icon={ArrowLeft} aria-label="Go back" />);
      const btn = screen.getByRole("button", { name: "Go back" });
      expect(btn.className).toContain("w-10");
      expect(btn.className).toContain("h-10");
      cleanup();

      render(<Button size="sm" icon={ArrowLeft} aria-label="Go back" />);
      const sm = screen.getByRole("button", { name: "Go back" });
      expect(sm.className).toContain("w-8");
      expect(sm.className).toContain("h-8");
    });
  });

  describe("unnamed icon-only action (spec: accessible naming)", () => {
    it("rejects an icon-only button with no children and no aria-label at compile time", () => {
      // The ButtonProps union requires children or an aria-label, so this JSX
      // must be a type error. The @ts-expect-error directive turns that into a
      // build check: `npx tsc --noEmit` fails (TS2578, unused directive) if the
      // union ever stops rejecting an unnamed icon-only button.
      // @ts-expect-error no children and no aria-label
      render(<Button icon={ArrowLeft} />);
      // At runtime the control still renders; the naming rule is compile-time.
      expect(screen.getByRole("button")).toBeDefined();
    });
  });

  describe("treatment classes per variant (D2)", () => {
    // fix-button-boundaries: each action treatment carries a 1px border
    // coloured by its own semantic border token (D1/D2), on the rest classes
    // only (D4); hover keeps the rest border token, so no hover:border- class
    // exists (D3). Assertions split the className into exact tokens (jsdom has
    // no CSS engine), so `border` cannot be satisfied by any other border-*
    // token.

    /** Exact border tokens of the className, order-insensitive. */
    const borderTokens = (btn: HTMLElement): string[] =>
      btn.className
        .split(/\s+/)
        .filter((cls) => cls === "border" || cls.includes("border-"))
        .sort();

    /** Any hover border token (e.g. `enabled:hover:border-*-hover`). */
    const hoverBorderTokens = (btn: HTMLElement): string[] =>
      btn.className.split(/\s+/).filter((cls) => cls.includes("hover:border-"));

    it("primary uses action-primary tokens", () => {
      const btn = renderButton(<Button variant="primary">Save</Button>);
      expect(btn.className).toContain("bg-action-primary");
      expect(btn.className).toContain("text-action-primary-text");
      expect(borderTokens(btn)).toEqual(
        ["border", "border-action-primary-border"].sort(),
      );
      expect(hoverBorderTokens(btn)).toEqual([]);
    });

    it("action-1 uses action-1 tokens", () => {
      const btn = renderButton(<Button variant="action-1">Save</Button>);
      expect(btn.className).toContain("bg-action-1-bg");
      expect(btn.className).toContain("text-action-1-text");
      expect(borderTokens(btn)).toEqual(
        ["border", "border-action-1-border"].sort(),
      );
      expect(hoverBorderTokens(btn)).toEqual([]);
    });

    it("action-2 uses action-2 tokens", () => {
      const btn = renderButton(<Button variant="action-2">Save</Button>);
      expect(btn.className).toContain("bg-action-2-bg");
      expect(btn.className).toContain("text-action-2-text");
      expect(borderTokens(btn)).toEqual(
        ["border", "border-action-2-border"].sort(),
      );
      expect(hoverBorderTokens(btn)).toEqual([]);
    });

    it("action-3 uses action-3 tokens", () => {
      const btn = renderButton(<Button variant="action-3">Save</Button>);
      expect(btn.className).toContain("bg-action-3-bg");
      expect(btn.className).toContain("text-action-3-text");
      expect(borderTokens(btn)).toEqual(
        ["border", "border-action-3-border"].sort(),
      );
      expect(hoverBorderTokens(btn)).toEqual([]);
    });

    it("action-4 uses action-4 tokens", () => {
      const btn = renderButton(<Button variant="action-4">Save</Button>);
      expect(btn.className).toContain("bg-action-4-bg");
      expect(btn.className).toContain("text-action-4-text");
      expect(borderTokens(btn)).toEqual(
        ["border", "border-action-4-border"].sort(),
      );
      expect(hoverBorderTokens(btn)).toEqual([]);
    });

    it("nav-button uses nav-button tokens and has a border", () => {
      const btn = renderButton(<Button variant="nav-button">Menu</Button>);
      expect(btn.className).toContain("bg-nav-button-bg");
      expect(btn.className).toContain("text-nav-button-text");
      expect(btn.className).toContain("border-nav-button-border");
    });
  });

  describe("hover and focus-visible state classes", () => {
    // Correction 4 (review round 1): assert the FULL prefixed class names, not
    // substrings that would pass without the prefix. `enabled:hover:` ensures
    // the hover treatment is gated to enabled buttons (D5).
    it("includes the hover treatment class with the enabled: prefix", () => {
      const btn = renderButton(<Button variant="primary">Save</Button>);
      expect(btn.className).toContain("enabled:hover:bg-action-primary-hover");
    });

    it("includes focus-visible ring classes from the focus tokens (D6)", () => {
      const btn = renderButton(<Button>Save</Button>);
      expect(btn.className).toContain("focus-visible:focus-ring");
    });
  });

  describe("disabled semantics (D5)", () => {
    // Correction 4 (review round 1): assert the FULL prefixed class names, not
    // substrings that would pass without the prefix. `disabled:` ensures the
    // treatment is gated to natively disabled buttons.
    it("sets native disabled with opacity-50 and cursor-not-allowed", () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn.hasAttribute("disabled")).toBe(true);
      expect(btn.className).toContain("disabled:opacity-50");
      expect(btn.className).toContain("disabled:cursor-not-allowed");

      // activation rejected
      fireEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("busy semantics (D4)", () => {
    it("sets aria-busy and aria-disabled, keeps the label, ignores activation and keeps keyboard focus", () => {
      const onClick = vi.fn();
      render(<Button loading onClick={onClick}>Save</Button>);
      const btn = screen.getByRole("button");

      // busy announced and aria-disabled set (NOT the native disabled)
      expect(btn.getAttribute("aria-busy")).toBe("true");
      expect(btn.getAttribute("aria-disabled")).toBe("true");
      expect(btn.hasAttribute("disabled")).toBe(false);

      // label kept so the width does not change
      expect(screen.getByRole("button", { name: "Save" })).toBeDefined();

      // activation ignored
      fireEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();

      // keyboard focus kept (button is still focusable)
      btn.focus();
      expect(document.activeElement).toBe(btn);

      // no hover treatment while busy (correction 3)
      expect(btn.className).not.toContain("enabled:hover:");
      expect(btn.className).not.toContain("hover:bg-action-primary-hover");
    });

    it("renders a spinner before the label with motion-reduce:animate-none (no rotation under reduced motion)", () => {
      const { container } = render(<Button loading>Save</Button>);
      const btn = screen.getByRole("button");
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg!.getAttribute("class")).toContain("animate-spin");
      expect(svg!.getAttribute("class")).toContain("motion-reduce:animate-none");
      // spinner renders before the label
      expect(btn.firstChild).toBe(svg);
    });
  });

  describe("busy does not submit forms (spec: Busy does not submit forms)", () => {
    // Correction 1 (review round 1): returning early from onClick does not
    // cancel the native default action. While busy a submit button must not
    // submit its form, so the click handler calls preventDefault() before
    // returning. This test fails until the handler cancels the default action.
    it("a busy submit button does not submit its form", () => {
      const onSubmit = vi.fn();
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit" loading>Save</Button>
        </form>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});

/** Render a single button and return the element for className/attribute checks. */
function renderButton(ui: ReactNode): HTMLElement {
  const { container } = render(ui);
  return container.querySelector("button")!;
}
