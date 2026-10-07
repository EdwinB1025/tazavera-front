"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { SidebarMenuItem, SidebarMenuButton } from "@/shared/ui";
import { MapPin } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type LocationsSidebarEntryProps = {
  locale: string;
  /** The entry's visible text (`sidebarEntry`). */
  label: string;
  /** Whether the locations route is the current page. */
  current: boolean;
};

/**
 * The "Manage locations" sidebar entry (design.md D8; spec "Management
 * sidebar entry"): one menu item linking to the locations route, marked as
 * the current entry only on that route. A navigation item, so it renders
 * `next/link` (the `ManagementSidebarEntries` precedent).
 */
export function LocationsSidebarEntry({
  locale,
  label,
  current,
}: LocationsSidebarEntryProps): ReactNode {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={current} icon={MapPin}>
        <NextLink
          href={`/${locale}/manage/locations`}
          aria-current={current ? "page" : undefined}
        >
          {label}
        </NextLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
