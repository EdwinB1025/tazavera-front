import type { MessageCatalog } from "@/shared/lib/i18n";

/** Every text of the inventory facets and toolbar (design.md D5). */
export type InventoryFilterTexts = {
  title: string;
  coffeeName: string;
  originCountry: string;
  originRegion: string;
  process: string;
  producer: string;
  city: string;
  clearAll: string;
  removeFilter: string;
  trigger: string;
  triggerWithCount: string;
};

/** The facet labels from `offering-management`, the generic texts from `filters`. */
export function inventoryFacetsTexts(
  management: MessageCatalog,
  filters: MessageCatalog,
): InventoryFilterTexts {
  return {
    title: filters.title,
    coffeeName: management.facetCoffeeName,
    originCountry: management.facetCountry,
    originRegion: management.facetRegion,
    process: management.facetProcess,
    producer: management.facetProducer,
    city: management.facetCity,
    clearAll: filters.clearAll,
    removeFilter: filters.removeFilter,
    trigger: filters.trigger,
    triggerWithCount: filters.triggerWithCount,
  };
}
