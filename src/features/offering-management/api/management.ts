import { publicRequest, request } from "@/shared/api";
import type { OfferingsPageMeta, OfferingSummary } from "@/shared/api";

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
