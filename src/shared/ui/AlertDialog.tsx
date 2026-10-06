"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

/**
 * Alert dialog, pulled from the shadcn registry (Radix base) and rewired to
 * the project (add-evaluation-scales design.md D8), as `Sheet.tsx` is:
 * semantic tokens and radius tokens only, the overlay on `Sheet`'s classes,
 * no literal interface text. The registry's header, footer and button-styled
 * action pieces are dropped: the consumer composes `Button`s through
 * `asChild`. Segment-internal: consumed by `ConfirmDialog`.
 */

const OVERLAY_CLASSES = ["fixed", "inset-0", "z-50", "bg-nav-hover-shadow"].join(
  " ",
);

const CONTENT_CLASSES = [
  "fixed",
  "top-1/2",
  "left-1/2",
  "z-50",
  "-translate-x-1/2",
  "-translate-y-1/2",
  "w-[calc(100%-2rem)]",
  "max-w-lg",
  "bg-surface-card",
  "rounded-container",
  "shadow-lg",
  "p-6",
].join(" ");

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(OVERLAY_CLASSES, className)}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(CONTENT_CLASSES, className)}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogTitle({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" {...props} />;
}

function AlertDialogDescription({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

function AlertDialogAction({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action data-slot="alert-dialog-action" {...props} />
  );
}

function AlertDialogCancel({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" {...props} />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
