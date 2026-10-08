import type { ReactNode } from "react";
import NextLink from "next/link";
import { primaryNavEntries } from "../lib/nav-entries";
import type { PrimaryNavEntryTexts } from "../lib/nav-entries";

// ─── UI-specific types (declared before the component) ───
// Texts arrive as props (design.md D10); the destinations are the
// navigation's own definition (design summary §3) and are built from the
// active locale. `currentPath` is the current route's path, read on the
// client by the shell chrome (refine-app-header design.md D14).

export type PrimaryNavTexts = PrimaryNavEntryTexts & {
  /** The navigation landmark's name (label-landmarks-and-headings D1). */
  primaryNavigation?: string;
};

export type PrimaryNavProps = {
  locale: string;
  texts: PrimaryNavTexts;
  currentPath?: string;
};

// Hidden below `md`, shown from `md` up (design.md D11). `md:ml-4` adds to
// the left group's `gap-4`, so the navigation sits 2rem from the logotype
// (refine-app-header design.md D14).
const NAV_CLASSES = ["hidden", "md:flex", "items-center", "md:ml-4"].join(" ");

// refine-app-header design.md D14: header navigation items, not inline links,
// so the entries render `next/link` and not the always-underlined shared Link.
const ITEM_CLASSES = [
  "type-navbar-item",
  "flex",
  "h-16",
  "items-center",
  "justify-center",
  "px-6",
  "focus-visible:focus-ring",
].join(" ");
const HOVER_CLASSES = ["hover:bg-nav-hover", "hover:text-nav-text-hover"].join(" ");
// The current entry takes no hover fill: its bar fails 3:1 on `nav-hover`.
const CURRENT_CLASSES = ["border-b-2", "border-nav-indicator"].join(" ");

/**
 * Header primary navigation (spec: "Header brand and primary navigation").
 *
 * "Top rated" points at the verified offerings ordered by cupping average
 * descending; "Explore coffee shops" at the coffee shop directory
 * (add-coffeeshop-directory design.md D15); "About us" at the About us page.
 * The entries show from the
 * `md` breakpoint up; below it they hide while the logotype, the language
 * selector and the session control stay. The entry whose path equals
 * `currentPath` (query ignored) is marked as the current page.
 */
export function PrimaryNav({ locale, texts, currentPath }: PrimaryNavProps): ReactNode {
  const entries = primaryNavEntries(locale, texts);

  return (
    <nav aria-label={texts.primaryNavigation} className={NAV_CLASSES}>
      {entries.map(({ path, query, label }) => {
        const current = path === currentPath;
        return (
          <NextLink
            key={path}
            href={`${path}${query}`}
            aria-current={current ? "page" : undefined}
            className={`${ITEM_CLASSES} ${current ? CURRENT_CLASSES : HOVER_CLASSES}`}
          >
            {label}
          </NextLink>
        );
      })}
    </nav>
  );
}
