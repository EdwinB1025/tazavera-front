import type { ReactNode } from "react";
import { LocationsSidebarEntry } from "@/features/location-management";
import { InventorySidebarEntry, ManagementSidebarEntries } from "@/features/offering-management";
import { getMessages } from "@/shared/lib/i18n";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type NewOfferingSidebarEntriesProps = {
  locale: string;
};

/**
 * The create route's sidebar (design.md D8 as revised by review round 1;
 * spec "Management sidebar entry"): the sidebar frame with the
 * "Manage offerings" entry, current, then "Manage locations"
 * (add-coffeeshop-location D8) and "Explore coffee inventory"
 * (add-inventory-sidebar-entry D1), the `OfferingsSidebarScreen` pattern.
 */
export function NewOfferingSidebarEntries({ locale }: NewOfferingSidebarEntriesProps): ReactNode {
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
          <InventorySidebarEntry
            locale={locale}
            label={catalog.sidebarExploreInventory!}
            current={false}
          />
        </ManagementSidebarEntries>
      }
    />
  );
}
