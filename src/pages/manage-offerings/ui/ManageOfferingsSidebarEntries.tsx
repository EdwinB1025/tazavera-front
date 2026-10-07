import type { ReactNode } from "react";
import { LocationsSidebarEntry } from "@/features/location-management";
import { ManagementSidebarEntries } from "@/features/offering-management";
import { getMessages } from "@/shared/lib/i18n";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type ManageOfferingsSidebarEntriesProps = {
  locale: string;
};

/**
 * The list route's sidebar (design.md D8 as revised by review round 1;
 * spec "Management sidebar entry"): the sidebar frame with the
 * "Manage offerings" entry, current, then "Manage locations"
 * (add-coffeeshop-location D8), the `OfferingsSidebarScreen` pattern.
 */
export function ManageOfferingsSidebarEntries({ locale }: ManageOfferingsSidebarEntriesProps): ReactNode {
  const catalog = getMessages("offering-management", locale);
  const locationsCatalog = getMessages("location-management", locale);
  return (
    <AppSidebar
      entries={
        <ManagementSidebarEntries locale={locale} label={catalog.sidebarManageOfferings!}>
          <LocationsSidebarEntry
            locale={locale}
            label={locationsCatalog.sidebarEntry!}
            current={false}
          />
        </ManagementSidebarEntries>
      }
    />
  );
}
