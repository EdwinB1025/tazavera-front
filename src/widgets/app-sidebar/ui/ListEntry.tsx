"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSubsectionOutlet,
} from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The list's entry: its label from the caller's catalog and its route. */
export type ListEntryLink = { label: string; href: string };

/**
 * The entry of the list in view (collapse-sidebar-filters): a link to the
 * list, marked as the current page, with the list's sub-section below it.
 */
export function ListEntry({ label, href }: ListEntryLink): ReactNode {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive>
          <NextLink href={href} aria-current="page">
            {label}
          </NextLink>
        </SidebarMenuButton>
        <SidebarSubsectionOutlet />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
