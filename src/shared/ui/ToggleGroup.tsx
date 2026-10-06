"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

/**
 * Toggle group, pulled from the shadcn registry (Radix base) and rewired to
 * the project (add-evaluation-scales design.md D6), as `Sheet.tsx` is: the
 * registry's `class-variance-authority` toggle variants are dropped, so the
 * pieces carry no treatment of their own and the consumer supplies semantic
 * token classes only. Segment-internal: consumed by `DescriptorChipGroup`.
 */

function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn(className)}
      {...props}
    />
  );
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
