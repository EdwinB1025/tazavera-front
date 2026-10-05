"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { Check, ChevronRight } from "@/shared/ui/icons";

/**
 * Dropdown menu, pulled from the shadcn registry (Radix base) and rewired to
 * the project (design.md D6): classes remapped to semantic tokens and radius
 * tokens only, icons taken from the shared icon entry point, and no generated
 * control duplicate left beside `base-controls` and `form-fields`.
 */

// ─── Treatment classes ───
// The panel is a card-surface popover with a strong boundary; the entries are
// controls that highlight on focus with the nav-hover pair and use the shared
// focus indicator (design summary §3).
//
// The `surface` variant (refine-app-header design.md D2) gives the header
// menus a second, nav-surface set. `cn` is a plain joiner with no
// tailwind-merge (explore finding F3), so each styled part carries two
// complete class sets instead of letting a caller override one, and the
// surface reaches the parts through an internal context.

type Surface = "card" | "nav";

const SurfaceContext = React.createContext<Surface>("card");

const PART_CLASSES = {
  content: {
    card: [
      "z-50",
      "min-w-48",
      "rounded-container",
      "border",
      "border-border-strong",
      "bg-surface-card",
      "p-1",
      "text-text-primary",
      "shadow-md",
    ].join(" "),
    // the header's surface, text and field radius in place of the card
    // treatment; the boundary, shadow and geometry stay (design.md D2)
    nav: [
      "z-50",
      "min-w-48",
      "rounded-field",
      "border",
      "border-border-strong",
      "bg-nav-surface",
      "p-1",
      "text-nav-text",
      "shadow-md",
    ].join(" "),
  },
  item: {
    card: [
      "type-control",
      "relative",
      "flex",
      "cursor-default",
      "select-none",
      "items-center",
      "gap-2",
      "rounded-field",
      "px-3",
      "py-2",
      "focus:bg-nav-hover",
      "focus-visible:focus-ring",
      "data-[variant=destructive]:text-feedback-error",
      "data-disabled:pointer-events-none",
      "data-disabled:opacity-50",
      "[&_svg]:pointer-events-none",
      "[&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:size-4",
    ].join(" "),
    // `type-navlist-item` binds `nav-text`, so one class owns the colour;
    // `nav-text-hover` over `nav-hover` on hover and focus (design.md D2)
    nav: [
      "type-navlist-item",
      "relative",
      "flex",
      "cursor-default",
      "select-none",
      "items-center",
      "gap-2",
      "rounded-field",
      "px-3",
      "py-2",
      "hover:bg-nav-hover",
      "hover:text-nav-text-hover",
      "focus:bg-nav-hover",
      "focus:text-nav-text-hover",
      "focus-visible:focus-ring",
      "data-[variant=destructive]:text-feedback-error",
      "data-disabled:pointer-events-none",
      "data-disabled:opacity-50",
      "[&_svg]:pointer-events-none",
      "[&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:size-4",
    ].join(" "),
  },
  // label, shortcut and separator keep their current treatment on both
  // surfaces (design.md D2); the header menus do not use them
  label: { card: "type-meta px-3 py-1", nav: "type-meta px-3 py-1" },
  separator: {
    card: "-mx-1 my-1 h-px bg-border-subtle",
    nav: "-mx-1 my-1 h-px bg-border-subtle",
  },
  shortcut: { card: "type-meta ml-auto", nav: "type-meta ml-auto" },
} as const;

/** The styled part's class set for the menu's surface (design.md D2). */
function useSurfaceClasses(part: keyof typeof PART_CLASSES): string {
  const surface = React.useContext(SurfaceContext);
  return PART_CLASSES[part][surface];
}

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  surface = "card",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  /** The treatment set: the card panel by default, `nav` for the header menus. */
  surface?: Surface;
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <SurfaceContext.Provider value={surface}>
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          sideOffset={sideOffset}
          align={align}
          className={cn(PART_CLASSES.content[surface], className)}
          {...props}
        />
      </SurfaceContext.Provider>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  const classes = useSurfaceClasses("item");
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(classes, inset && "pl-8", className)}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean;
}) {
  const classes = useSurfaceClasses("item");
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(classes, "pr-8", inset && "pl-8", className)}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <Check />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean;
}) {
  const classes = useSurfaceClasses("item");
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(classes, "pr-8", inset && "pl-8", className)}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <Check />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  const classes = useSurfaceClasses("label");
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(classes, inset && "pl-8", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  const classes = useSurfaceClasses("separator");
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(classes, className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const classes = useSurfaceClasses("shortcut");
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(classes, className)}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  const classes = useSurfaceClasses("item");
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(classes, inset && "pl-8", className)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const classes = useSurfaceClasses("content");
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(classes, className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
