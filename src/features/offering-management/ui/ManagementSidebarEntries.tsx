import type { ReactNode } from "react";
import NextLink from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/shared/ui";
import { List } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type ManagementSidebarEntriesProps = {
  locale: string;
  /** The entry's visible text (`sidebarManageOfferings`). */
  label: string;
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
}: ManagementSidebarEntriesProps): ReactNode {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive icon={List}>
          <NextLink href={`/${locale}/manage/offerings`} aria-current="page">
            {label}
          </NextLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
