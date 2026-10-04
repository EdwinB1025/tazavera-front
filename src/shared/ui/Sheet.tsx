"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

/**
 * Sheet, pulled from the shadcn registry (Radix base) and rewired to the
 * project (design.md D6): semantic tokens and radius tokens only, no
 * generated control duplicate and no literal interface text. Below `md` it is
 * the full-screen overlay the management sidebar opens in (design.md D11).
 */

const OVERLAY_CLASSES = ["fixed", "inset-0", "z-50", "bg-nav-hover-shadow"].join(
  " ",
);

const SIDE_CLASSES: Record<"top" | "right" | "bottom" | "left", string> = {
  top: "inset-x-0 top-0 h-full w-full",
  right: "inset-y-0 right-0 h-full w-full",
  bottom: "inset-x-0 bottom-0 h-full w-full",
  left: "inset-y-0 left-0 h-full w-full",
};

const PANEL_CLASSES = [
  "fixed",
  "z-50",
  "flex",
  "flex-col",
  "bg-nav-surface-dark",
  "text-nav-text-dark",
].join(" ");

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(OVERLAY_CLASSES, className)}
      {...props}
    />
  );
}

function SheetContent({
  side = "left",
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(PANEL_CLASSES, SIDE_CLASSES[side], className)}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("type-label", className)}
      {...props}
    />
  );
}

function SheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
};
