import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Link } from "@/shared/ui/Link";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Link control tests (design.md D7, spec "Link navigation" / "Link states").
 * Written before the component is implemented (task 3.1); the import of
 * `Link` fails to resolve a component until task 3.2 implements it, so the
 * file runs and fails as required.
 *
 * jsdom has no CSS engine, so the permanent underline and state classes are
 * verified by their presence in `className`. The compile-time rejection of an
 * absolute URL is verified with `@ts-expect-error` (no runtime branch).
 */
describe("Link", () => {
  describe("anchor-surface passthrough (design.md D7, review round 2)", () => {
    // The rest of the anchor surface passes through to the element, so a
    // composing parent (`DropdownMenuItem asChild`) merges its role, handlers
    // and classes in through it. jsdom has no CSS engine, so "joined after the
    // treatment classes" is asserted on the exact class string.

    it("joins a caller-supplied className after the treatment classes", () => {
      render(
        <Link href="/offerings" className="caller-class">
          All offerings
        </Link>,
      );
      const link = screen.getByRole("link", { name: "All offerings" });
      // the treatment classes stay and the caller's class is joined after them
      expect(link.className).toBe(
        "underline text-text-link hover:text-text-link-hover focus-visible:focus-ring caller-class",
      );
    });

    it("passes caller-supplied aria-* and event handlers through to the anchor", () => {
      const onClick = vi.fn();
      render(
        <Link
          href="/offerings"
          role="menuitem"
          aria-label="entry label"
          onClick={onClick}
        >
          All offerings
        </Link>,
      );
      // the role and the aria-* attribute reach the element itself
      const link = screen.getByRole("menuitem", { name: "entry label" });
      expect(link.getAttribute("href")).toBe("/offerings");
      fireEvent.click(link);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
