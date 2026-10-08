import { publicRequest, type CoffeeshopsPageMeta, type CoffeeshopSummary } from "@/shared/api";

// ─── Typed payloads (add-coffeeshop-directory design.md D2) ───

export type CoffeeshopsPayload = {
  data: CoffeeshopSummary[];
  meta: CoffeeshopsPageMeta;
};

/**
 * One page of the public directory: `GET /coffeeshops?{query}` (design.md D1,
 * D7), with no credential. Any non-2xx status or transport failure throws; the
 * list maps every failure into its one error state.
 */
export async function fetchCoffeeshops(query: Record<string, string>): Promise<CoffeeshopsPayload> {
  const search = new URLSearchParams(query).toString();
  const response = await publicRequest(`/coffeeshops${search ? `?${search}` : ""}`);
  if (!response.ok) {
    throw new Error("coffeeshops request failed");
  }
  const payload: CoffeeshopsPayload = await response.json();
  return payload;
}
