import { publicRequest, request } from "@/shared/api";
import { readFieldErrors } from "@/shared/lib/field-errors";
import type {
  ApiResult,
  CoffeeInventoryFilterKey,
  CoffeeInventoryItem,
  CoffeeInventoryPayload,
  CoffeeInventoryQuery,
  CreateOfferingsPayload,
  LocationItem,
  LocationsPayload,
  OfferingsPageMeta,
  OfferingSummary,
} from "@/shared/api";

/**
 * The management requests (design.md "API endpoints consumed"). The own list
 * is a public read whose filter is the session user's `ulid`, which lives only
 * in the browser, so it runs on the client through `publicRequest` with no
 * credential (design.md D1). Every API `message` is discarded: a non-2xx
 * status and a transport failure map to one error result; a 403 on a write
 * is one of them: offerings need no step-up (drop-step-up-for-offerings). A
 * 422 on the create carries its field messages (show-field-validation-errors
 * D4).
 */

// ─── Results (declared before the functions) ───

/** One page of the coffeeshop's offerings. */
export type OwnOfferingsPage = { data: OfferingSummary[]; meta: OfferingsPageMeta };

type OwnOfferingsPayload = {
  data?: OfferingSummary[];
  meta?: OfferingsPageMeta;
};

/** One page of the coffeeshop's offerings: `GET /offerings?coffeeshopUlid={ulid}&page={n}`. */
export async function fetchOwnOfferings(
  coffeeshopUlid: string,
  page: number,
): Promise<ApiResult<OwnOfferingsPage>> {
  try {
    const response = await publicRequest(
      `/offerings?coffeeshopUlid=${encodeURIComponent(coffeeshopUlid)}&page=${page}`,
    );
    if (!response.ok) {
      return { ok: false, kind: "error" };
    }
    const payload: OwnOfferingsPayload = await response.json();
    return { ok: true, data: { data: payload.data ?? [], meta: payload.meta ?? {} } };
  } catch {
    return { ok: false, kind: "error" };
  }
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** A write through the token client, mapped to its result. */
async function write(path: string, init: RequestInit): Promise<ApiResult<null>> {
  try {
    const response = await request(path, init);
    if (response.ok) return { ok: true, data: null };
    return { ok: false, kind: "error" };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/** `DELETE /offerings/{offering_ulid}`. */
export function deleteOffering(ulid: string): Promise<ApiResult<null>> {
  return write(`/offerings/${encodeURIComponent(ulid)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
}

/** `DELETE /offerings` with body `{ offerings: [...] }`. */
export function deleteOfferings(ulids: string[]): Promise<ApiResult<null>> {
  return write("/offerings", {
    method: "DELETE",
    headers: JSON_HEADERS,
    body: JSON.stringify({ offerings: ulids }),
  });
}

/** The filter keys of `GET /coffeeInventory`, in the contract's order. */
const INVENTORY_KEYS = [
  "coffeeName",
  "originCountry",
  "originRegion",
  "process",
  "producer",
  "city",
] as const satisfies readonly CoffeeInventoryFilterKey[];

/**
 * The inventory items matching `query`: `GET /coffeeInventory` with each
 * non-empty key (add-coffee-inventory-explorer design.md D1). Any non-2xx
 * status or a failure is an error result.
 */
export async function listCoffeeInventory(
  query: CoffeeInventoryQuery,
  signal?: AbortSignal,
): Promise<ApiResult<CoffeeInventoryItem[]>> {
  const params = INVENTORY_KEYS.filter((key) => query[key]).map(
    (key) => `${key}=${encodeURIComponent(query[key]!)}`,
  );
  const path = params.length > 0 ? `/coffeeInventory?${params.join("&")}` : "/coffeeInventory";
  try {
    const response = await request(path, { headers: { Accept: "application/json" }, signal });
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: CoffeeInventoryPayload = await response.json();
    return { ok: true, data: payload.data ?? [] };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/**
 * The inventory items matching a coffee name: `GET /coffeeInventory?coffeeName={text}`.
 * A failure is an error result; the combobox search rejects on it, so the
 * combobox shows its failure row (unify-api-result-shape design.md D3).
 */
export function searchCoffeeInventory(
  coffeeName: string,
  signal: AbortSignal,
): Promise<ApiResult<CoffeeInventoryItem[]>> {
  return listCoffeeInventory({ coffeeName }, signal);
}

/** `POST /offerings` with body `{ coffeeInventoryId, locations }`; the data is the created count. */
export async function createOfferings(
  coffeeInventoryId: string,
  locations: string[],
): Promise<ApiResult<number, "validation">> {
  try {
    const response = await request("/offerings", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ coffeeInventoryId, locations }),
    });
    if (response.status === 422) {
      return { ok: false, kind: "validation", errors: await readFieldErrors(response) };
    }
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: CreateOfferingsPayload = await response.json();
    return { ok: true, data: payload.data?.length ?? 0 };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/** The coffeeshop's locations: `GET /locations`. */
export async function fetchMyLocations(): Promise<ApiResult<LocationItem[]>> {
  try {
    const response = await request("/locations", { headers: { Accept: "application/json" } });
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: LocationsPayload = await response.json();
    return { ok: true, data: payload.data ?? [] };
  } catch {
    return { ok: false, kind: "error" };
  }
}
