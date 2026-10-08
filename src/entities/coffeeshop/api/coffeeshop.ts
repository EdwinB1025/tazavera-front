import { publicRequest, type CoffeeshopDetail } from "@/shared/api";

/** What `fetchCoffeeshop` reports (add-coffeeshop-directory design.md D2, D8). */
export type CoffeeshopResult =
  | { status: "found"; coffeeshop: CoffeeshopDetail }
  | { status: "not-found" }
  | { status: "failed" };

/**
 * One public coffee shop: `GET /coffeeshops/{user_ulid}` through
 * `publicRequest` (design.md D1, D8). `404` or a `200` without `data` is
 * not-found; any other non-2xx status or a transport failure is failed. It
 * never throws.
 */
export async function fetchCoffeeshop(ulid: string): Promise<CoffeeshopResult> {
  try {
    const response = await publicRequest(`/coffeeshops/${ulid}`);
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "failed" };
    const payload: { data?: CoffeeshopDetail } = await response.json();
    return payload.data ? { status: "found", coffeeshop: payload.data } : { status: "not-found" };
  } catch {
    return { status: "failed" };
  }
}
