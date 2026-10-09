import { publicRequest, REFERENCE_READ_INIT } from "@/shared/api";
import type { ApiResult, TaxonomiesPayload } from "@/shared/api";
import { buildTaxonomyLookup } from "../model/lookup";

/**
 * The public taxonomy read (design.md D1, D7). The contract attaches no
 * security scheme, so it runs through `publicRequest` with no credential
 * header, and is served from the server cache refreshed every hour
 * (`REFERENCE_READ_INIT`). Any non-2xx status or transport failure is an
 * error result; the API's error body and status never reach the
 * presentation, which the host maps into its own error state.
 */

/** The olfactory taxonomy tree: `GET /taxonomies`. */
export async function fetchTaxonomies(
  init: RequestInit = REFERENCE_READ_INIT,
): Promise<ApiResult<TaxonomiesPayload>> {
  try {
    const response = await publicRequest("/taxonomies", init);
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: TaxonomiesPayload = await response.json();
    return { ok: true, data: payload };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/**
 * The taxonomy tree for the references a screen is about to resolve
 * (refresh-stale-taxonomies). When the cached read lacks any of them, the
 * cache is stale: one more read bypasses it (`cache: "no-store"`) and its
 * result is used. A render cannot rewrite the cached entry, so only this
 * read is fresh. A failed fresh read keeps the cached result; references
 * still missing are dropped by the callers as before.
 */
export async function fetchTaxonomiesCovering(
  refs: readonly string[],
): Promise<ApiResult<TaxonomiesPayload>> {
  const cached = await fetchTaxonomies();
  if (!cached.ok) return cached;
  const known = buildTaxonomyLookup(cached.data.data ?? [], "en");
  if (refs.every((ref) => known.has(ref))) return cached;
  const fresh = await fetchTaxonomies({ cache: "no-store" });
  return fresh.ok ? fresh : cached;
}
