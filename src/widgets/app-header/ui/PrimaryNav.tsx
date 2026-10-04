import type { ReactNode } from "react";
import { Link } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───
// Texts arrive as props (design.md D10); the destinations are the
// navigation's own definition (design summary §3) and are built from the
// active locale.

export type PrimaryNavTexts = {
  topRated: string;
  aboutUs: string;
};

export type PrimaryNavProps = {
  locale: string;
  texts: PrimaryNavTexts;
};

// Hidden below `md`, shown from `md` up (design.md D11).
const NAV_CLASSES = ["hidden", "md:flex", "items-center", "gap-4"].join(" ");

/**
 * Header primary navigation (spec: "Header brand and primary navigation").
 *
 * "Top rated" points at the verified offerings ordered by cupping average
 * descending; "About us" at the About us page. Both entries show from the
 * `md` breakpoint up; below it they hide while the logotype, the language
 * selector and the session control stay.
 */
export function PrimaryNav({ locale, texts }: PrimaryNavProps): ReactNode {
  return (
    <nav className={NAV_CLASSES}>
      <Link href={`/${locale}/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc`}>
        {texts.topRated}
      </Link>
      <Link href={`/${locale}/about`}>{texts.aboutUs}</Link>
    </nav>
  );
}
