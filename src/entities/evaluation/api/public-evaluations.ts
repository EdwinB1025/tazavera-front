import { publicRequest } from "@/shared/api";
import type { ApiResult, EvaluationItem, EvaluationSortField, EvaluationType } from "@/shared/api";
import type { EvaluationPage } from "./user-evaluations";

/**
 * The public evaluation reads (add-public-evaluations design.md D1, D2, D4):
 * `GET /evaluations` and `GET /evaluations/{evaluation_ulid}`.
 */

// ─── Request type (design.md D2, declared before the fetchers) ───

/** The `GET /evaluations` query the public list and the provisional panel send. */
export type EvaluationsQuery = {
  offeringId?: string;
  evaluationType: EvaluationType;
  status?: "closed";
  scoreMin?: number;
  scoreMax?: number;
  process?: string;
  city?: string;
  orderBy?: EvaluationSortField;
  orderDirection?: "asc" | "desc";
  page?: number;
};

/** The D1 key order of the `GET /evaluations` query. */
const QUERY_KEYS = [
  "offeringId",
  "evaluationType",
  "city",
  "process",
  "status",
  "scoreMin",
  "scoreMax",
  "orderBy",
  "orderDirection",
  "page",
] as const satisfies readonly (keyof EvaluationsQuery)[];

/**
 * One page of public evaluations: `GET /evaluations?{query}`, through
 * `publicRequest` with no credential (the contract attaches no security scheme). Any non-2xx
 * status or transport failure is an error result; the API body is never read then.
 */
export async function fetchEvaluations(
  query: EvaluationsQuery,
): Promise<ApiResult<EvaluationPage>> {
  const params = new URLSearchParams();
  for (const key of QUERY_KEYS) {
    const value = query[key];
    if (value !== undefined) params.set(key, String(value));
  }
  try {
    const response = await publicRequest(`/evaluations?${params}`);
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: EvaluationPage = await response.json();
    return { ok: true, data: payload };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/**
 * One public evaluation: the `data` of `GET /evaluations/{evaluation_ulid}`;
 * its `404` (unknown or not closed) is not-found (show-item-not-found-message
 * design.md D1).
 */
export async function fetchEvaluation(
  ulid: string,
): Promise<ApiResult<EvaluationItem, "not-found">> {
  try {
    const response = await publicRequest(`/evaluations/${ulid}`);
    if (response.status === 404) return { ok: false, kind: "not-found" };
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: { data: EvaluationItem } = await response.json();
    return { ok: true, data: payload.data };
  } catch {
    return { ok: false, kind: "error" };
  }
}
