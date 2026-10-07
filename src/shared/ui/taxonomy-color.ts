// ─── Taxonomy colour rule (design.md D4) ───
// One definition shared by the taxonomy badge, the flavor wheel's segments and
// its swatches. The data colour is reduced by depth, and the label is white or
// black by the WCAG 2.2 relative luminance `L` of that colour at its depth
// opacity over the theme's card surface (white when `L` ≤ 0.179, black above),
// which always picks the better pair (spec: "Badge label contrast").

const LUMINANCE_THRESHOLD = 0.179;

/**
 * The card surface each theme renders taxonomy colours on
 * (`--color-surface-card`), as data: the label rule needs it during render,
 * where CSS variables cannot be read. `Badge.test.tsx` fails if these drift
 * from `globals.css`.
 */
export const TAXONOMY_CARD_SURFACES = {
  traditional: "#f2e8d9",
  dark: "#0d1b1e",
} as const;

export type TaxonomyLabel = "white" | "black";

export type TaxonomyColorRule = {
  /** Depth fill opacity: 1 at level 0, 0.92 at level 1, 0.85 at level 2. */
  opacity: number;
  /** Label over the traditional theme's card surface. */
  label: TaxonomyLabel;
  /** Label over the dark theme's card surface. */
  labelDark: TaxonomyLabel;
};

/** WCAG 2.2 relative luminance of a `#RRGGBB` color. */
function relativeLuminance(hex: string): number {
  const value = hex.replace(/^#/, "");
  const channel = (start: number): number => {
    const srgb = parseInt(value.slice(start, start + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** The `#RRGGBB` channels of a color. */
function channels(hex: string): [number, number, number] {
  const value = hex.replace(/^#/, "");
  return [0, 2, 4].map((start) =>
    parseInt(value.slice(start, start + 2), 16),
  ) as [number, number, number];
}

/**
 * The label for one theme: white or black by the luminance of the rendered
 * background, the data color at its depth opacity over that theme's card
 * surface.
 */
function labelOver(
  color: string,
  opacity: number,
  surface: string,
): TaxonomyLabel {
  const front = channels(color);
  const back = channels(surface);
  const blended = front
    .map((channel, index) => channel * opacity + back[index] * (1 - opacity))
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("");
  return relativeLuminance(`#${blended}`) <= LUMINANCE_THRESHOLD
    ? "white"
    : "black";
}

/**
 * The taxonomy colour rule for a `#RRGGBB` data colour at a taxonomy level:
 * its depth fill opacity and the label of each theme.
 */
export function taxonomyColorRule(
  color: string,
  level: 0 | 1 | 2,
): TaxonomyColorRule {
  const opacity = level === 1 ? 0.92 : level === 2 ? 0.85 : 1;
  return {
    opacity,
    label: labelOver(color, opacity, TAXONOMY_CARD_SURFACES.traditional),
    labelDark: labelOver(color, opacity, TAXONOMY_CARD_SURFACES.dark),
  };
}
