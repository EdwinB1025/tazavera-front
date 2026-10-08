import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { Badge, TAXONOMY_CARD_SURFACES } from "@/shared/ui/Badge";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see badges left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Badge tests (design.md D7; the `feedback` spec: "Badge presentation",
 * "Rating badge", "Verification status badge", "Taxonomy badge"). Written
 * before the component is implemented (task 3.2); the import of `Badge` fails
 * to resolve until `src/shared/ui/Badge.tsx` exists, so the file runs and fails
 * as required.
 *
 * Assertions are className- and style-based: jsdom has no CSS engine, so the
 * treatments are verified by the exact class tokens and inline styles the
 * build renders. On the inline colors jsdom stores a `#RRGGBB` value as
 * `rgb(r, g, b)` (also inside `color-mix`) and keeps the `white`/`black`
 * keywords as written, so the expected strings below are the DOM
 * serialization of design.md D7's values with the fixture colors `#000000`,
 * `#FFFFFF` and `#336699`.
 */

/** The seven variants of design.md D7. */
type Variant =
  | "rating-exceptional"
  | "rating-excellent"
  | "rating-good"
  | "rating-commercial"
  | "verified"
  | "provisional"
  | "taxonomy";

const VARIANTS: Variant[] = [
  "rating-exceptional",
  "rating-excellent",
  "rating-good",
  "rating-commercial",
  "verified",
  "provisional",
  "taxonomy",
];

/**
 * The base classes of every variant: the settled treatment of design.md D7
 * followed by the inline row and padding of D14.
 */
const BASE =
  "type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5";

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** A taxonomy badge's label per theme, from its two custom properties. */
function labels(badge: HTMLElement): { traditional: string; dark: string } {
  return {
    traditional: badge.style.getPropertyValue("--taxonomy-label"),
    dark: badge.style.getPropertyValue("--taxonomy-label-dark"),
  };
}

