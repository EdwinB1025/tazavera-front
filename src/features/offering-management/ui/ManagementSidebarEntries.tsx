"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/shared/ui";
import { List } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type ManagementSidebarEntriesProps = {
  locale: string;
  /** The entry's visible text (`sidebarManageOfferings`). */
  label: string;
  /** Whether the entry is the current page (default `true`; add-coffeeshop-location D8). */
  current?: boolean;
  /** Further entries, rendered after this one in the same list (add-coffeeshop-location D8). */
  children?: ReactNode;
};

/**
 * The management sidebar entry (design.md D8 as revised by review round 1;
 * spec "Management sidebar entry"): one "Manage offerings" link to the list
 * route, marked as the current entry on both management routes. The entry is
 * a navigation item, not an inline link, so it renders `next/link` and not
 * the always-underlined shared `Link` (the `PrimaryNav` precedent).
 */
export function ManagementSidebarEntries({
  locale,
  label,
  current = true,
  children,
}: ManagementSidebarEntriesProps): ReactNode {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={current} icon={List}>
          <NextLink
            href={`/${locale}/manage/offerings`}
            aria-current={current ? "page" : undefined}
          >
            {label}
          </NextLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {children}
    </SidebarMenu>
  );
}
