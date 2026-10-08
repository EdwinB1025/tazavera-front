import { publicRequest } from "@/shared/api";
import type { ApiResult, OfferingDetail } from "@/shared/api";

/**
 * The public offering read (add-offering-catalog design.md D3):
 * `GET /offerings/{offering_ulid}` through `publicRequest`, because the
 * contract attaches no security scheme. The outcome is the shared result
 * instead of a throw, so every caller maps it into its own states; the one
 * contract shared with add-specialist-evaluations.
 */

/** What `fetchOffering` reports (unify-api-result-shape design.md D2). */
export type OfferingResult = ApiResult<OfferingDetail, "not-found">;

/** One offering by its `ulid`: found, not-found (`404` or no `data`) or failed. */
export async function fetchOffering(ulid: string): Promise<OfferingResult> {
  try {
    const response = await publicRequest(`/offerings/${ulid}`);
    if (response.status === 404) {
      return { ok: false, kind: "not-found" };
    }
    if (!response.ok) {
      return { ok: false, kind: "error" };
    }
    const payload: { data?: OfferingDetail } = await response.json();
    return payload.data
      ? { ok: true, data: payload.data }
      : { ok: false, kind: "not-found" };
  } catch {
    return { ok: false, kind: "error" };
  }
}
