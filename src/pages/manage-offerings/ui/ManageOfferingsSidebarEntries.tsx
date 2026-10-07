import type { ReactNode } from "react";
import { ManagementSidebarEntries } from "@/features/offering-management";
import { getMessages } from "@/shared/lib/i18n";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type ManageOfferingsSidebarEntriesProps = {
  locale: string;
};

/**
 * The list route's sidebar (design.md D8 as revised by review round 1;
 * spec "Management sidebar entry"): the sidebar frame with the single
 * "Manage offerings" entry, the `OfferingsSidebarScreen` pattern.
 */
export function ManageOfferingsSidebarEntries({ locale }: ManageOfferingsSidebarEntriesProps): ReactNode {
  const catalog = getMessages("offering-management", locale);
  return (
    <AppSidebar
      entries={
        <ManagementSidebarEntries locale={locale} label={catalog.sidebarManageOfferings!} />
      }
    />
  );
}
