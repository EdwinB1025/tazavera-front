import type { TaxonomiesPayload } from "@/shared/api";

/**
 * The public taxonomy read (design.md D1, D7). The contract attaches no
 * security scheme, so it runs with plain `fetch` against `NEXT_PUBLIC_API_URL`
 * and no credential header. Any non-2xx status or transport failure throws;
 * the API's error body and status never reach the presentation, which the
 * host maps into its own error state.
 */

/** The olfactory taxonomy tree: `GET /taxonomies`. */
export async function fetchTaxonomies(): Promise<TaxonomiesPayload> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taxonomies`);
  if (!response.ok) {
    throw new Error("taxonomies request failed");
  }
  const payload: TaxonomiesPayload = await response.json();
  return payload;
}
