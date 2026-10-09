/**
 * The one result shape of the request functions (unify-api-result-shape
 * design.md D1). Type-only: each `api` module keeps its own status checks.
 */
import type { FieldErrors } from "@/shared/lib/field-errors";

/** The failures a consumer tells apart besides the generic error. */
export type ApiFailureKind = "not-found" | "forbidden" | "conflict" | "validation";

/**
 * What every request function of an `api` segment resolves to; it never
 * rejects. `K` names the failures the function reports besides `"error"`; a
 * `"validation"` failure (a `422`) carries its messages
 * (show-field-validation-errors design.md D1).
 */
export type ApiResult<T, K extends ApiFailureKind = never> =
  | { ok: true; data: T }
  | { ok: false; kind: Exclude<K, "validation"> | "error" }
  | ("validation" extends K ? { ok: false; kind: "validation"; errors: FieldErrors } : never);
