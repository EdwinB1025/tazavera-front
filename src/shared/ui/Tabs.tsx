"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

/**
 * Tabs, the shadcn composition on Radix rewired to the project (design.md D6;
 * the `content-structure` spec: "Tabs"). Controlled only: the consumer owns
 * `value` and receives selections through `onValueChange`. Activation is
 * manual — the arrow keys move the focus and Enter or Space selects — because
 * a selection may also be a navigation. The block contributes no text or data
 * of its own.
 */

// ─── UI-specific types (declared before the components) ───

export type TabsProps = Omit<
  React.ComponentProps<typeof TabsPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "activationMode"
> & {
  value: string;
  onValueChange: (value: string) => void;
};
export type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;
export type TabsTriggerProps = React.ComponentProps<
  typeof TabsPrimitive.Trigger
>;
export type TabsContentProps = React.ComponentProps<
  typeof TabsPrimitive.Content
>;

// ─── Settled classes (design.md D6) ───
// The list: a flex row with a 1px decorative bottom edge.
const LIST_CLASSES = ["flex", "border-b", "border-border-subtle"].join(" ");

// Each trigger: label type in the secondary text colour, 0.5rem × 0.75rem
// padding, at least 2.5rem tall. The selected trigger takes the primary text
// colour and a 2px accent bottom edge laid over the list's edge.
const TRIGGER_CLASSES = [
  "type-label",
  "text-text-secondary",
  "px-3",
  "py-2",
  "min-h-10",
  "-mb-px",
  "border-b-2",
  "border-transparent",
  "cursor-pointer",
  "focus-visible:focus-ring",
  "data-[state=active]:text-text-primary",
  "data-[state=active]:border-border-accent",
].join(" ");

// Panels render 1.5rem below the list.
const CONTENT_CLASSES = "mt-6";

function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      activationMode="manual"
      className={className}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(LIST_CLASSES, className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(TRIGGER_CLASSES, className)}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(CONTENT_CLASSES, className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
