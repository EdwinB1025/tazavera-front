import type { EvaluationItem, EvaluationSortField, EvaluationType } from "@/shared/api";
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
 * One page of public evaluations: `GET /evaluations?{query}`, plain `fetch`
 * with no credential (the contract attaches no security scheme). Any non-2xx
 * status or transport failure throws; the API body is never read then.
 */
export async function fetchEvaluations(query: EvaluationsQuery): Promise<EvaluationPage> {
  const params = new URLSearchParams();
  for (const key of QUERY_KEYS) {
    const value = query[key];
    if (value !== undefined) params.set(key, String(value));
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations?${params}`);
  if (!response.ok) {
    throw new Error("evaluations request failed");
  }
  const payload: EvaluationPage = await response.json();
  return payload;
}

/** One public evaluation: the `data` of `GET /evaluations/{evaluation_ulid}`. */
export async function fetchEvaluation(ulid: string): Promise<EvaluationItem> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations/${ulid}`);
  if (!response.ok) {
    throw new Error("evaluation request failed");
  }
  const payload: { data: EvaluationItem } = await response.json();
  return payload.data;
}
