"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { buttonLinkClasses } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ExploreButtonProps = {
  locale: string;
  label: string;
};

/**
 * The hero's primary action (open-directory-from-hero design.md D2; the
 * landing spec "Entry page hero"). A link that opens the coffee shop
 * directory of the active locale through client-side navigation, with the
 * look of the action button treatment 3. It stays a Client Component because
 * its classes come from the client module of `Button`; the label arrives as a
 * prop (design.md D11).
 */
export function ExploreButton({ locale, label }: ExploreButtonProps): ReactNode {
  return (
    <NextLink href={`/${locale}/coffeeshops`} className={buttonLinkClasses("action-3")}>
      {label}
    </NextLink>
  );
}
