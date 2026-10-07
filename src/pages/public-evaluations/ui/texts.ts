import { getMessages } from "@/shared/lib/i18n";
import type { AppliedEvaluationTexts, EvaluationFacetsTexts, EvaluationsToolbarTexts } from "@/features/evaluation-facets";
import type { EvaluationListTexts } from "@/widgets/public-evaluation-list";

/**
 * The public list's texts, resolved from the catalogs of the route's locale
 * (design.md D3): `public-evaluations`, `evaluations`, `landing` and `filters`.
 */

export function listTexts(locale: string): EvaluationListTexts {
  const own = getMessages("public-evaluations", locale);
  const evaluations = getMessages("evaluations", locale);
  const landing = getMessages("landing", locale);
  const filters = getMessages("filters", locale);
  return {
    openLabel: evaluations.statusOpen,
    closedLabel: evaluations.statusClosed,
    createdOnLabel: evaluations.createdOnLabel,
    closedOnLabel: evaluations.closedOnLabel,
    coffeeshopCaption: landing.cardCoffeeshopCaption,
    roasterCaption: landing.cardRoasterCaption,
    ratingExceptionalLabel: landing.cardRatingExceptionalLabel,
    ratingExcellentLabel: landing.cardRatingExcellentLabel,
    ratingGoodLabel: landing.cardRatingGoodLabel,
    ratingCommercialLabel: landing.cardRatingCommercialLabel,
    offeringMissingLabel: evaluations.offeringMissingLabel,
    viewLabel: own.viewLabel,
    viewOfferingLabel: own.viewOfferingLabel,
    offeringUnavailableLabel: own.offeringUnavailable,
    emptyMessage: own.listEmptyMessage,
    noMatches: filters.noMatches,
    clearAll: filters.clearAll,
    errorMessage: own.listErrorMessage,
    retryLabel: landing.listRetryLabel,
    resultCount: evaluations.resultCount,
    previousLabel: landing.paginationPreviousLabel,
    nextLabel: landing.paginationNextLabel,
    navigationLabel: landing.paginationNavigationLabel,
    pageLabel: landing.paginationPageLabel,
  };
}

export function appliedTexts(locale: string): AppliedEvaluationTexts {
  const own = getMessages("public-evaluations", locale);
  const filters = getMessages("filters", locale);
  return {
    status: filters.status,
    statusOpen: filters.statusOpen,
    statusClosed: filters.statusClosed,
    score: filters.score,
    scoreRange: filters.scoreRange,
    process: filters.process,
    city: filters.city,
    offering: own.offeringFacet,
    offeringFilterFallback: own.offeringFilterFallback,
  };
}

export function toolbarTexts(locale: string): EvaluationsToolbarTexts {
  const filters = getMessages("filters", locale);
  return {
    trigger: filters.trigger,
    triggerWithCount: filters.triggerWithCount,
    sortBy: filters.sortBy,
    sortDefault: filters.sortDefault,
    sortScoreDesc: filters.sortScoreDesc,
    sortScoreAsc: filters.sortScoreAsc,
    sortNewest: filters.sortNewest,
    sortOldest: filters.sortOldest,
  };
}

export function facetsTexts(locale: string): EvaluationFacetsTexts {
  const filters = getMessages("filters", locale);
  return {
    ...appliedTexts(locale),
    title: filters.title,
    clearAll: filters.clearAll,
    removeFilter: filters.removeFilter,
    any: filters.any,
    seeMore: filters.seeMore,
    seeLess: filters.seeLess,
    scoreMin: filters.scoreMin,
    scoreMax: filters.scoreMax,
    rangeFrom: filters.rangeFrom,
    rangeTo: filters.rangeTo,
    cityHelp: filters.cityHelp,
    optionsUnavailable: filters.optionsUnavailable,
  };
}
