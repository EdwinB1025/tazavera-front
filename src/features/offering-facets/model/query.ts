import type { FilterChanges, QueryRecord } from "@/shared/lib/filter-query";

/**
 * Offering filter state in the URL (design.md D4, D6). The query is the only
 * state; a value outside the contract's `listOfferings` limits is dropped
 * before the list request and its facet shows its empty state.
 */

// ─── UI-specific types (design.md D11) ───

export type OfferingSortId =
  | "default"
  | "score-desc"
  | "score-asc"
  | "most-evaluated"
  | "newest"
  | "oldest";

export type OfferingSortOption = {
  id: OfferingSortId;
  /** Key of the `filters` texts. */
  textKey:
    | "sortDefault"
    | "sortScoreDesc"
    | "sortScoreAsc"
    | "sortMostEvaluated"
    | "sortNewest"
    | "sortOldest";
  orderBy: string | undefined;
  orderDirection: "asc" | "desc" | undefined;
};

export type OfferingFilterValues = {
  coffeeName: string | undefined;
  verified: "1" | "0" | undefined;
  cuppingAvgMin: number | undefined;
  cuppingAvgMax: number | undefined;
  cataRef: string[];
  originCountry: string | undefined;
  originRegion: string | undefined;
  process: string | undefined;
  variety: string | undefined;
  producer: string | undefined;
  roasteryName: string | undefined;
  city: string | undefined;
  sort: OfferingSortId;
};

type TextKey =
  | "coffeeName"
  | "roasteryName"
  | "producer"
  | "originCountry"
  | "originRegion"
  | "process"
  | "variety"
  | "city";

// ─── Contract limits (`listOfferings`) ───

const TEXT_LIMITS: Record<TextKey, number> = {
  coffeeName: 150,
  roasteryName: 150,
  producer: 150,
  originCountry: 90,
  originRegion: 90,
  process: 90,
  variety: 90,
  city: 90,
};

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

/** The sort options in display order (design.md D6). */
export const OFFERING_SORT_OPTIONS: readonly OfferingSortOption[] = [
  { id: "default", textKey: "sortDefault", orderBy: undefined, orderDirection: undefined },
  { id: "score-desc", textKey: "sortScoreDesc", orderBy: "cupping_avg", orderDirection: "desc" },
  { id: "score-asc", textKey: "sortScoreAsc", orderBy: "cupping_avg", orderDirection: "asc" },
  {
    id: "most-evaluated",
    textKey: "sortMostEvaluated",
    orderBy: "evaluation_count",
    orderDirection: "desc",
  },
  { id: "newest", textKey: "sortNewest", orderBy: "created_at", orderDirection: "desc" },
  { id: "oldest", textKey: "sortOldest", orderBy: "created_at", orderDirection: "asc" },
];

/** Every key this facet set reads or writes. */
const OFFERING_KEYS = [
  ...(Object.keys(TEXT_LIMITS) as TextKey[]),
  "verified",
  "cuppingAvgMin",
  "cuppingAvgMax",
  "cataRef",
  "orderBy",
  "orderDirection",
];

function allValues(params: URLSearchParams | QueryRecord, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const value = params[key];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function firstValue(params: URLSearchParams | QueryRecord, key: string): string | undefined {
  return allValues(params, key)[0];
}

function parseText(raw: string | undefined, limit: number): string | undefined {
  const value = raw?.trim();
  return value && value.length <= limit ? value : undefined;
}

function parseScore(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= SCORE_MIN && value <= SCORE_MAX ? value : undefined;
}

/** The facet values and sort of a query (design.md D4). */
export function parseOfferingFilters(params: URLSearchParams | QueryRecord): OfferingFilterValues {
  const text = (key: TextKey) => parseText(firstValue(params, key), TEXT_LIMITS[key]);
  const verified = firstValue(params, "verified");
  let cuppingAvgMin = parseScore(firstValue(params, "cuppingAvgMin"));
  let cuppingAvgMax = parseScore(firstValue(params, "cuppingAvgMax"));
  if (cuppingAvgMin !== undefined && cuppingAvgMax !== undefined && cuppingAvgMin > cuppingAvgMax) {
    cuppingAvgMin = undefined;
    cuppingAvgMax = undefined;
  }
  const orderBy = firstValue(params, "orderBy");
  const orderDirection = firstValue(params, "orderDirection");
  const sort =
    OFFERING_SORT_OPTIONS.find(
      (option) =>
        option.orderBy !== undefined &&
        option.orderBy === orderBy &&
        option.orderDirection === orderDirection,
    )?.id ?? "default";

  return {
    coffeeName: text("coffeeName"),
    verified: verified === "1" || verified === "0" ? verified : undefined,
    cuppingAvgMin,
    cuppingAvgMax,
    cataRef: allValues(params, "cataRef").filter((value) => value !== ""),
    originCountry: text("originCountry"),
    originRegion: text("originRegion"),
    process: text("process"),
    variety: text("variety"),
    producer: text("producer"),
    roasteryName: text("roasteryName"),
    city: text("city"),
    sort,
  };
}

/** The query keys that hold the given values; absent values have no key. */
function valuesToQuery(values: OfferingFilterValues): QueryRecord {
  const sort = OFFERING_SORT_OPTIONS.find((option) => option.id === values.sort);
  const query: QueryRecord = {};
  for (const key of Object.keys(TEXT_LIMITS) as TextKey[]) {
    if (values[key] !== undefined) query[key] = values[key];
  }
  if (values.verified !== undefined) query.verified = values.verified;
  if (values.cuppingAvgMin !== undefined) query.cuppingAvgMin = String(values.cuppingAvgMin);
  if (values.cuppingAvgMax !== undefined) query.cuppingAvgMax = String(values.cuppingAvgMax);
  if (values.cataRef.length > 0) query.cataRef = values.cataRef;
  if (sort?.orderBy !== undefined && sort.orderDirection !== undefined) {
    query.orderBy = sort.orderBy;
    query.orderDirection = sort.orderDirection;
  }
  return query;
}

/**
 * The query with the facet and sort keys replaced by their parsed values;
 * every other key is untouched (design.md D4).
 */
export function sanitizeOfferingQuery(query: QueryRecord): QueryRecord {
  const sanitized: QueryRecord = {};
  for (const [key, value] of Object.entries(query)) {
    if (!OFFERING_KEYS.includes(key)) sanitized[key] = value;
  }
  return { ...sanitized, ...valuesToQuery(parseOfferingFilters(query)) };
}

/** Whether any facet value is present; the sort never counts (design.md D4). */
export function hasOfferingFilters(values: OfferingFilterValues): boolean {
  return Object.entries(values).some(([key, value]) =>
    key === "sort" ? false : Array.isArray(value) ? value.length > 0 : value !== undefined,
  );
}

/** The score bounds to write: each only when it differs from its end. */
export function scoreRangeChanges([min, max]: readonly [number, number]): FilterChanges {
  return {
    cuppingAvgMin: min > SCORE_MIN ? String(min) : undefined,
    cuppingAvgMax: max < SCORE_MAX ? String(max) : undefined,
  };
}
