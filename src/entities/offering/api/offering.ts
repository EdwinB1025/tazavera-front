import { publicRequest } from "@/shared/api";
import type { OfferingDetail } from "@/shared/api";

/**
 * The public offering read (design.md D1): `GET /offerings/{offering_ulid}`
 * through `publicRequest`, because the contract attaches no security scheme.
 * The caller tells an unknown offering (the 404 page) from a failure (the
 * failure message with a retry), so the outcome is a discriminated result
 * instead of a throw.
 */

/** What `fetchOffering` reports. */
export type OfferingResult =
  | { status: "found"; offering: OfferingDetail }
  | { status: "not-found" }
  | { status: "failed" };

/** One offering by its `ulid`: found, not-found (`404` or no `data`) or failed. */
export async function fetchOffering(ulid: string): Promise<OfferingResult> {
  try {
    const response = await publicRequest(`/offerings/${ulid}`);
    if (response.status === 404) {
      return { status: "not-found" };
    }
    if (!response.ok) {
      return { status: "failed" };
    }
    const payload: { data?: OfferingDetail } = await response.json();
    return payload.data ? { status: "found", offering: payload.data } : { status: "not-found" };
  } catch {
    return { status: "failed" };
  }
}
