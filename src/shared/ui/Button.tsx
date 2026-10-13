"use client";

import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Loader2 } from "@/shared/ui/icons";
import type { LucideIcon } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here; nothing consumes the API yet. These
// types are the only ones this change introduces for the button control.

export type ButtonVariant =
  | "primary"
  | "action-1"
  | "action-2"
  | "action-3"
  | "action-4"
  | "nav-button";

export type ButtonSize = "base" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant; // default "primary"
  size?: ButtonSize; // default "base"
  icon?: LucideIcon; // from the shared icon entry point
  loading?: boolean; // busy state — never the native `disabled` (D4)
} & (
  // An action control shown without visible text SHALL carry an accessible
  // name (spec: "Accessible naming of icon-only actions"). The union makes an
  // unnamed icon-only button a compile error.
  | { children: ReactNode; "aria-label"?: string }
  | { children?: never; "aria-label": string }
);

// `type`, `disabled`, `form`, `name`, `value`, `aria-*` and all native button
// events come from ButtonHTMLAttributes and pass through to the element; `type`
// defaults to "button" so forms never get accidental submits.

// ─── Treatment classes (D2: variants map 1:1 to semantic token families) ───
// Hover is gated by `enabled:` so a natively disabled button shows no hover
// change (D5). While busy (aria-disabled, not native disabled) `enabled:`
// alone is not enough — the hover treatment is omitted from the className
// entirely so a busy button cannot show a hover change (D4, correction 3).
// Focus uses the focus-ring + focus-offset tokens everywhere (D6).

const VARIANT_REST: Record<ButtonVariant, string> = {
  primary: [
    "border",
    "bg-action-primary",
    "text-action-primary-text",
    "border-action-primary-border",
  ].join(" "),
  "action-1": [
    "border",
    "bg-action-1-bg",
    "text-action-1-text",
    "border-action-1-border",
  ].join(" "),
  "action-2": [
    "border",
    "bg-action-2-bg",
    "text-action-2-text",
    "border-action-2-border",
  ].join(" "),
  "action-3": [
    "border",
    "bg-action-3-bg",
    "text-action-3-text",
    "border-action-3-border",
  ].join(" "),
  "action-4": [
    "border",
    "bg-action-4-bg",
    "text-action-4-text",
    "border-action-4-border",
  ].join(" "),
  "nav-button": [
    "border",
    "bg-nav-button-bg",
    "text-nav-button-text",
    "border-nav-button-border",
  ].join(" "),
};

const VARIANT_HOVER: Record<ButtonVariant, string> = {
  primary: "enabled:hover:bg-action-primary-hover",
  "action-1": [
    "enabled:hover:bg-action-1-bg-hover",
    "enabled:hover:text-action-1-text-hover",
  ].join(" "),
  "action-2": [
    "enabled:hover:bg-action-2-bg-hover",
    "enabled:hover:text-action-2-text-hover",
  ].join(" "),
  "action-3": [
    "enabled:hover:bg-action-3-bg-hover",
    "enabled:hover:text-action-3-text-hover",
  ].join(" "),
  "action-4": [
    "enabled:hover:bg-action-4-bg-hover",
    "enabled:hover:text-action-4-text-hover",
  ].join(" "),
  "nav-button": [
    "enabled:hover:bg-nav-button-bg-hover",
    "enabled:hover:text-nav-button-text-hover",
    "enabled:hover:border-nav-button-border-hover",
  ].join(" "),
};

// The same hover treatment for an anchor carrying the button look
// (open-directory-from-hero design.md D1): an anchor never matches `:enabled`,
// so it takes the plain `hover:` form. Written out so Tailwind generates it.
const VARIANT_LINK_HOVER: Record<ButtonVariant, string> = {
  primary: "hover:bg-action-primary-hover",
  "action-1": "hover:bg-action-1-bg-hover hover:text-action-1-text-hover",
  "action-2": "hover:bg-action-2-bg-hover hover:text-action-2-text-hover",
  "action-3": "hover:bg-action-3-bg-hover hover:text-action-3-text-hover",
  "action-4": "hover:bg-action-4-bg-hover hover:text-action-4-text-hover",
  "nav-button": [
    "hover:bg-nav-button-bg-hover",
    "hover:text-nav-button-text-hover",
    "hover:border-nav-button-border-hover",
  ].join(" "),
};

