import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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

  describe("busy semantics (D4)", () => {
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
