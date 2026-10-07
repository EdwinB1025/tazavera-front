import type { ComponentProps, ReactNode } from "react";
import NextLink from "next/link";
import { ArrowLeft } from "@/shared/ui/icons";
import type { LucideIcon } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───
// `href` accepts only in-application routes. A plain `/${string}` template
// would accept a protocol-relative URL (`//example.com`) because it starts
// with `/`, so the conditional type rejects `//${string}` as well: an
// absolute URL and a protocol-relative URL are both compile errors with no
// runtime branch (spec: "External destination refused"). No generated API
// type is used here.
//
// The rest of the anchor surface (`id`, `aria-*`, events, `ref` and
// `className`) comes from `next/link`'s own props and passes through to the
// element, exactly as `ButtonProps` does for the native button surface (D0):
// a composing parent such as a menu entry (`DropdownMenuItem asChild`) merges
// its role, handlers and classes in through it. Props precedence (D0):
// `{...rest}` is spread before the component's own props, so `href` and the
// treatment classes can never be overridden by callers.

export type LinkProps<H extends `/${string}` = `/${string}`> = {
  // Reject protocol-relative URLs (and anything else is in-application).
  href: H extends `//${string}` ? never : H;
  variant?: "default" | "back"; // default "default"
  children: ReactNode;
} & Omit<ComponentProps<typeof NextLink>, "href" | "children">;

/**
 * The link treatment. Exported so a native anchor to an external destination,
 * which this component refuses by type, can carry the same treatment.
 */
export const LINK_CLASSES = [
  // Correction 6 (review round 1): the default link stays a plain inline text
  // run so its text wraps with the surrounding text; inline-flex/items-center/
  // gap-2 belong to the back variant only (see BACK_CLASSES).
  "underline",
  // Correction 5 (review round 1): the link color tokens are
  // --color-text-link and --color-text-link-hover, which generate the
  // utilities text-text-link and hover:text-text-link-hover. The unprefixed
  // text-link generates no CSS.
  "text-text-link",
  "hover:text-text-link-hover",
  "focus-visible:focus-ring",
].join(" ");

const BACK_CLASSES = [
  "inline-flex",
  "items-center",
  "gap-2",
].join(" ");

/**
 * Tazavera link — internal routes only.
 *
 * Renders `next/link` for client-side navigation. Always underlined in every
 * state (CSS `underline`, not a hover effect); colors come from the link tokens
 * and switch to the hover value on hover (D7). The `back` variant renders a
 * leading `ArrowLeft` icon at 16px with an 8px gap before the text. External
 * destinations are impossible: `href` is a conditional type over the
 * `/${string}` route template that resolves to `never` for a `//`-prefixed
 * value, so an absolute URL and a protocol-relative URL are both compile
 * errors with no runtime branch.
 */
export function Link<H extends `/${string}` = `/${string}`>({
  href,
  variant = "default",
  children,
  className,
  ...rest
}: LinkProps<H>): ReactNode {
  const LeadingIcon: LucideIcon | undefined =
    variant === "back" ? ArrowLeft : undefined;

  return (
    <NextLink
      {...rest}
      href={href}
      className={[
        LINK_CLASSES,
        variant === "back" ? BACK_CLASSES : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {LeadingIcon && <LeadingIcon className="size-4 shrink-0" />}
      {children}
    </NextLink>
  );
}
