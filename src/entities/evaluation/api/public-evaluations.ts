import type { EvaluationSortField, EvaluationType } from "@/shared/api";

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