// ─── Geometry (D3) ───
// base = h-10 px-4, sm = h-8 px-3; icon-only buttons stay square (w-10 / w-8).

const SIZE_GEOMETRY: Record<ButtonSize, string> = {
  base: "h-10 px-4",
  sm: "h-8 px-3",
};

// A labelled action button is at least its size's action width and keeps its
// label on one line; a longer label grows it (unify-action-button-widths D2).
// The navigation treatment is header and sidebar chrome, not an action.
const ACTION_WIDTH: Record<ButtonSize, string> = {
  base: "min-w-action-base whitespace-nowrap",
  sm: "min-w-action-sm whitespace-nowrap",
};

const ICON_ONLY_GEOMETRY: Record<ButtonSize, string> = {
  base: "h-10 w-10",
  sm: "h-8 w-8",
};

const BASE_CLASSES = [
  "type-button",
  "inline-flex",
  "items-center",
  "justify-center",
  "gap-2",
  "rounded-pill",
  "focus-visible:focus-ring",
  // disabled (D5): native disabled + opacity + cursor, exempt from contrast
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

/** The classes `Button` renders, before its own `className`. */
function buttonClasses({ variant, size, iconOnly, busy }: {
  variant: ButtonVariant;
  size: ButtonSize;
  iconOnly: boolean;
  busy: boolean;
}): string {
  const geometry = iconOnly ? ICON_ONLY_GEOMETRY[size] : SIZE_GEOMETRY[size];
  const width = iconOnly || variant === "nav-button" ? "" : ACTION_WIDTH[size];
  return [
    BASE_CLASSES,
    VARIANT_REST[variant],
    // Hover treatment is omitted while busy so a busy button shows no
    // hover change (D4/D5, correction 3). Native disabled is still gated
    // by `enabled:` within the hover classes themselves.
    busy ? "" : VARIANT_HOVER[variant],
    geometry,
    width,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * The classes of a labelled `Button` for an anchor that opens a route with
 * the button's look (open-directory-from-hero design.md D1): the same base,
 * rest, geometry and width, with the hover treatment in its anchor form.
 */
export function buttonLinkClasses(variant: ButtonVariant, size: ButtonSize = "base"): string {
  const width = variant === "nav-button" ? "" : ACTION_WIDTH[size];
  return [BASE_CLASSES, VARIANT_REST[variant], VARIANT_LINK_HOVER[variant], SIZE_GEOMETRY[size], width]
    .filter(Boolean)
    .join(" ");
}

/**
 * Tazavera action button.
 *
 * Treatments, sizes and states per the `base-controls` spec and design.md
 * (D2 treatments, D3 geometry, D4 busy, D5 disabled, D6 focus). The label
 * stays visible while busy so the control's width does not change; while busy
 * the button sets `aria-busy` and `aria-disabled` (not the native `disabled`)
 * so it ignores activation while keeping keyboard focus.
 */
export function Button({
  variant = "primary",
  size = "base",
  icon,
  loading = false,
  type = "button",
  disabled,
  onClick,
  children,
  className,
  ...rest
}: ButtonProps): ReactNode {
  const isIconOnly = children === undefined || children === null;

  // While busy the spinner (Loader2) replaces any custom icon; for icon-only
  // buttons that keeps the square footprint (D4).
  const LeadingIcon: LucideIcon | undefined = loading ? Loader2 : icon;
  const showLeading = LeadingIcon !== undefined;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    // While busy (aria-disabled) the button ignores activation AND cancels
    // the native default action: a busy submit button must not submit its
    // form (spec: "Busy does not submit forms"). Returning early from
    // onClick alone does not cancel the native default action.
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={[
        buttonClasses({ variant, size, iconOnly: isIconOnly, busy: loading }),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showLeading && (
        <LeadingIcon
          className={
            loading
              ? "size-4 shrink-0 animate-spin motion-reduce:animate-none"
              : "size-4 shrink-0"
          }
        />
      )}
      {children}
    </button>
  );
}
