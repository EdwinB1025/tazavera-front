import { publicRequest } from "@/shared/api";
import type { OfferingsPageMeta, OfferingSummary } from "@/shared/api";
import type { OfferingsQuery } from "../lib/query";

/**
 * The public offerings fetch of the block (design.md D4; the landing spec
 * "Verified offerings list" — "Error and retry"); the taxonomy read lives in
 * `@/entities/taxonomy`. The read is public — the contract attaches no
 * security scheme to it — so it runs on the server through `publicRequest`
 * with no credential header.
 * Any non-2xx status or transport failure throws; the API's error body and
 * status never reach the presentation, which maps every failure into its one
 * error state (design.md D4).
 */

// ─── Typed payloads (design.md D9) ───

export type VerifiedOfferingsPayload = {
  data: OfferingSummary[];
  meta: OfferingsPageMeta;
};

/** The payload of any offerings page; the same shape as landing's (add-offering-catalog design.md D2). */
export type OfferingsPayload = VerifiedOfferingsPayload;

/**
 * The array query parameters of `GET /offerings`: the API reads an array only
 * from `name[]` pairs (send-array-filters-with-brackets design.md D1).
 */
const ARRAY_PARAMS = new Set([
  "cataRef",
  "fragranceCata",
  "aromaCata",
  "flavorCata",
  "aftertasteCata",
  "mouthfeelCata",
]);

/**
 * One page of offerings for a kept query: `GET /offerings?{query}`
 * (add-offering-catalog design.md D1, D2). Repeated keys stay repeated, an
 * array parameter is sent as `name[]` once per value, and no filter of its
 * own is added.
 */
export async function fetchOfferings(
  query: OfferingsQuery,
): Promise<OfferingsPayload> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const name = ARRAY_PARAMS.has(key) ? `${key}[]` : key;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) {
        params.append(name, item);
      }
    }
  }
  const search = params.toString();
  const response = await publicRequest(
    `/offerings${search ? `?${search}` : ""}`,
  );
  if (!response.ok) {
    throw new Error("offerings request failed");
  }
  const payload: OfferingsPayload = await response.json();
  return payload;
}

/** Offerings per landing page (refine-list-pagination design.md D8). */
export const LANDING_PAGE_SIZE = 6;

/**
 * One page of verified offerings:
 * `GET /offerings?verified=1&page={page}&perPage=6` (refine-list-pagination
 * design.md D8).
 */
export async function fetchVerifiedOfferings(
  page: number,
): Promise<VerifiedOfferingsPayload> {
  return fetchOfferings({
    verified: "1",
    page: String(page),
    perPage: String(LANDING_PAGE_SIZE),
  });
}
