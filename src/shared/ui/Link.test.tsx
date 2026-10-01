import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
  describe("internal route rendering", () => {
    it("renders an anchor addressing the internal route", () => {
      render(<Link href="/offerings">All offerings</Link>);
      const link = screen.getByRole("link", { name: "All offerings" });
      expect(link.getAttribute("href")).toBe("/offerings");
    });
  });

  describe("permanent underline (spec: always underlined)", () => {
    it("is underlined in every state — underline is not a hover effect", () => {
      render(<Link href="/offerings">All offerings</Link>);
      const link = screen.getByRole("link");
      expect(link.className).toContain("underline");
      // hover changes color only, never the underline
      expect(link.className).not.toContain("hover:no-underline");
    });
  });

  describe("back variant (D7)", () => {
    it("renders a 16px leading arrow icon with gap-2 before its text", () => {
      const { container } = render(
        <Link href="/offerings" variant="back">
          Back to offerings
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Back to offerings" });
      expect(link.className).toContain("gap-2");
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      // 16px icon (size-4)
      expect(svg!.getAttribute("class")).toContain("size-4");
      // arrow precedes the text
      expect(link.firstChild).toBe(svg);
    });
  });

  describe("hover and focus-visible state classes", () => {
    it("switches color to the link hover token on hover", () => {
      render(<Link href="/offerings">All offerings</Link>);
      const link = screen.getByRole("link");
      expect(link.className).toContain("hover:text-link-hover");
    });

    it("includes focus-visible ring classes from the focus tokens (D6)", () => {
      render(<Link href="/offerings">All offerings</Link>);
      const link = screen.getByRole("link");
      expect(link.className).toContain("focus-visible:ring-focus-ring");
      expect(link.className).toContain("focus-visible:ring-offset-focus-offset");
    });
  });

  describe("compile-time rejection of external destinations", () => {
    // An absolute URL is a compile error: `href` is typed `/${string}`, so no
    // runtime branch is involved. `@ts-expect-error` proves the type guard
    // fires; if it ever stops firing, tsc --noEmit fails here.
    it("rejects an absolute URL href at compile time", () => {
      // @ts-expect-error — absolute URLs are not in-application routes
      const link = <Link href="https://example.com">External</Link>;
      // referenced so the binding is not flagged as unused
      expect(link).toBeDefined();
    });
  });
});
