import type { AppliedOfferingTexts } from "./applied";

/** The `filters` keys the offering facets, toolbar and empty state read (design.md D10). */
const OFFERING_FILTER_TEXT_KEYS = [
  "title",
  "trigger",
  "triggerWithCount",
  "clearAll",
  "removeFilter",
  "seeMore",
  "seeLess",
  "any",
  "noOptionMatches",
  "searching",
  "searchFailed",
  "optionCount",
  "rangeFrom",
  "rangeTo",
  "optionsUnavailable",
  "coffeeName",
  "coffeeNamePlaceholder",
  "roastery",
  "originCountry",
  "originRegion",
  "process",
  "variety",
  "producer",
  "city",
  "cityHelp",
  "verification",
  "verified",
  "provisional",
  "averageScore",
  "scoreMin",
  "scoreMax",
  "scoreRange",
  "tasteNotes",
  "sortBy",
  "sortDefault",
  "sortScoreDesc",
  "sortScoreAsc",
  "sortMostEvaluated",
  "sortNewest",
  "sortOldest",
  "noMatches",
] as const;

export type OfferingFilterTexts = Record<(typeof OFFERING_FILTER_TEXT_KEYS)[number], string> &
  AppliedOfferingTexts;

/** The offering texts of a `filters` catalog; a missing key reads as empty. */
export function offeringFacetsTexts(catalog: Record<string, string | undefined>): OfferingFilterTexts {
  return Object.fromEntries(
    OFFERING_FILTER_TEXT_KEYS.map((key) => [key, catalog[key] ?? ""]),
  ) as OfferingFilterTexts;
}
