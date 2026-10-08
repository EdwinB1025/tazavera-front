import { publicRequest, type ApiResult, type CoffeeshopDetail } from "@/shared/api";

/**
 * What `fetchCoffeeshop` reports (add-coffeeshop-directory design.md D2, D8;
 * unify-api-result-shape design.md D2).
 */
export type CoffeeshopResult = ApiResult<CoffeeshopDetail, "not-found">;

/**
 * One public coffee shop: `GET /coffeeshops/{user_ulid}` through
 * `publicRequest` (design.md D1, D8). `404` or a `200` without `data` is
 * not-found; any other non-2xx status or a transport failure is an error. It
 * never throws.
 */
export async function fetchCoffeeshop(ulid: string): Promise<CoffeeshopResult> {
  try {
    const response = await publicRequest(`/coffeeshops/${ulid}`);
    if (response.status === 404) return { ok: false, kind: "not-found" };
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: { data?: CoffeeshopDetail } = await response.json();
    return payload.data ? { ok: true, data: payload.data } : { ok: false, kind: "not-found" };
  } catch {
    return { ok: false, kind: "error" };
  }
}
