import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Check, Clock } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/utils";
import {
  TAXONOMY_CARD_SURFACES,
  TAXONOMY_SIDEBAR_SURFACES,
  taxonomyColorRule,
} from "@/shared/ui/taxonomy-color";

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

/**
 * The badge's geometry — text treatment, field radius and the icon/label row
 * with its gap and padding (design.md D14) — as the one exported definition
 * other compact chips reuse (design.md D1). The token order is the one
 * `Badge.test.tsx` pins.
 */
export const BADGE_GEOMETRY_CLASSES =
  "type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5";

// ─── Taxonomy data colors (design.md D7) ───
// The two inline colors of this variant are the only inline colors under
// `src/`, because they are data: the background comes from the taxonomy's own
// color — reduced by depth — and the label is white or black by the shared
// taxonomy colour rule (`taxonomy-color.ts`; spec: "Badge label contrast").

export { TAXONOMY_CARD_SURFACES, TAXONOMY_SIDEBAR_SURFACES };

/**
 * The taxonomy badge's inline colors: the data color as the background —
 * at 92% for level 1 and 85% for level 2, the plain color at level 0 — and
 * one label per theme and surface (card, or sidebar inside the inverse
 * variant) as custom properties, which the `[data-taxonomy]` rules of
 * `globals.css` apply for the active theme and surface. The label itself
 * stays fully opaque (spec: "Depth reduces the background").
 */
function taxonomyStyle(color: string, level: 0 | 1 | 2): CSSProperties {
  const { opacity, label, labelDark, labelInverse, labelInverseDark } =
    taxonomyColorRule(color, level);
  return {
    backgroundColor:
      opacity === 1
        ? color
        : `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`,
    ["--taxonomy-label" as string]: label,
    ["--taxonomy-label-dark" as string]: labelDark,
    ["--taxonomy-label-inverse" as string]: labelInverse,
    ["--taxonomy-label-inverse-dark" as string]: labelInverseDark,
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
        BADGE_GEOMETRY_CLASSES,
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
