import type { ReactNode } from "react";
import { getMessages, type MessageCatalog } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { parseInventoryFilters } from "@/features/inventory-facets";
import { PageSection } from "@/shared/ui";
import { InventoryListClient, type InventoryListTexts } from "./InventoryListClient";

// ─── UI-specific types (declared before the component) ───

export type ManageInventoryScreenProps = {
  locale: string;
  /** The route's search params: the filters. */
  searchParams: QueryRecord;
};

/** The list texts from the catalogs of the route's locale (design.md D10). */
function listTexts(
  catalog: MessageCatalog,
  filters: MessageCatalog,
  results: MessageCatalog,
): InventoryListTexts {
  return {
    trigger: filters.trigger,
    triggerWithCount: filters.triggerWithCount,
    noMatches: filters.noMatches,
    clearAll: filters.clearAll,
    resultCount: results.resultCount,
    eyebrow: catalog.eyebrow,
    heading: catalog.inventoryHeading,
    intro: catalog.inventoryIntro,
    signedOut: catalog.inventorySignedOut,
    signIn: catalog.signInLabel,
    empty: catalog.inventoryEmpty,
    error: catalog.inventoryError,
    retry: catalog.retryLabel,
    view: catalog.inventoryView,
    createOffering: catalog.inventoryCreateOffering,
    process: catalog.inventoryProcess,
    variety: catalog.inventoryVariety,
    roastLevel: catalog.inventoryRoastLevel,
    altitude: catalog.inventoryAltitude,
    producer: catalog.inventoryProducer,
    certifications: catalog.inventoryCertifications,
    roastery: catalog.inventoryRoastery,
    roastLot: catalog.inventoryRoastLot,
    productionDate: catalog.inventoryProductionDate,
  };
}

/**
 * The coffee inventory list (add-coffee-inventory-explorer design.md D6). A
 * thin server composition: it loads the catalog of the route's locale and
 * renders the client region on the page background, which receives every
 * text as props and reads the inventory on the client.
 */
export function ManageInventoryScreen({ locale, searchParams }: ManageInventoryScreenProps): ReactNode {
  const catalog = getMessages("offering-management", locale);
  const texts = listTexts(catalog, getMessages("filters", locale), getMessages("catalog", locale));
  const query = parseInventoryFilters(searchParams);
  return (
    <div className="flex-1">
      <PageSection surface="page">
        <InventoryListClient
          locale={locale}
          query={query}
          count={Object.keys(query).length}
          texts={texts}
        />
      </PageSection>
    </div>
  );
}
