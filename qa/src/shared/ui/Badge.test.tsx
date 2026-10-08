import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Badge } from "@/shared/ui/Badge";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see badges left by previous renders.
afterEach(() => {
  cleanup();
});

/** The rating variants of design.md D7. */
type RatingVariant =
  | "rating-exceptional"
  | "rating-excellent"
  | "rating-good"
  | "rating-commercial";

/**
 * The base classes of every variant: the settled treatment of design.md D7
 * followed by the inline row and padding of D14.
 */
const BASE =
  "type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5";

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
  describe("Rating variants (spec: each tier in its own rating treatment)", () => {
    it.each([
      ["rating-excellent", "bg-evaluation-rating-excellent"],
      ["rating-good", "bg-evaluation-rating-good"],
      ["rating-commercial", "bg-evaluation-rating-commercial"],
    ] as const)(
      "renders %s in %s with the badge text color",
      (variant: RatingVariant, background) => {
        const badge = badgeRoot(
          render(<Badge variant={variant}>LABEL</Badge>).container,
        );
        expect(badge.className).toBe(`${BASE} ${background} text-badge-text`);
      },
    );
  });

  describe("Taxonomy variant (spec: 'Data color background', 'White text on dark colors', 'Black text on light colors')", () => {
    it("marks itself for the theme rule and sets no fixed label colour", () => {
      const badge = renderTaxonomy("#336699", 0);
      expect(badge.hasAttribute("data-taxonomy")).toBe(true);
      expect(badge.style.color).toBe("");
    });
  });

  describe("Label per theme from the rendered background (spec: 'White text on dark colors', 'Black text on light colors', 'Taxonomy pairs'; design.md D7 round 4)", () => {
    it("takes black in traditional when the cream blend is light (#8a705a, raw L picks white)", () => {
      expect(labels(renderTaxonomy("#8a705a", 0))).toEqual({
        traditional: "white",
        dark: "white",
      });
      for (const level of [1, 2] as const) {
        expect(
          labels(renderTaxonomy("#8a705a", level)),
          `level ${level}`,
        ).toEqual({
          traditional: "black",
          dark: "white",
        });
      }
    });
  });
});
