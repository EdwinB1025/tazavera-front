import type { ReactNode } from "react";
import NextLink from "next/link";
import { ArrowLeft } from "@/shared/ui/icons";
import type { LucideIcon } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───
// `href` is typed `/${string}` so an absolute URL is a compile error with no
// runtime branch (spec: "External destination refused"). No generated API type
// is used here.

export type LinkProps = {
  href: `/${string}`; // in-application route — an absolute URL is a compile error
  variant?: "default" | "back"; // default "default"
  children: ReactNode;
};

const BASE_CLASSES = [
  "inline-flex",
  "items-center",
  "gap-2",
  "underline",
  "text-link",
  "hover:text-link-hover",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-focus-ring",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-focus-offset",
].join(" ");

/**
 * Tazavera link — internal routes only.
 *
 * Renders `next/link` for client-side navigation. Always underlined in every
 * state (CSS `underline`, not a hover effect); colors come from the link tokens
 * and switch to the hover value on hover (D7). The `back` variant renders a
 * leading `ArrowLeft` icon at 16px with an 8px gap before the text. External
 * destinations are impossible: `href` is typed `/${string}`, so an absolute URL
 * is a compile error with no runtime branch.
 */
export function Link({ href, variant = "default", children }: LinkProps): ReactNode {
  const LeadingIcon: LucideIcon | undefined =
    variant === "back" ? ArrowLeft : undefined;

  return (
    <NextLink href={href} className={BASE_CLASSES}>
      {LeadingIcon && <LeadingIcon className="size-4 shrink-0" />}
      {children}
    </NextLink>
  );
}
