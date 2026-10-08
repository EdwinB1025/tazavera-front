import { publicRequest } from "@/shared/api";
import type { ApiResult, OfferingsPageMeta, OfferingSummary } from "@/shared/api";
import type { OfferingsQuery } from "../lib/query";

/**
 * The public offerings fetch of the block (design.md D4; the landing spec
 * "Verified offerings list" — "Error and retry"); the taxonomy read lives in
 * `@/entities/taxonomy`. The read is public — the contract attaches no
 * security scheme to it — so it runs on the server through `publicRequest`
 * with no credential header.
 * Any non-2xx status or transport failure is an error result; the API's
 * error body and status never reach the presentation, which maps every failure into its one
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
 * One page of offerings for a kept query: `GET /offerings?{query}`
 * (add-offering-catalog design.md D1, D2). Repeated keys stay repeated and no
 * filter of its own is added.
 */
export async function fetchOfferings(
  query: OfferingsQuery,
): Promise<ApiResult<OfferingsPayload>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) {
        params.append(key, item);
      }
    }
  }
  const search = params.toString();
  try {
    const response = await publicRequest(
      `/offerings${search ? `?${search}` : ""}`,
    );
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: OfferingsPayload = await response.json();
    return { ok: true, data: payload };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/** Offerings per landing page (refine-list-pagination design.md D8). */
export const LANDING_PAGE_SIZE = 6;
