import type { ReactNode } from "react";
import { getMessages, type MessageCatalog } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { InventoryDetailClient, type InventoryDetailTexts } from "./InventoryDetailClient";

// ─── UI-specific types (declared before the component) ───

export type InventoryDetailScreenProps = {
  locale: string;
  ulid: string;
};

/** The detail texts from the `offering-management` catalog (design.md D10). */
function detailTexts(catalog: MessageCatalog): InventoryDetailTexts {
  return {
    eyebrow: catalog.inventoryHeading,
    back: catalog.inventoryBack,
    createOffering: catalog.inventoryCreateOffering,
    loading: catalog.inventoryLoading,
    error: catalog.inventoryError,
    retry: catalog.retryLabel,
    signedOut: catalog.inventorySignedOut,
    signIn: catalog.signInLabel,
    notFoundTitle: catalog.inventoryNotFoundTitle,
    notFoundLine: catalog.inventoryNotFoundLine,
    process: catalog.inventoryProcess,
    variety: catalog.inventoryVariety,
    roastLevel: catalog.inventoryRoastLevel,
    altitude: catalog.inventoryAltitude,
    producer: catalog.inventoryProducer,
    certifications: catalog.inventoryCertifications,
    roastery: catalog.inventoryRoastery,
    roastLot: catalog.inventoryRoastLot,
    productionDate: catalog.inventoryProductionDate,
    coffeeLot: catalog.inventoryCoffeeLot,
    roasteryDescription: catalog.inventoryRoasteryDescription,
  };
}

/**
 * The coffee inventory detail (add-coffee-inventory-explorer design.md D7). A
 * thin server composition: it loads the catalog of the route's locale and
 * renders the client region on the page background.
 */
export function InventoryDetailScreen({ locale, ulid }: InventoryDetailScreenProps): ReactNode {
  const catalog = getMessages("offering-management", locale);
  return (
    <div className="flex-1">
      <PageSection surface="page">
        <InventoryDetailClient locale={locale} ulid={ulid} texts={detailTexts(catalog)} />
      </PageSection>
    </div>
  );
}
