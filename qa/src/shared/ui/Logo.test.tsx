import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Logo } from "@/shared/ui/Logo";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Brand logotype tests (design.md D7, design summary §4, spec "Brand logotype
 * presentation" and "Brand logotype colors").
 *
 * Written before the component is implemented (task 3.4); the import of
 * `Logo` fails to resolve until then, so the file runs and fails as required.
 *
 * jsdom has no CSS engine, so the forms are verified by their exact class
 * names (the build's choices, asserted here): the three drawn parts carry
 * `fill-logo-leaf`, `fill-logo-cup` and `fill-logo-coffee` (classes mapped to
 * the `--color-logo-*` tokens), `inline` lays the wordmark out to the right of
 * the drawing (`flex-row`) and `stacked` below and centred (`flex-col
 * items-center`). The drawing is inlined from `docs/design/add-app-shell/
 * favicon.svg` (Inkscape metadata stripped), and its leaf gradient id is
 * generated per instance with `useId`, so two logotypes on one page never
 * collide.
 */
describe("Logo", () => {
  describe("size prop", () => {
    it("reaches the drawing", () => {
      const { container } = render(
        <Logo variant="icon" size={48} locale="es" />,
      );
      const svg = container.querySelector("svg");
      expect(svg!.getAttribute("width")).toBe("48");
      expect(svg!.getAttribute("height")).toBe("48");
    });
  });

  describe("wordmark is brand artwork, not interface text (design.md D7)", () => {
    it("renders TAZAVERA with type-brand", () => {
      render(<Logo variant="inline" size={32} locale="es" />);
      const wordmark = screen.getByText("TAZAVERA");
      expect(wordmark.className).toBe("type-brand");
    });
  });

  describe("the whole logotype links to the locale root (spec: Brand link)", () => {
    it("gives the icon-form link an accessible name from its aria-label (spec: Brand link)", () => {
      render(
        <Logo
          variant="icon"
          size={32}
          locale="es"
          aria-label="texts.brandLink"
        />,
      );
      expect(
        screen.getByRole("link", { name: "texts.brandLink" }),
      ).toBeDefined();
    });
  });

  describe("per-instance leaf gradient id (design.md D7)", () => {
    it("gives two instances on one page different leaf gradient ids", () => {
      const { container } = render(
        <>
          <Logo variant="icon" size={32} locale="es" />
          <Logo variant="icon" size={32} locale="es" />
        </>,
      );
      const gradients = Array.from(
        container.getElementsByTagName("linearGradient"),
      );
      expect(gradients).toHaveLength(2);
      const ids = gradients.map((g) => g.getAttribute("id"));
      expect(ids[0]).toBeTruthy();
      expect(ids[1]).toBeTruthy();
      expect(ids[1]).not.toBe(ids[0]);
    });

    it("fills the leaf from its own gradient", () => {
      const { container } = render(
        <Logo variant="icon" size={32} locale="es" />,
      );
      const gradient = container.getElementsByTagName("linearGradient")[0]!;
      const leaf = container.querySelector("path.fill-logo-leaf");
      expect(leaf).not.toBeNull();
      expect(leaf!.getAttribute("style")).toContain(
        `#${gradient.getAttribute("id")}`,
      );
    });
  });
});
