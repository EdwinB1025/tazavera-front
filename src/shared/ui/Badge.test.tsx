import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Badge } from "@/shared/ui/Badge";

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
const BASE = "type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5";

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
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

  describe("Icon and label on one line (spec: 'Badge presentation'; design.md D14)", () => {
    it.each(["verified", "provisional"] as const)(
      "lays out the %s icon and label as one centered row",
      (variant) => {
        const tokens = classTokens(renderBadge(variant));
        expect(tokens).toContain("inline-flex");
        expect(tokens).toContain("items-center");
        expect(tokens).toContain("gap-1");
      },
    );
  });

  describe("Rating variants (spec: each tier in its own rating treatment)", () => {
    it.each([
      ["rating-exceptional", "bg-evaluation-rating-exceptional"],
      ["rating-excellent", "bg-evaluation-rating-excellent"],
      ["rating-good", "bg-evaluation-rating-good"],
      ["rating-commercial", "bg-evaluation-rating-commercial"],
    ] as const)(
      "renders %s in %s with the badge text color",
      (variant, background) => {
        const badge = renderBadge(variant);
        expect(badge.className).toBe(
          `${BASE} ${background} text-badge-text`,
        );
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

    it("renders white text on a dark color (#000000, L = 0 ≤ 0.179)", () => {
      const badge = renderTaxonomy("#000000", 0);
      expect(badge.style.backgroundColor).toBe("rgb(0, 0, 0)");
      expect(badge.style.color).toBe("white");
    });

    it("renders black text on a light color (#FFFFFF, L = 1 > 0.179)", () => {
      const badge = renderTaxonomy("#FFFFFF", 0);
      expect(badge.style.backgroundColor).toBe("rgb(255, 255, 255)");
      expect(badge.style.color).toBe("black");
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

    it("renders the plain color at level 0", () => {
      const badge = renderTaxonomy("#336699", 0);
      expect(badge.style.backgroundColor).toBe("rgb(51, 102, 153)");
    });

    it("keeps the label fully opaque at every level", () => {
      for (const level of [0, 1, 2] as const) {
        const badge = renderTaxonomy("#336699", level);
        // The depth opacity is confined to the background (the color-mix
        // above); nothing dims the badge and the label text is the opaque
        // white the luminance rule chose for #336699.
        expect(badge.style.opacity, `level ${level}`).toBe("");
        expect(badge.style.color, `level ${level}`).toBe("white");
      }
    });
  });
});
