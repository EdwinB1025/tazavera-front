import type { OfferingsPageMeta, OfferingSummary } from "@/shared/api";

/**
 * The public offerings fetch of the block (design.md D4; the landing spec
 * "Verified offerings list" — "Error and retry"); the taxonomy read lives in
 * `@/entities/taxonomy`. The read is public — the contract attaches no
 * security scheme to it — so it runs on the server with plain `fetch` against
 * `NEXT_PUBLIC_API_URL` and no credential header.
 * Any non-2xx status or transport failure throws; the API's error body and
 * status never reach the presentation, which maps every failure into its one
 * error state (design.md D4).
 */

// ─── Typed payloads (design.md D9) ───

export type VerifiedOfferingsPayload = {
  data: OfferingSummary[];
  meta: OfferingsPageMeta;
};

/** One page of verified offerings: `GET /offerings?verified=1&page={page}`. */
export async function fetchVerifiedOfferings(
  page: number,
): Promise<VerifiedOfferingsPayload> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/offerings?verified=1&page=${page}`,
  );
  if (!response.ok) {
    throw new Error("offerings request failed");
  }
  const payload: VerifiedOfferingsPayload = await response.json();
  return payload;
}
