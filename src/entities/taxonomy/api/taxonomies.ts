import { publicRequest, REFERENCE_READ_INIT } from "@/shared/api";
import type { ApiResult, TaxonomiesPayload } from "@/shared/api";

/**
 * The public taxonomy read (design.md D1, D7). The contract attaches no
 * security scheme, so it runs through `publicRequest` with no credential
 * header, and is served from the server cache refreshed every hour
 * (`REFERENCE_READ_INIT`). Any non-2xx status or transport failure is an
 * error result; the API's error body and status never reach the
 * presentation, which the host maps into its own error state.
 */

/** The olfactory taxonomy tree: `GET /taxonomies`. */
export async function fetchTaxonomies(): Promise<ApiResult<TaxonomiesPayload>> {
  try {
    const response = await publicRequest("/taxonomies", REFERENCE_READ_INIT);
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: TaxonomiesPayload = await response.json();
    return { ok: true, data: payload };
  } catch {
    return { ok: false, kind: "error" };
  }
}
