import type { ReactNode } from "react";
import { InventoryFacets, inventoryFacetsTexts, parseInventoryFilters } from "@/features/inventory-facets";
import { LocationsSidebarEntry } from "@/features/location-management";
import { ManagementSidebarEntries } from "@/features/offering-management";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
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
 * locations", not current, then "Explore coffee inventory" as the list's
 * entry, current, holding the inventory facets on the list.
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
        </ManagementSidebarEntries>
      }
      listEntry={{ label: catalog.sidebarExploreInventory!, href: `/${locale}/manage/inventory` }}
      subsection={
        searchParams
          ? {
              title: filters.title!,
              content: (
                <InventoryFacets
                  values={parseInventoryFilters(searchParams)}
                  texts={inventoryFacetsTexts(catalog, filters)}
                />
              ),
            }
          : undefined
      }
    />
  );
}
