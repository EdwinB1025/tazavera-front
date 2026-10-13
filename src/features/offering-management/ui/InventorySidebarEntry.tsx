"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { SidebarMenuItem, SidebarMenuButton } from "@/shared/ui";
import { Compass } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type InventorySidebarEntryProps = {
  locale: string;
  /** The entry's visible text (`sidebarExploreInventory`). */
  label: string;
  /** Whether an inventory route is the current page. */
  current: boolean;
  /** The list's sub-section, rendered under the entry (only on the inventory list). */
  subsection?: ReactNode;
};

/**
 * The "Explore coffee inventory" sidebar entry (add-inventory-sidebar-entry
 * design.md D1–D3; spec "Management sidebar entry"): one menu item linking
 * to the inventory list with the user menu's `Compass` icon, marked as the
 * current entry only on the inventory routes, holding the list's sub-section
 * when given. A navigation item, so it renders `next/link` (the
 * `ManagementSidebarEntries` precedent).
 */
export function InventorySidebarEntry({
  locale,
  label,
  current,
  subsection,
}: InventorySidebarEntryProps): ReactNode {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={current} icon={Compass}>
        <NextLink
          href={`/${locale}/manage/inventory`}
          aria-current={current ? "page" : undefined}
        >
          {label}
        </NextLink>
      </SidebarMenuButton>
      {subsection}
    </SidebarMenuItem>
  );
}
