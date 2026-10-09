import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { BackLink, PageSection } from "@/shared/ui";
import { NewOfferingForm, type NewOfferingFormTexts } from "./NewOfferingForm";

// ─── UI-specific types (declared before the component) ───

export type NewOfferingScreenProps = {
  locale: string;
};

// ─── Layout (summary §6.3) ───
// Back link → header block: 1.5rem.
const COLUMN_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// Header block → form panel: 2rem.
const BODY_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// Eyebrow and h1 0.5rem apart.
const TITLE_GROUP_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * "New offering" (design.md D2, D11; spec "Creating offerings"). A thin
 * server composition: it loads the `offering-management` catalog and renders
 * the page section, the back link and the header around the client form. The
 * combobox's option-count announcement comes from the `filters` catalog,
 * which holds the shared combobox's texts.
 */
export function NewOfferingScreen({ locale }: NewOfferingScreenProps): ReactNode {
  const catalog = getMessages("offering-management", locale);
  const filters = getMessages("filters", locale);

  const texts: NewOfferingFormTexts = {
    signedOutMessage: catalog.signedOutMessage,
    signInLabel: catalog.signInLabel,
    inventoryLabel: catalog.inventoryLabel,
    inventoryHelp: catalog.inventoryHelp,
    inventorySearching: catalog.inventorySearching,
    inventoryNoMatches: catalog.inventoryNoMatches,
    inventorySearchError: catalog.inventorySearchError,
    inventoryLotCaption: catalog.inventoryLotCaption,
    inventoryProducedCaption: catalog.inventoryProducedCaption,
    inventoryRequired: catalog.inventoryRequired,
    optionCount: filters.optionCount,
    locationsLegend: catalog.locationsLegend,
    locationsLoading: catalog.locationsLoading,
    locationsEmpty: catalog.locationsEmpty,
    locationsError: catalog.locationsError,
    retryLabel: catalog.retryLabel,
    submitLabel: catalog.submitLabel,
    cancelLabel: catalog.cancelLabel,
    createError: catalog.createError,
    createdStatus: catalog.createdStatus,
    viewMyOfferings: catalog.viewMyOfferings,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <div className={COLUMN_CLASSES}>
          <BackLink fallback={`/${locale}/manage/offerings`}>{catalog.backLabel}</BackLink>
          <div className={BODY_CLASSES}>
            <div className={TITLE_GROUP_CLASSES}>
              <p className="type-eyebrow-strong">{catalog.eyebrow}</p>
              <h1 className="type-heading">{catalog.newHeading}</h1>
            </div>
            <NewOfferingForm locale={locale} texts={texts} />
          </div>
        </div>
      </PageSection>
    </div>
  );
}
