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
// Hover is gated by `enabled:` so a disabled button shows no hover change (D5).
// Focus uses the focus-ring + focus-offset tokens everywhere (D6).

const VARIANT_TREATMENTS: Record<ButtonVariant, string> = {
  primary: [
    "bg-action-primary",
    "text-action-primary-text",
    "enabled:hover:bg-action-primary-hover",
  ].join(" "),
  "action-1": [
    "bg-action-1-bg",
    "text-action-1-text",
    "enabled:hover:bg-action-1-bg-hover",
    "enabled:hover:text-action-1-text-hover",
  ].join(" "),
  "action-2": [
    "bg-action-2-bg",
    "text-action-2-text",
    "enabled:hover:bg-action-2-bg-hover",
    "enabled:hover:text-action-2-text-hover",
  ].join(" "),
  "action-3": [
    "bg-action-3-bg",
    "text-action-3-text",
    "enabled:hover:bg-action-3-bg-hover",
    "enabled:hover:text-action-3-text-hover",
  ].join(" "),
  "action-4": [
    "bg-action-4-bg",
    "text-action-4-text",
    "enabled:hover:bg-action-4-bg-hover",
    "enabled:hover:text-action-4-text-hover",
  ].join(" "),
  "nav-button": [
    "border",
    "bg-nav-button-bg",
    "text-nav-button-text",
    "border-nav-button-border",
    "enabled:hover:bg-nav-button-bg-hover",
    "enabled:hover:text-nav-button-text-hover",
    "enabled:hover:border-nav-button-border-hover",
  ].join(" "),
};

// ─── Geometry (D3) ───
// base = h-10 px-4, sm = h-8 px-3; icon-only buttons stay square (w-10 / w-8).

const SIZE_GEOMETRY: Record<ButtonSize, string> = {
  base: "h-10 px-4",
  sm: "h-8 px-3",
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
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-focus-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-focus-offset",
  // disabled (D5): native disabled + opacity + cursor, exempt from contrast
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

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

  const geometry = isIconOnly
    ? ICON_ONLY_GEOMETRY[size]
    : SIZE_GEOMETRY[size];

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
      className={[BASE_CLASSES, VARIANT_TREATMENTS[variant], geometry, className]
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
