import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Check, Clock } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/utils";

// ─── UI-specific types (declared before the component) ───
// Generic chip: the consumer supplies the label and, for the taxonomy family,
// the data colors. No generated API type is involved (design.md D2).

export type BadgeVariant =
  | "rating-exceptional"
  | "rating-excellent"
  | "rating-good"
  | "rating-commercial"
  | "verified"
  | "provisional"
  | "taxonomy";

type BadgeOwnProps =
  | { variant: "taxonomy"; color: string; level: 0 | 1 | 2 }
  | {
      variant: Exclude<BadgeVariant, "taxonomy">;
      color?: never;
      level?: never;
    };

export type BadgeProps = BadgeOwnProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "color"> & { children: ReactNode };

// ─── Treatment classes (design.md D7: variants map through plain class
// records, as `Button` does — the shadcn badge's `class-variance-authority`
// import is replaced by this record pattern) ───

const VARIANT_CLASSES: Record<BadgeVariant, string[]> = {
  "rating-exceptional": ["bg-evaluation-rating-exceptional", "text-badge-text"],
  "rating-excellent": ["bg-evaluation-rating-excellent", "text-badge-text"],
  "rating-good": ["bg-evaluation-rating-good", "text-badge-text"],
  "rating-commercial": ["bg-evaluation-rating-commercial", "text-badge-text"],
  verified: ["bg-badge-verified-bg", "text-badge-verified-text"],
  provisional: ["bg-badge-provisional-bg", "text-badge-provisional-text"],
  // The taxonomy family carries its treatment as inline data colors (below).
  taxonomy: [],
};

const BASE_CLASSES = [
  "type-badge",
  "rounded-field",
  // Icon and label on one row, padded (design.md D14).
  "inline-flex",
  "items-center",
  "gap-1",
  "px-2",
  "py-0.5",
].join(" ");

// ─── Taxonomy data colors (design.md D7) ───
// The two inline colors of this variant are the only inline colors under
// `src/`, because they are data: the background comes from the taxonomy's own
// color — reduced by depth — and the label is white or black by the WCAG 2.2
// relative luminance `L` of that color (white when `L` ≤ 0.179, black above),
// which always picks the better pair (spec: "Badge label contrast").

const LUMINANCE_THRESHOLD = 0.179;

/** WCAG 2.2 relative luminance of a `#RRGGBB` color. */
function relativeLuminance(hex: string): number {
  const value = hex.replace(/^#/, "");
  const channel = (start: number): number => {
    const srgb = parseInt(value.slice(start, start + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/**
 * The card surface each theme renders the badge on (`--color-surface-card`),
 * as data: the label rule needs it during render, where CSS variables cannot
 * be read. `Badge.test.tsx` fails if these drift from `globals.css`
 * (design.md D7, review round 4).
 */
export const TAXONOMY_CARD_SURFACES = {
  traditional: "#f2e8d9",
  dark: "#0d1b1e",
} as const;

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
 * surface (design.md D7, review round 4).
 */
function labelOver(
  color: string,
  opacity: number,
  surface: string,
): "white" | "black" {
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
 * The taxonomy badge's inline colors: the data color as the background —
 * at 92% for level 1 and 85% for level 2, the plain color at level 0 — and
 * one label per theme as custom properties, which the `[data-taxonomy]` rule
 * of `globals.css` applies for the active theme. The label itself stays fully
 * opaque (spec: "Depth reduces the background").
 */
function taxonomyStyle(color: string, level: 0 | 1 | 2): CSSProperties {
  const depth = level === 1 ? 92 : level === 2 ? 85 : null;
  const opacity = depth === null ? 1 : depth / 100;
  return {
    backgroundColor:
      depth === null
        ? color
        : `color-mix(in srgb, ${color} ${depth}%, transparent)`,
    ["--taxonomy-label" as string]: labelOver(
      color,
      opacity,
      TAXONOMY_CARD_SURFACES.traditional,
    ),
    ["--taxonomy-label-dark" as string]: labelOver(
      color,
      opacity,
      TAXONOMY_CARD_SURFACES.dark,
    ),
  };
}

/**
 * Tazavera badge (the `feedback` spec: "Badge presentation", "Rating badge",
 * "Verification status badge", "Taxonomy badge"). Shadcn badge base rewired to
 * the settled classes above and composed with `cn`; no
 * `class-variance-authority`. The status families carry their icon before the
 * label; the taxonomy family carries its colors as inline data styles.
 */
export function Badge({
  variant,
  color,
  level,
  className,
  style,
  children,
  ...rest
}: BadgeProps): ReactNode {
  const Icon =
    variant === "verified" ? Check : variant === "provisional" ? Clock : null;

  return (
    <span
      {...rest}
      className={cn(
        BASE_CLASSES,
        VARIANT_CLASSES[variant].join(" "),
        className,
      )}
      data-taxonomy={variant === "taxonomy" ? "" : undefined}
      style={
        variant === "taxonomy" && color !== undefined && level !== undefined
          ? taxonomyStyle(color, level)
          : style
      }
    >
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
