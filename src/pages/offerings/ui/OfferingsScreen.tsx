import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import { PageSection } from "@/shared/ui";
import {
  FilteredOfferingsResults,
  type FilteredOfferingsResultsTexts,
  type OfferingsQuery,
} from "@/widgets/offering-list";

// ─── UI-specific types (declared before the component) ───

export type OfferingsScreenProps = {
  locale: string;
  /** The route's raw search params; only the contract's names are kept. */
  searchParams: OfferingsQuery;
  /**
   * The body toolbar region between the heading block and the results, where
   * the filter and sort controls render. Nothing fills it in this change.
   */
  toolbar?: ReactNode;
};

// The heading block and the toolbar region, 2rem apart; an empty region
// renders nothing and so adds no gap (design summary §6.2).
const HEADER_CONTAINER_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");

// The eyebrow and the heading, 0.5rem apart.
const HEADING_BLOCK_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * Catalog screen (add-offering-catalog design.md D8–D10; specs "Offering
 * catalog page", "Catalog heading and toolbar slot"; extract-filtered-offerings
 * design.md D5). A thin composition: it loads the `catalog`, `landing` and
 * `filters` texts of the route's locale and renders the heading block, the
 * toolbar region and the filtered offerings results, on the page background.
 */
export function OfferingsScreen({
  locale,
  searchParams,
  toolbar,
}: OfferingsScreenProps): ReactNode {
  const catalog = getMessages("catalog", locale);
  const landing = getMessages("landing", locale);
  const filters = getMessages("filters", locale);

  const resultsTexts: FilteredOfferingsResultsTexts = {
    coffeeshopCaption: landing.cardCoffeeshopCaption,
    roasterCaption: landing.cardRoasterCaption,
    evaluationsLabel: landing.cardEvaluationsLabel,
    defectiveLabel: landing.cardDefectiveLabel,
    viewLabel: landing.cardViewLabel,
    evaluateLabel: landing.cardEvaluateLabel,
    verifiedLabel: landing.cardVerifiedLabel,
    provisionalLabel: landing.cardProvisionalLabel,
    ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
    ratingExcellentLabel: landing.cardRatingExcellentLabel,
    ratingGoodLabel: landing.cardRatingGoodLabel,
    ratingCommercialLabel: landing.cardRatingCommercialLabel,
    previousLabel: landing.paginationPreviousLabel,
    nextLabel: landing.paginationNextLabel,
    emptyMessage: catalog.listEmptyMessage,
    resultCount: catalog.resultCount,
    errorMessage: catalog.listErrorMessage,
    retryLabel: landing.listRetryLabel,
    noMatches: filters.noMatches,
    clearAll: filters.clearAll,
  };

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName={HEADER_CONTAINER_CLASSES}>
        <div className={HEADING_BLOCK_CLASSES}>
          <p className="type-eyebrow">{catalog.listEyebrow}</p>
          <h1 className="type-heading">{catalog.listHeading}</h1>
        </div>
        {toolbar ? <div>{toolbar}</div> : null}
      </PageSection>
      <PageSection surface="page">
        <FilteredOfferingsResults
          locale={locale}
          searchParams={searchParams}
          path={`/${locale}/offerings`}
          texts={resultsTexts}
        />
      </PageSection>
    </div>
  );
}
