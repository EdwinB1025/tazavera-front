import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import type { EvaluationListTexts } from "./EvaluationListPresentation";

/** Shared fixtures of the public list tests (tasks 2.5). */

/** The row card's texts, passed by the tests' row slot as the host page does. */
export const ROW_TEXTS = {
  openLabel: "Open",
  closedLabel: "Closed",
  createdOnLabel: "Created on",
  closedOnLabel: "Closed on",
  coffeeshopCaption: "Coffeeshop:",
  roasterCaption: "Roaster:",
  ratingExceptionalLabel: "Exceptional",
  ratingExcellentLabel: "Excellent",
  ratingGoodLabel: "Good",
  ratingCommercialLabel: "Commercial",
  offeringMissingLabel: "Offering no longer exists",
  viewLabel: "View",
  viewOfferingLabel: "View offering",
  offeringUnavailableLabel: "Offering unavailable",
};

export const TEXTS: EvaluationListTexts = {
  emptyMessage: "There are no evaluations yet.",
  noMatches: "No results match these filters.",
  clearAll: "Clear all",
  errorMessage: "The evaluations could not be loaded.",
  retryLabel: "Retry",
  resultCount: "Results: {count}",
  navigationLabel: "Pagination",
  previousLabel: "Previous",
  nextLabel: "Next",
  pageLabel: "Page {page}",
};

export function offering(ulid: string, name: string): OfferingDetail {
  return {
    ulid,
    location: { name: `Shop of ${name}` },
    coffeeInventory: { coffee: { name, roastLevel: "medium" }, roastery: { name: "Nomad" } },
  };
}

export function evaluation(ulid: string, offeringId: string | null): EvaluationItem {
  return {
    ulid,
    offeringId,
    status: "closed",
    cuppingScore: "84.25",
    createdAt: "2026-10-01T16:40:00.000000Z",
    closedAt: "2026-10-02T11:05:30.000000Z",
  };
}
