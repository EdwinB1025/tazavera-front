import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
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
  describe("three forms (design summary §4)", () => {
    it("icon renders the drawing alone", () => {
      const { container } = render(
        <Logo variant="icon" size={32} locale="es" />,
      );
      expect(container.querySelector("svg")).not.toBeNull();
      expect(screen.queryByText("TAZAVERA")).toBeNull();
    });

    it("inline renders the wordmark to the right of the drawing", () => {
      const { container } = render(
        <Logo variant="inline" size={32} locale="es" />,
      );
      const svg = container.querySelector("svg");
      const wordmark = screen.getByText("TAZAVERA");
      expect(svg).not.toBeNull();
      // to the right: a row layout, drawing first, wordmark after
      expect(wordmark.parentElement!.className).toContain("flex-row");
      expect(
        svg!.compareDocumentPosition(wordmark) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("stacked renders the wordmark below the drawing, centred", () => {
      const { container } = render(
        <Logo variant="stacked" size={32} locale="es" />,
      );
      const svg = container.querySelector("svg");
      const wordmark = screen.getByText("TAZAVERA");
      expect(wordmark.parentElement!.className).toContain("flex-col");
      expect(wordmark.parentElement!.className).toContain("items-center");
      // below: the wordmark follows the drawing in a column layout
      expect(
        svg!.compareDocumentPosition(wordmark) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

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

    it("is identical regardless of the locale passed in", () => {
      render(
        <>
          <Logo variant="inline" size={32} locale="ca" />
          <Logo variant="inline" size={32} locale="en" />
        </>,
      );
      const wordmarks = screen.getAllByText("TAZAVERA");
      expect(wordmarks).toHaveLength(2);
      for (const wordmark of wordmarks) {
        expect(wordmark.textContent).toBe("TAZAVERA");
      }
    });
  });

  describe("the whole logotype links to the locale root (spec: Brand link)", () => {
    it("wraps drawing and wordmark in one internal link", () => {
      const { container } = render(
        <Logo variant="inline" size={32} locale="es" />,
      );
      const link = screen.getByRole("link", { name: "TAZAVERA" });
      expect(link.getAttribute("href")).toBe("/es");
      // the whole logotype: the drawing sits inside the link
      expect(link.contains(container.querySelector("svg"))).toBe(true);
    });

    it("links to the root of the active locale", () => {
      const { container } = render(
        <Logo variant="icon" size={32} locale="ca" />,
      );
      const link = container.querySelector("a");
      expect(link).not.toBeNull();
      expect(link!.getAttribute("href")).toBe("/ca");
    });

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

  describe("drawn parts take their token classes (spec: Logotype parts take their token values)", () => {
    it("maps leaf, cup and coffee to logo-leaf, logo-cup and logo-coffee", () => {
      const { container } = render(
        <Logo variant="icon" size={32} locale="es" />,
      );
      // design.md leaves the class names free: the build chose fill-logo-*
      // (Tailwind utilities generated from the --color-logo-* tokens) and this
      // test asserts what it chose.
      expect(container.querySelectorAll("path.fill-logo-leaf")).toHaveLength(1);
      expect(container.querySelectorAll("path.fill-logo-cup")).toHaveLength(1);
      expect(container.querySelectorAll("path.fill-logo-coffee")).toHaveLength(
        1,
      );
    });
  });
});

describe("app/icon.svg: the browser icon in both themes (design.md D7)", () => {
  // The browser icon cannot read the page's data-theme: it adapts to the
  // operating-system appearance through an embedded <style> — the three parts
  // take a class each, filled with the traditional colors as literal hex
  // values (artwork definition, exempt from the no-literal-text rule), and an
  // @media (prefers-color-scheme: dark) block reassigns them to the dark ones
  // (spec: "Browser icon" and "Icon appearance follows the operating system").
  const ICON_PATH = pathResolve(process.cwd(), "app/icon.svg");

  function iconSource(): string {
    return readFileSync(ICON_PATH, "utf-8");
  }

  /** Index of the dark block; throws the failure out when absent. */
  function splitAtDarkBlock(src: string): { base: string; dark: string } {
    const mediaQuery = "@media (prefers-color-scheme: dark)";
    const mediaIdx = src.indexOf(mediaQuery);
    expect(mediaIdx).toBeGreaterThan(-1);
    return { base: src.slice(0, mediaIdx), dark: src.slice(mediaIdx) };
  }

  it("fills the three parts with the traditional hex values", () => {
    const { base } = splitAtDarkBlock(iconSource());
    expect(base).toMatch(/\.logo-leaf\s*\{[^}]*fill:\s*#688f25/);
    expect(base).toMatch(/\.logo-cup\s*\{[^}]*fill:\s*#0c3151/);
    expect(base).toMatch(/\.logo-coffee\s*\{[^}]*fill:\s*#472e2e/);
  });

  it("reassigns the three parts to the dark hex values in the dark block", () => {
    const { dark } = splitAtDarkBlock(iconSource());
    expect(dark).toMatch(/\.logo-leaf\s*\{[^}]*fill:\s*#bec387/);
    expect(dark).toMatch(/\.logo-cup\s*\{[^}]*fill:\s*#c9e5e0/);
    expect(dark).toMatch(/\.logo-coffee\s*\{[^}]*fill:\s*#9b7e7d/);
  });

  it("carries the media query on the operating-system appearance", () => {
    expect(iconSource()).toContain("@media (prefers-color-scheme: dark)");
  });
});
