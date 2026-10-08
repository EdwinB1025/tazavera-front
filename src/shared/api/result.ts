/**
 * The one result shape of the request functions (unify-api-result-shape
 * design.md D1). Type-only: each `api` module keeps its own status checks.
 */

/** The failures a consumer tells apart besides the generic error. */
export type ApiFailureKind = "not-found" | "forbidden" | "conflict";

/**
 * What every request function of an `api` segment resolves to; it never
 * rejects. `K` names the failures the function reports besides `"error"`.
 */
export type ApiResult<T, K extends ApiFailureKind = never> =
  | { ok: true; data: T }
  | { ok: false; kind: K | "error" };
