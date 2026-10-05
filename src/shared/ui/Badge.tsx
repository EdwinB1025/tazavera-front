import type { HTMLAttributes, ReactNode } from "react";
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
  return (
    0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  );
}

/**
 * The taxonomy badge's inline colors: the data color as the background —
 * at 92% for level 1 and 85% for level 2, the plain color at level 0 — and
 * the luminance-picked label color. The label itself stays fully opaque
 * (spec: "Depth reduces the background").
 */
function taxonomyStyle(
  color: string,
  level: 0 | 1 | 2,
): { backgroundColor: string; color: "white" | "black" } {
  const depth = level === 1 ? 92 : level === 2 ? 85 : null;
  return {
    backgroundColor:
      depth === null
        ? color
        : `color-mix(in srgb, ${color} ${depth}%, transparent)`,
    color:
      relativeLuminance(color) <= LUMINANCE_THRESHOLD ? "white" : "black",
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
  const Icon = variant === "verified" ? Check : variant === "provisional" ? Clock : null;

  return (
    <span
      {...rest}
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant].join(" "), className)}
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
