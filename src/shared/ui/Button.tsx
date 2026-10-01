import type { ButtonHTMLAttributes, ReactNode } from "react";
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
// defaults to "button" so forms never get accidental submits. The component is
// implemented in task 2.3.
