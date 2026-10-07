import { publicRequest, request } from "@/shared/api";
import type {
  CoffeeInventoryItem,
  CoffeeInventoryPayload,
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
 * status, a 422 and a transport failure all map to one error result.
 */

// ─── Results (declared before the functions) ───

export type OwnOfferingsResult =
  | { state: "success"; data: OfferingSummary[]; meta: OfferingsPageMeta }
  | { state: "empty" }
  | { state: "error" };

/** How a write ended: done, refused (403, the step-up) or failed otherwise. */
export type WriteOutcome = "ok" | "forbidden" | "failed";

/** How the create call ended: with the created count, refused (403) or failed. */
export type CreateOutcome =
  | { outcome: "ok"; count: number }
  | { outcome: "forbidden" }
  | { outcome: "failed" };

export type LocationsResult = { state: "success"; data: LocationItem[] } | { state: "error" };

type OwnOfferingsPayload = {
  data?: OfferingSummary[];
  meta?: OfferingsPageMeta;
};

/** One page of the coffeeshop's offerings: `GET /offerings?coffeeshopUlid={ulid}&page={n}`. */
export async function fetchOwnOfferings(
  coffeeshopUlid: string,
  page: number,
): Promise<OwnOfferingsResult> {
  try {
    const response = await publicRequest(
      `/offerings?coffeeshopUlid=${encodeURIComponent(coffeeshopUlid)}&page=${page}`,
    );
    if (!response.ok) {
      return { state: "error" };
    }
    const payload: OwnOfferingsPayload = await response.json();
    const data = payload.data ?? [];
    return data.length === 0
      ? { state: "empty" }
      : { state: "success", data, meta: payload.meta ?? {} };
  } catch {
    return { state: "error" };
  }
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** A write through the token client, mapped to its outcome. */
async function write(path: string, init: RequestInit): Promise<WriteOutcome> {
  try {
    const response = await request(path, init);
    if (response.ok) return "ok";
    return response.status === 403 ? "forbidden" : "failed";
  } catch {
    return "failed";
  }
}

/** `DELETE /offerings/{offering_ulid}`. */
export function deleteOffering(ulid: string): Promise<WriteOutcome> {
  return write(`/offerings/${encodeURIComponent(ulid)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
}

/** `DELETE /offerings` with body `{ offerings: [...] }`. */
export function deleteOfferings(ulids: string[]): Promise<WriteOutcome> {
  return write("/offerings", {
    method: "DELETE",
    headers: JSON_HEADERS,
    body: JSON.stringify({ offerings: ulids }),
  });
}

/**
 * The inventory items matching a coffee name: `GET /coffeeInventory?coffeeName={text}`.
 * A non-2xx status rejects, so the combobox shows its failure row.
 */
export async function searchCoffeeInventory(
  coffeeName: string,
  signal: AbortSignal,
): Promise<CoffeeInventoryItem[]> {
  const response = await request(
    `/coffeeInventory?coffeeName=${encodeURIComponent(coffeeName)}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok) {
    throw new Error(`coffeeInventory ${response.status}`);
  }
  const payload: CoffeeInventoryPayload = await response.json();
  return payload.data ?? [];
}

/** `POST /offerings` with body `{ coffeeInventoryId, locations }`. */
export async function createOfferings(
  coffeeInventoryId: string,
  locations: string[],
): Promise<CreateOutcome> {
  try {
    const response = await request("/offerings", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ coffeeInventoryId, locations }),
    });
    if (response.status === 403) return { outcome: "forbidden" };
    if (!response.ok) return { outcome: "failed" };
    const payload: CreateOfferingsPayload = await response.json();
    return { outcome: "ok", count: payload.data?.length ?? 0 };
  } catch {
    return { outcome: "failed" };
  }
}

/** The coffeeshop's locations: `GET /locations`. */
export async function fetchMyLocations(): Promise<LocationsResult> {
  try {
    const response = await request("/locations", { headers: { Accept: "application/json" } });
    if (!response.ok) return { state: "error" };
    const payload: LocationsPayload = await response.json();
    return { state: "success", data: payload.data ?? [] };
  } catch {
    return { state: "error" };
  }
}