/** The badge element rendered into the container. */
function badgeRoot(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

/** A badge of the given variant, carrying the label `LABEL`. */
function renderBadge(variant: Variant): HTMLElement {
  const { container } = render(
    variant === "taxonomy" ? (
      <Badge variant={variant} color="#336699" level={0}>
        LABEL
      </Badge>
    ) : (
      <Badge variant={variant}>LABEL</Badge>
    ),
  );
  return badgeRoot(container);
}

/** A taxonomy badge on the given data color at the given level. */
function renderTaxonomy(color: string, level: 0 | 1 | 2): HTMLElement {
  const { container } = render(
    <Badge variant="taxonomy" color={color} level={level}>
      LABEL
    </Badge>,
  );
  return badgeRoot(container);
}

describe("Badge", () => {
  describe("Base classes (every variant renders exactly the D7 treatment and the D14 layout as its base)", () => {
    it("renders the base classes first on every variant", () => {
      // The base is exactly these two classes; each variant's complete class
      // list is pinned exactly in its own describe block below.
      for (const variant of VARIANTS) {
        const badge = renderBadge(variant);
        expect(classTokens(badge).slice(0, 7), variant).toEqual(
          BASE.split(" "),
        );
      }
    });
  });

  describe("Rating variants (spec: each tier in its own rating treatment)", () => {
    it.each([
      ["rating-exceptional", "bg-evaluation-rating-exceptional"],
    ] as const)(
      "renders %s in %s with the badge text color",
      (variant, background) => {
        const badge = renderBadge(variant);
        expect(badge.className).toBe(`${BASE} ${background} text-badge-text`);
      },
    );
  });

  describe("Verified state (spec: a check icon and the verified label)", () => {
    it("renders the verified status treatment", () => {
      const badge = renderBadge("verified");
      expect(badge.className).toBe(
        `${BASE} bg-badge-verified-bg text-badge-verified-text`,
      );
    });

    it("renders the Check icon before its label", () => {
      const badge = renderBadge("verified");
      const icon = badge.firstElementChild;
      expect(icon).not.toBeNull();
      expect(classTokens(icon as Element)).toContain("lucide-check");
      // The icon is the very first node, so it precedes the label (reversed
      // order fails here) and the label renders after it.
      expect(badge.childNodes[0]).toBe(icon);
      expect(badge.textContent).toBe("LABEL");
    });
  });

  describe("Provisional state (spec: a clock icon and the provisional label)", () => {
    it("renders the provisional status treatment", () => {
      const badge = renderBadge("provisional");
      expect(badge.className).toBe(
        `${BASE} bg-badge-provisional-bg text-badge-provisional-text`,
      );
    });

    it("renders the Clock icon before its label", () => {
      const badge = renderBadge("provisional");
      const icon = badge.firstElementChild;
      expect(icon).not.toBeNull();
      expect(classTokens(icon as Element)).toContain("lucide-clock");
      // The icon is the very first node, so it precedes the label (reversed
      // order fails here) and the label renders after it.
      expect(badge.childNodes[0]).toBe(icon);
      expect(badge.textContent).toBe("LABEL");
    });
  });

  describe("Taxonomy variant (spec: 'Data color background', 'White text on dark colors', 'Black text on light colors')", () => {
    it("takes the data color as its background inline style and renders no treatment class", () => {
      const badge = renderTaxonomy("#336699", 0);
      expect(badge.className).toBe(BASE);
      expect(badge.style.backgroundColor).toBe("rgb(51, 102, 153)");
    });

    it("renders white text on a dark color in both themes (#000000, L = 0 ≤ 0.179)", () => {
      const badge = renderTaxonomy("#000000", 0);
      expect(badge.style.backgroundColor).toBe("rgb(0, 0, 0)");
      expect(labels(badge)).toEqual({ traditional: "white", dark: "white" });
    });

    it("renders black text on a light color in both themes (#FFFFFF, L = 1 > 0.179)", () => {
      const badge = renderTaxonomy("#FFFFFF", 0);
      expect(badge.style.backgroundColor).toBe("rgb(255, 255, 255)");
      expect(labels(badge)).toEqual({ traditional: "black", dark: "black" });
    });
  });

  describe("Label per theme from the rendered background (spec: 'White text on dark colors', 'Black text on light colors', 'Taxonomy pairs'; design.md D7 round 4)", () => {
    it("takes white in dark and black in traditional when only the dark blend is dark (#af5e70, raw L picks black)", () => {
      for (const level of [1, 2] as const) {
        expect(
          labels(renderTaxonomy("#af5e70", level)),
          `level ${level}`,
        ).toEqual({
          traditional: "black",
          dark: "white",
        });
      }
    });

    it("blends over the card surface that globals.css resolves in each theme", () => {
      const css = readFileSync(
        pathResolve(process.cwd(), "src/app/styles/globals.css"),
        "utf8",
      );
      const primitive = (name: string): string =>
        new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css)![1];
      const cards = [
        ...css.matchAll(/--color-surface-card:\s*var\(--color-([a-z0-9-]+)\)/g),
      ].map((match) => primitive(match[1]).toLowerCase());
      expect(cards).toHaveLength(2);
      expect(TAXONOMY_CARD_SURFACES).toEqual({
        traditional: cards[0],
        dark: cards[1],
      });
    });
  });

  describe("Depth reduces the background (spec: 'Depth reduces the background'; design.md D7)", () => {
    it("renders the level 1 background at 92% (`color-mix(in srgb, <color> 92%, transparent)`)", () => {
      const badge = renderTaxonomy("#336699", 1);
      expect(badge.style.backgroundColor).toBe(
        "color-mix(in srgb, rgb(51, 102, 153) 92%, transparent)",
      );
    });

    it("renders the level 2 background at 85% (`color-mix(in srgb, <color> 85%, transparent)`)", () => {
      const badge = renderTaxonomy("#336699", 2);
      expect(badge.style.backgroundColor).toBe(
        "color-mix(in srgb, rgb(51, 102, 153) 85%, transparent)",
      );
    });

    it("keeps the label fully opaque at every level", () => {
      for (const level of [0, 1, 2] as const) {
        const badge = renderTaxonomy("#336699", level);
        // The depth opacity is confined to the background (the color-mix
        // above); nothing dims the badge and each label is an opaque white or
        // black, as the rule chose for #336699 over each card surface.
        expect(badge.style.opacity, `level ${level}`).toBe("");
        expect(labels(badge), `level ${level}`).toEqual(
          level === 2
            ? { traditional: "black", dark: "white" }
            : { traditional: "white", dark: "white" },
        );
      }
    });
  });
});

describe("Taxonomy pairs measured (spec: 'Taxonomy pairs'; verify coverage, review round 4)", () => {
  // Measures what the spec states: for data colours across the sRGB cube, at
  // every level and over each theme's card surface, the label the badge
  // chooses reaches 4.5:1 against the rendered (blended) background.
  const lum = (rgb: number[]): number => {
    const c = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const hex = (h: string): number[] =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const ratio = (a: number, b: number): number =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const STEPS = [0, 51, 102, 153, 204, 255];
  const OPACITY = { 0: 1, 1: 0.92, 2: 0.85 } as const;

  it("every label measures at least 4.5:1 against its rendered background, at every level, in both themes", () => {
    const failures: string[] = [];
    for (const r of STEPS) for (const g of STEPS) for (const b of STEPS) {
      const color = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
      for (const level of [0, 1, 2] as const) {
        const badge = renderTaxonomy(color, level);
        const chosen = labels(badge);
        cleanup();
        for (const theme of ["traditional", "dark"] as const) {
          const back = hex(TAXONOMY_CARD_SURFACES[theme]);
          const o = OPACITY[level];
          const bg = [r, g, b].map((v, i) => Math.round(v * o + back[i] * (1 - o)));
          const label = chosen[theme] === "white" ? 1 : 0;
          const measured = ratio(lum(bg), label);
          if (measured < 4.5) failures.push(`${color} L${level} ${theme} ${measured.toFixed(2)}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
