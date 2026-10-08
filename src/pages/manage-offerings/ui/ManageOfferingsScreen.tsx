import type { ReactNode } from "react";
import type { TaxonomyNode } from "@/shared/api";
import { fetchTaxonomies } from "@/entities/taxonomy";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import { ManageOfferingsPanel, type ManageOfferingsTexts } from "./ManageOfferingsPanel";

// ─── UI-specific types (declared before the component) ───

export type ManageOfferingsScreenProps = {
  locale: string;
  /** The requested page from the route's search params (`?page=n`). */
  page?: string | string[];
};

/**
 * "My offerings" (design.md D2, D11; spec "My offerings list"). A thin server
 * composition: it loads the `offering-management` and `landing` catalogs and
 * the taxonomies, and renders the page section around the client panel, which
 * loads the own list in the browser (design.md D1). A taxonomy failure reaches
 * the panel as `null` and puts the list in its error state.
 */
export async function ManageOfferingsScreen({
  locale,
  page,
}: ManageOfferingsScreenProps): Promise<ReactNode> {
  const catalog = getMessages("offering-management", locale);
  const landing = getMessages("landing", locale);
  // No `page` in the route's search params requests the first page.
  const requested = Number(page);
  const currentPage = Number.isInteger(requested) && requested > 0 ? requested : 1;

  let taxonomies: TaxonomyNode[] | null;
  try {
    taxonomies = (await fetchTaxonomies()).data;
  } catch {
    taxonomies = null;
  }

  const texts: ManageOfferingsTexts = {
    coffeeshopCaption: landing.cardCoffeeshopCaption,
    roasterCaption: landing.cardRoasterCaption,
    evaluationsLabel: landing.cardEvaluationsLabel,
    defectiveLabel: landing.cardDefectiveLabel,
    viewLabel: landing.cardViewLabel,
    verifiedLabel: landing.cardVerifiedLabel,
    provisionalLabel: landing.cardProvisionalLabel,
    ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
    ratingExcellentLabel: landing.cardRatingExcellentLabel,
    ratingGoodLabel: landing.cardRatingGoodLabel,
    ratingCommercialLabel: landing.cardRatingCommercialLabel,
    previousLabel: landing.paginationPreviousLabel,
    nextLabel: landing.paginationNextLabel,
    navigationLabel: landing.paginationNavigationLabel,
    pageLabel: landing.paginationPageLabel,
    eyebrow: catalog.eyebrow,
    listHeading: catalog.listHeading,
    newOfferingLink: catalog.newOfferingLink,
    listEmptyMessage: catalog.listEmptyMessage,
    listEmptyCreateLink: catalog.listEmptyCreateLink,
    listErrorMessage: catalog.listErrorMessage,
    retryLabel: catalog.retryLabel,
    signedOutMessage: catalog.signedOutMessage,
    signInLabel: catalog.signInLabel,
    selectAllLabel: catalog.selectAllLabel,
    selectedCount: catalog.selectedCount,
    selectLabel: catalog.selectLabel,
    deleteLabel: catalog.deleteLabel,
    deleteSelectedLabel: catalog.deleteSelectedLabel,
    deleteOneTitle: catalog.deleteOneTitle,
    deleteOneDescription: catalog.deleteOneDescription,
    deleteManyTitle: catalog.deleteManyTitle,
    deleteManyDescription: catalog.deleteManyDescription,
    deleteConfirmLabel: catalog.deleteConfirmLabel,
    cancelLabel: catalog.cancelLabel,
    deleteError: catalog.deleteError,
    deletedStatus: catalog.deletedStatus,
    stepUpMessage: catalog.stepUpMessage,
    stepUpLabel: catalog.stepUpLabel,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <ManageOfferingsPanel
          locale={locale}
          page={currentPage}
          taxonomies={taxonomies}
          texts={texts}
        />
      </PageSection>
    </div>
  );
}
