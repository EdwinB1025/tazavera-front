import {
  publicRequest,
  type ApiResult,
  type CoffeeshopsPageMeta,
  type CoffeeshopSummary,
} from "@/shared/api";

// ─── Typed payloads (add-coffeeshop-directory design.md D2) ───

export type CoffeeshopsPayload = {
  data: CoffeeshopSummary[];
  meta: CoffeeshopsPageMeta;
};

/**
 * One page of the public directory: `GET /coffeeshops?{query}` (design.md D1,
 * D7), with no credential. Any non-2xx status or transport failure is an
 * error result; the list maps every failure into its one error state.
 */
export async function fetchCoffeeshops(
  query: Record<string, string>,
): Promise<ApiResult<CoffeeshopsPayload>> {
  const search = new URLSearchParams(query).toString();
  try {
    const response = await publicRequest(`/coffeeshops${search ? `?${search}` : ""}`);
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: CoffeeshopsPayload = await response.json();
    return { ok: true, data: payload };
  } catch {
    return { ok: false, kind: "error" };
  }
}
