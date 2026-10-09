import type { ReactNode } from "react";
import { getMessages, type MessageCatalog } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { EvaluationsGate } from "@/widgets/evaluations-gate";
import {
  EVALUATION_SORT_KEYS,
  EvaluationsToolbar,
  appliedEvaluationFilters,
  parseEvaluationFilters,
} from "@/features/evaluation-facets";
import { ClearFiltersButton, PageSection } from "@/shared/ui";
import { EvaluationsList } from "./EvaluationsList";
import type { EvaluationsListTexts } from "./EvaluationsList";

// ─── UI-specific types (declared before the component) ───

export type EvaluationsListScreenProps = {
  locale: string;
  /** The route's search params: the facet values, sort and page. */
  searchParams: QueryRecord;
};

// The toolbar 2rem above the list (add-evaluation-facets design.md D8).
const BODY_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");

/** The page of the route's `page` query; the first page when absent or invalid. */
function pageFrom(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** The list texts from the catalogs of the route's locale (design.md D14). */
function listTexts(
  catalog: MessageCatalog,
  landing: MessageCatalog,
  filters: MessageCatalog,
  publicEvaluations: MessageCatalog,
): EvaluationsListTexts {
  return {
    heading: catalog.listHeading,
    openLabel: catalog.statusOpen,
    closedLabel: catalog.statusClosed,
    createdOnLabel: catalog.createdOnLabel,
    closedOnLabel: catalog.closedOnLabel,
    coffeeshopCaption: catalog.coffeeshopCaption,
    roasterCaption: catalog.roasterCaption,
    editLabel: catalog.editLabel,
    viewLabel: catalog.viewLabel,
    viewOfferingLabel: publicEvaluations.viewOfferingLabel,
    closeLabel: catalog.closeLabel,
    closedMessage: catalog.closedMessage,
    incompleteMessage: catalog.incompleteMessage,
    ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
    ratingExcellentLabel: landing.cardRatingExcellentLabel,
    ratingGoodLabel: landing.cardRatingGoodLabel,
    ratingCommercialLabel: landing.cardRatingCommercialLabel,
    previousLabel: catalog.previousLabel,
    nextLabel: catalog.nextLabel,
    navigationLabel: catalog.paginationNavigationLabel,
    pageLabel: catalog.paginationPageLabel,
    emptyMessage: catalog.listEmptyMessage,
    loadErrorMessage: catalog.listLoadErrorMessage,
    retryLabel: catalog.retryLabel,
    deleteLabel: catalog.deleteLabel,
    deleteTitle: catalog.deleteTitle,
    deleteDescription: catalog.deleteDescription,
    deleteConfirmLabel: catalog.deleteConfirmLabel,
    deleteCancelLabel: catalog.deleteCancelLabel,
    notYoursMessage: catalog.notYoursMessage,
    failureMessage: catalog.failureMessage,
    offeringMissingLabel: catalog.offeringMissingLabel,
    noMatches: filters.noMatches,
  };
}

/**
 * "My evaluations" screen (design.md D1, D13, D14). Thin: it resolves the
 * `evaluations` catalog for the route's locale — and the rating tier words the
 * offering card already shows, from `landing` — and renders the client list
 * inside the access gate. Every evaluation read runs on the client.
 */
export function EvaluationsListScreen({
  locale,
  searchParams,
}: EvaluationsListScreenProps): ReactNode {
  const catalog = getMessages("evaluations", locale);
  const landing = getMessages("landing", locale);
  const filters = getMessages("filters", locale);
  const publicEvaluations = getMessages("public-evaluations", locale);
  // The facet values and the applied list (add-evaluation-facets D4, D5, D9).
  const values = parseEvaluationFilters(searchParams);
  const applied = appliedEvaluationFilters(values, {
    status: filters.status,
    statusOpen: filters.statusOpen,
    statusClosed: filters.statusClosed,
    score: filters.score,
    scoreRange: filters.scoreRange,
    process: filters.process,
    city: filters.city,
  });

  const texts = listTexts(catalog, landing, filters, publicEvaluations);

  return (
    <div className="flex-1">
      <PageSection surface="page">
        <EvaluationsGate
          texts={{ message: catalog.accessMessage, signInLabel: catalog.signInLabel }}
        >
          <div className={BODY_CLASSES}>
            <EvaluationsToolbar
              count={applied.length}
              sort={values.sort}
              texts={{
                trigger: filters.trigger,
                triggerWithCount: filters.triggerWithCount,
                sortBy: filters.sortBy,
                sortDefault: filters.sortDefault,
                sortScoreDesc: filters.sortScoreDesc,
                sortScoreAsc: filters.sortScoreAsc,
                sortNewest: filters.sortNewest,
                sortOldest: filters.sortOldest,
              }}
            />
            <EvaluationsList
              locale={locale}
              texts={texts}
              values={values}
              page={pageFrom(searchParams.page)}
              query={searchParams}
              resultCountText={catalog.resultCount}
              emptyAction={
                applied.length > 0 ? (
                  <ClearFiltersButton label={filters.clearAll} keep={EVALUATION_SORT_KEYS} />
                ) : undefined
              }
            />
          </div>
        </EvaluationsGate>
      </PageSection>
    </div>
  );
}
