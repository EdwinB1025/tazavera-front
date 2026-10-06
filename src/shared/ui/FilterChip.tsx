"use client";

import type { ReactNode, Ref } from "react";
import { X } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/utils";
import { BADGE_GEOMETRY_CLASSES } from "./Badge";

// ─── UI-specific types (declared before the component) ───
// The consumer supplies the value text and the filled accessible name
// ("Remove filter: {facet}: {value}"); no generated API type is used.

export type FilterChipProps = {
  value: string;
  label: string; // accessible name
  onRemove: () => void;
  ref?: Ref<HTMLButtonElement>;
};

// The shared badge geometry first, the chip's differences as treatments on
// top (design.md D4, "geometría de chip compartida"). The differences use
// Tailwind's important modifier because `cn` does not merge classes: two
// utilities of one property on an element would resolve by stylesheet order.
const CHIP_CLASSES =
  "rounded-pill! min-h-7 gap-1.5! py-1! pl-3! border border-border-inverse text-nav-text-dark hover:underline focus-visible:focus-ring";

/** Applied-filter chip: activating it removes its value (spec "Applied-filter chips"). */
export function FilterChip({ value, label, onRemove, ref }: FilterChipProps): ReactNode {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      onClick={onRemove}
      className={cn(BADGE_GEOMETRY_CLASSES, CHIP_CLASSES)}
    >
      {value}
      <X className="size-4 shrink-0" aria-hidden="true" />
    </button>
  );
}
