import type { FilterChanges, QueryRecord } from "@/shared/lib/filter-query";
import type { EvaluationsQuery } from "@/entities/evaluation";

/**
 * Evaluation filter state in the URL (design.md D4, D6). The query is the
 * only state; a value outside the contract's `listMyEvaluations` limits is
 * dropped before the list request and its facet shows its empty state.
 */

// ─── UI-specific types (design.md D11) ───

export type EvaluationSortId = "default" | "score-desc" | "score-asc" | "newest" | "oldest";

export type EvaluationSortOption = {
  id: EvaluationSortId;
  /** Key of the `filters` texts. */
  textKey: "sortDefault" | "sortScoreDesc" | "sortScoreAsc" | "sortNewest" | "sortOldest";
  orderBy: string | undefined;
  orderDirection: "asc" | "desc" | undefined;
};

export type EvaluationFilterValues = {
  /** The public set only (add-public-evaluations design.md D7). */
  offeringId?: string;
  status?: "open" | "closed";
  scoreMin?: number;
  scoreMax?: number;
  process?: string;
  city?: string;
  sort: EvaluationSortId;
};

/** Which facet set a panel shows: "My evaluations" or the public list (add-public-evaluations D7). */
export type EvaluationFacetSet = "mine" | "public";

/** The public list's facet state (add-public-evaluations design.md D2, D7). */
export type PublicEvaluationFilters = {
  offeringId: string | null;
  scoreMin: number | null;
  scoreMax: number | null;
  process: string | null;
  city: string | null;
};

// ─── Contract limits (`listMyEvaluations`) ───

const TEXT_LIMIT = 90;

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

/** The sort options in display order (design.md D6). */
export const EVALUATION_SORT_OPTIONS: readonly EvaluationSortOption[] = [
  { id: "default", textKey: "sortDefault", orderBy: undefined, orderDirection: undefined },
  { id: "score-desc", textKey: "sortScoreDesc", orderBy: "cupping_score", orderDirection: "desc" },
  { id: "score-asc", textKey: "sortScoreAsc", orderBy: "cupping_score", orderDirection: "asc" },
  { id: "newest", textKey: "sortNewest", orderBy: "created_at", orderDirection: "desc" },
  { id: "oldest", textKey: "sortOldest", orderBy: "created_at", orderDirection: "asc" },
];

/** The list's settled default order, sent for the `default` sort (design.md D4). */
const DEFAULT_ORDER = { orderBy: "created_at", orderDirection: "desc" } as const;

function firstValue(params: URLSearchParams | QueryRecord, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseText(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  return value && value.length <= TEXT_LIMIT ? value : undefined;
}

function parseNumber(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function inScoreRange(value: number | undefined): number | undefined {
  return value !== undefined && value >= SCORE_MIN && value <= SCORE_MAX ? value : undefined;
}

/** The facet values and sort of a query (design.md D4). */
export function parseEvaluationFilters(
  params: URLSearchParams | QueryRecord,
  set: EvaluationFacetSet = "mine",
): EvaluationFilterValues {
  const status = firstValue(params, "status");
  let scoreMin = parseNumber(firstValue(params, "scoreMin"));
  let scoreMax = parseNumber(firstValue(params, "scoreMax"));
  if (scoreMin !== undefined && scoreMax !== undefined && scoreMin > scoreMax) {
    scoreMin = undefined;
    scoreMax = undefined;
  }
  scoreMin = inScoreRange(scoreMin);
  scoreMax = inScoreRange(scoreMax);
  const orderBy = firstValue(params, "orderBy");
  const orderDirection = firstValue(params, "orderDirection");
  const sort =
    EVALUATION_SORT_OPTIONS.find(
      (option) =>
        option.orderBy !== undefined &&
        option.orderBy === orderBy &&
        option.orderDirection === orderDirection,
    )?.id ?? "default";

  const values: EvaluationFilterValues = { sort };
  if (set === "public") {
    // The public list has no Status facet; `offeringId` is never validated
    // here (add-public-evaluations design.md D4, D7).
    const offeringId = firstValue(params, "offeringId")?.trim();
    if (offeringId) values.offeringId = offeringId;
  } else if (status === "open" || status === "closed") {
    values.status = status;
  }
  if (scoreMin !== undefined) values.scoreMin = scoreMin;
  if (scoreMax !== undefined) values.scoreMax = scoreMax;
  const process = parseText(firstValue(params, "process"));
  if (process !== undefined) values.process = process;
  const city = parseText(firstValue(params, "city"));
  if (city !== undefined) values.city = city;
  return values;
}

/**
 * The `listMyEvaluations` request query, in contract key order, from the
 * parsed values only; the `default` sort sends the default order and the
 * full score range sends neither bound (design.md D4).
 */
export function evaluationListQuery(values: EvaluationFilterValues, page: number): string {
  const query = new URLSearchParams();
  if (values.city !== undefined) query.set("city", values.city);
  if (values.process !== undefined) query.set("process", values.process);
  if (values.status !== undefined) query.set("status", values.status);
  const bounds = scoreRangeChanges([values.scoreMin ?? SCORE_MIN, values.scoreMax ?? SCORE_MAX]);
  if (bounds.scoreMin !== undefined) query.set("scoreMin", String(bounds.scoreMin));
  if (bounds.scoreMax !== undefined) query.set("scoreMax", String(bounds.scoreMax));
  const sort = EVALUATION_SORT_OPTIONS.find((option) => option.id === values.sort);
  query.set("orderBy", sort?.orderBy ?? DEFAULT_ORDER.orderBy);
  query.set("orderDirection", sort?.orderDirection ?? DEFAULT_ORDER.orderDirection);
  query.set("page", String(page));
  return query.toString();
}

/**
 * The public `GET /evaluations` request from the parsed values: always
 * `evaluationType=specialist` and `status=closed`, whatever the URL held,
 * the `default` sort as `created_at desc` and the full score range as no
 * bound (add-public-evaluations design.md D4).
 */
export function publicEvaluationsQuery(
  values: EvaluationFilterValues,
  page: number,
): EvaluationsQuery {
  const bounds = scoreRangeChanges([values.scoreMin ?? SCORE_MIN, values.scoreMax ?? SCORE_MAX]);
  const sort = EVALUATION_SORT_OPTIONS.find((option) => option.id === values.sort);
  const query: EvaluationsQuery = { evaluationType: "specialist", status: "closed" };
  if (values.offeringId !== undefined) query.offeringId = values.offeringId;
  if (values.city !== undefined) query.city = values.city;
  if (values.process !== undefined) query.process = values.process;
  if (bounds.scoreMin !== undefined) query.scoreMin = Number(bounds.scoreMin);
  if (bounds.scoreMax !== undefined) query.scoreMax = Number(bounds.scoreMax);
  query.orderBy = (sort?.orderBy ?? DEFAULT_ORDER.orderBy) as EvaluationsQuery["orderBy"];
  query.orderDirection = sort?.orderDirection ?? DEFAULT_ORDER.orderDirection;
  query.page = page;
  return query;
}

/** The score bounds to write: each only when it differs from its end. */
export function scoreRangeChanges([min, max]: readonly [number, number]): FilterChanges {
  return {
    scoreMin: min > SCORE_MIN ? String(min) : undefined,
    scoreMax: max < SCORE_MAX ? String(max) : undefined,
  };
}
