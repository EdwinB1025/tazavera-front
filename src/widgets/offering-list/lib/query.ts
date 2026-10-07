/**
 * The catalog query pass-through (add-offering-catalog design.md D1; spec
 * "Catalog query pass-through"). One record feeds both the offerings request
 * and the pagination, so the address and the request never disagree. No
 * value is validated here: a value the API rejects ends in the error state.
 */

// ─── UI-specific types (declared before the function) ───

/** Next's `searchParams` shape. */
export type OfferingsQuery = Record<string, string | string[] | undefined>;

/** The query names `contracts/openapi.yaml` declares for `listOfferings`, plus `page`. */
const OFFERINGS_QUERY_NAMES = new Set([
  "coffeeName",
  "roasteryName",
  "originCountry",
  "originRegion",
  "process",
  "producer",
  "variety",
  "city",
  "coffeeshopUlid",
  "locationUlid",
  "verified",
  "cuppingAvgMin",
  "cuppingAvgMax",
  "evaluationCountMin",
  "evaluationCountMax",
  "defectiveCountMin",
  "defectiveCountMax",
  "fragranceMin",
  "fragranceMax",
  "aromaMin",
  "aromaMax",
  "flavorMin",
  "flavorMax",
  "aftertasteMin",
  "aftertasteMax",
  "acidityMin",
  "acidityMax",
  "sweetnessMin",
  "sweetnessMax",
  "mouthfeelMin",
  "mouthfeelMax",
  "overallMin",
  "overallMax",
  "cataRef",
  "fragranceCata",
  "aromaCata",
  "flavorCata",
  "aftertasteCata",
  "mouthfeelCata",
  "orderBy",
  "orderDirection",
  "page",
]);

/** Keeps only the contract's `listOfferings` names plus `page`, repeated values included. */
export function buildOfferingsQuery(
  searchParams: OfferingsQuery,
): OfferingsQuery {
  const query: OfferingsQuery = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (OFFERINGS_QUERY_NAMES.has(key) && value !== undefined) {
      query[key] = value;
    }
  }
  return query;
}
