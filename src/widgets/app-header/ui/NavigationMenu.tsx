"use client";

import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Link,
} from "@/shared/ui";
import { Menu } from "@/shared/ui/icons";
import { primaryNavEntries } from "../lib/nav-entries";
import type { PrimaryNavEntryTexts } from "../lib/nav-entries";

// ─── UI-specific types (declared before the component) ───

export type NavigationMenuTexts = PrimaryNavEntryTexts & {
  /** The accessible name of the icon-only control. */
  navigationMenu: string;
};

export type NavigationMenuProps = {
  locale: string;
  texts: NavigationMenuTexts;
  /** The current route path; its entry is marked as the current page. */
  currentPath?: string;
};

// The ghost trigger of the header menus (refine-app-header design.md D3, D4),
// icon-only and square, shown below `md` only.
const TRIGGER_CLASSES = [
  "flex",
  "size-10",
  "items-center",
  "justify-center",
  "rounded-field",
  "text-nav-text",
  "hover:text-nav-text-hover",
  "focus-visible:focus-ring",
  "md:hidden",
].join(" ");

/**
 * The navigation menu of a small viewport (fix-production-aut-findings
 * design.md D7; spec "Header brand and primary navigation"): a three-lines
 * icon control that replaces the hidden primary navigation below `md` and
 * lists its entries, in order, the way the user menu lists its own — menu
 * items over the shared `Link` on the header's menu surface.
 */
export function NavigationMenu({
  locale,
  texts,
  currentPath,
}: NavigationMenuProps): ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={TRIGGER_CLASSES} aria-label={texts.navigationMenu}>
        <Menu aria-hidden className="size-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" surface="nav">
        {primaryNavEntries(locale, texts).map(({ path, query, label }) => (
          <DropdownMenuItem key={path} asChild>
            <Link
              href={`${path}${query}`}
              aria-current={path === currentPath ? "page" : undefined}
            >
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
