import type { ReactNode } from "react";
import { getMessages, type MessageCatalog } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { InventoryListClient, type InventoryListTexts } from "./InventoryListClient";

// ─── UI-specific types (declared before the component) ───

export type ManageInventoryScreenProps = {
  locale: string;
};

/** The list texts from the `offering-management` catalog (design.md D10). */
function listTexts(catalog: MessageCatalog): InventoryListTexts {
  return {
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
export function ManageInventoryScreen({ locale }: ManageInventoryScreenProps): ReactNode {
  const catalog = getMessages("offering-management", locale);
  return (
    <div className="flex-1">
      <PageSection surface="page">
        <InventoryListClient locale={locale} texts={listTexts(catalog)} />
      </PageSection>
    </div>
  );
}
