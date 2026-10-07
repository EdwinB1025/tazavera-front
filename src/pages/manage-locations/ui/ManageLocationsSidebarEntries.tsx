import type { ReactNode } from "react";
import { LocationsSidebarEntry } from "@/features/location-management";
import { ManagementSidebarEntries } from "@/features/offering-management";
import { getMessages } from "@/shared/lib/i18n";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type ManageLocationsSidebarEntriesProps = {
  locale: string;
};

/**
 * The locations route's sidebar (design.md D8; spec "Management sidebar
 * entry"): the sidebar frame with "Manage offerings", not current, then
 * "Manage locations", current.
 */
export function ManageLocationsSidebarEntries({
  locale,
}: ManageLocationsSidebarEntriesProps): ReactNode {
  const offeringsCatalog = getMessages("offering-management", locale);
  const catalog = getMessages("location-management", locale);
  return (
    <AppSidebar
      entries={
        <ManagementSidebarEntries
          locale={locale}
          label={offeringsCatalog.sidebarManageOfferings!}
          current={false}
        >
          <LocationsSidebarEntry locale={locale} label={catalog.sidebarEntry!} current />
        </ManagementSidebarEntries>
      }
    />
  );
}
