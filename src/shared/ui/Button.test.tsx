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
  describe("label rendering", () => {
    it("renders its children as the visible label", () => {
      render(<Button>Save changes</Button>);
      expect(screen.getByRole("button", { name: "Save changes" })).toBeDefined();
    });
  });

  describe("size geometry (D3)", () => {
    it("base size is h-10 with px-4", () => {
      render(<Button size="base">Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("h-10");
      expect(btn.className).toContain("px-4");
    });

    it("sm size is h-8 with px-3", () => {
      render(<Button size="sm">Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("h-8");
      expect(btn.className).toContain("px-3");
    });
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

  describe("icon-only shape and accessible name (spec: accessible naming)", () => {
    it("base icon-only is square (w-10 h-10) and named via aria-label", () => {
      render(<Button icon={ArrowLeft} aria-label="Go back" />);
      const btn = screen.getByRole("button", { name: "Go back" });
      expect(btn.className).toContain("w-10");
      expect(btn.className).toContain("h-10");
    });

    it("sm icon-only is square (w-8 h-8)", () => {
      render(<Button size="sm" icon={ArrowLeft} aria-label="Go back" />);
      const btn = screen.getByRole("button", { name: "Go back" });
      expect(btn.className).toContain("w-8");
      expect(btn.className).toContain("h-8");
    });
  });

  describe("treatment classes per variant (D2)", () => {
    it("primary uses action-primary tokens", () => {
      const btn = renderButton(<Button variant="primary">Save</Button>);
      expect(btn.className).toContain("bg-action-primary");
      expect(btn.className).toContain("text-action-primary-text");
    });

    it("action-1 uses action-1 tokens", () => {
      const btn = renderButton(<Button variant="action-1">Save</Button>);
      expect(btn.className).toContain("bg-action-1-bg");
      expect(btn.className).toContain("text-action-1-text");
    });

    it("action-2 uses action-2 tokens", () => {
      const btn = renderButton(<Button variant="action-2">Save</Button>);
      expect(btn.className).toContain("bg-action-2-bg");
      expect(btn.className).toContain("text-action-2-text");
    });

    it("action-3 uses action-3 tokens", () => {
      const btn = renderButton(<Button variant="action-3">Save</Button>);
      expect(btn.className).toContain("bg-action-3-bg");
      expect(btn.className).toContain("text-action-3-text");
    });

    it("action-4 uses action-4 tokens", () => {
      const btn = renderButton(<Button variant="action-4">Save</Button>);
      expect(btn.className).toContain("bg-action-4-bg");
      expect(btn.className).toContain("text-action-4-text");
    });

    it("nav-button uses nav-button tokens and has a border", () => {
      const btn = renderButton(<Button variant="nav-button">Menu</Button>);
      expect(btn.className).toContain("bg-nav-button-bg");
      expect(btn.className).toContain("text-nav-button-text");
      expect(btn.className).toContain("border-nav-button-border");
    });
  });

  describe("hover and focus-visible state classes", () => {
    it("includes the hover treatment class", () => {
      const btn = renderButton(<Button variant="primary">Save</Button>);
      expect(btn.className).toContain("hover:bg-action-primary-hover");
    });

    it("includes focus-visible ring classes from the focus tokens (D6)", () => {
      const btn = renderButton(<Button>Save</Button>);
      expect(btn.className).toContain("focus-visible:ring-focus-ring");
      expect(btn.className).toContain("focus-visible:ring-offset-focus-offset");
    });
  });

  describe("disabled semantics (D5)", () => {
    it("sets native disabled with opacity-50 and cursor-not-allowed", () => {
      render(<Button disabled>Save</Button>);
      const btn = screen.getByRole("button");
      expect(btn.hasAttribute("disabled")).toBe(true);
      expect(btn.className).toContain("opacity-50");
      expect(btn.className).toContain("cursor-not-allowed");
    });

    it("rejects activation (onClick not called)", () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Save</Button>);
      fireEvent.click(screen.getByRole("button"));
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

    it("replaces the icon with the spinner in icon-only buttons (square footprint kept)", () => {
      const { container } = render(
        <Button loading icon={ArrowLeft} aria-label="Loading" />,
      );
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBe(1);
      expect(svgs[0]!.getAttribute("class")).toContain("animate-spin");
      expect(svgs[0]!.getAttribute("class")).toContain("motion-reduce:animate-none");
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

  describe("busy semantics cannot be overridden by callers (correction 2)", () => {
    // `{...rest}` must be spread BEFORE the component's own props, so a
    // caller-supplied `aria-busy` or `aria-disabled` passed through rest
    // cannot clear the busy semantics. While `loading` the button keeps
    // `aria-busy="true"` and `aria-disabled="true"` regardless of what the
    // caller passes. This test fails while `{...rest}` is spread after the
    // component's own props.
    it("keeps aria-busy and aria-disabled true while loading even if a caller passes false", () => {
      render(
        <Button loading aria-busy={false} aria-disabled={false}>
          Save
        </Button>,
      );
      const btn = screen.getByRole("button", { name: "Save" });
      expect(btn.getAttribute("aria-busy")).toBe("true");
      expect(btn.getAttribute("aria-disabled")).toBe("true");
    });
  });

  describe("native button attribute passthrough", () => {
    it("defaults type to button so forms never get accidental submits", () => {
      render(<Button>Save</Button>);
      expect(screen.getByRole("button").getAttribute("type")).toBe("button");
    });

    it("forwards type when provided", () => {
      render(<Button type="submit">Save</Button>);
      expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
    });

    it("forwards form, name, value and aria-* attributes", () => {
      render(
        <Button name="action" value="save" form="profile-form" aria-describedby="save-help">
          Save
        </Button>,
      );
      const btn = screen.getByRole("button");
      expect(btn.getAttribute("name")).toBe("action");
      expect(btn.getAttribute("value")).toBe("save");
      expect(btn.getAttribute("form")).toBe("profile-form");
      expect(btn.getAttribute("aria-describedby")).toBe("save-help");
    });
  });
});

/** Render a single button and return the element for className/attribute checks. */
function renderButton(ui: ReactNode): HTMLElement {
  const { container } = render(ui);
  return container.querySelector("button")!;
}
