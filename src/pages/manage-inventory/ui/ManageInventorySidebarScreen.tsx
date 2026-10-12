import type { ReactNode } from "react";
import {
  INVENTORY_FILTER_KEYS,
  InventoryFacets,
  inventoryFacetsTexts,
  parseInventoryFilters,
} from "@/features/inventory-facets";
import { LocationsSidebarEntry } from "@/features/location-management";
import { InventorySidebarEntry, ManagementSidebarEntries } from "@/features/offering-management";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { FilterMemoryScope, SidebarMenuSub } from "@/shared/ui";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type ManageInventorySidebarScreenProps = {
  locale: string;
  /** The list's search params; without them (the detail) no facets render. */
  searchParams?: QueryRecord;
};

/**
 * The inventory routes' sidebar (add-coffee-inventory-explorer design.md D6,
 * D7; spec "Coffee inventory sidebar"): "Manage offerings" and "Manage
 * locations", not current, then "Explore coffee inventory", current, with
 * their icons in one list (add-inventory-sidebar-entry D1), holding the
 * inventory facets' sub-section on the list (D3).
 */
export function ManageInventorySidebarScreen({
  locale,
  searchParams,
}: ManageInventorySidebarScreenProps): ReactNode {
  const catalog = getMessages("offering-management", locale);
  const filters = getMessages("filters", locale);
  return (
    <AppSidebar
      entries={
        <ManagementSidebarEntries locale={locale} label={catalog.sidebarManageOfferings!} current={false}>
          <LocationsSidebarEntry
            locale={locale}
            label={getMessages("location-management", locale).sidebarEntry!}
            current={false}
          />
          <InventorySidebarEntry
            locale={locale}
            label={catalog.sidebarExploreInventory!}
            current
            subsection={
              searchParams && (
                <SidebarMenuSub title={filters.title!}>
                  {/* The facets keep the list's filters (remember-list-preferences D2, D5). */}
                  <FilterMemoryScope name="coffee-inventory" keys={INVENTORY_FILTER_KEYS}>
                    <InventoryFacets
                      values={parseInventoryFilters(searchParams)}
                      texts={inventoryFacetsTexts(catalog, filters)}
                    />
                  </FilterMemoryScope>
                </SidebarMenuSub>
              )
            }
          />
        </ManagementSidebarEntries>
      }
    />
  );
}
