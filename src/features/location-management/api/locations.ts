import {
  request,
  type CreateLocationPayload,
  type UserLocationsPayload,
} from "@/shared/api";
import type { ListState } from "../model/types";

/**
 * The session user's locations read (design.md D3): `GET
 * /users/{ulid}/locations` through the token client. The caller reads the
 * status and the body.
 */
export function fetchOwnLocations(userUlid: string): Promise<Response> {
  return request(`/users/${userUlid}/locations`, {
    headers: { Accept: "application/json" },
  });
}

/** The list state a read's response leads to (design.md D3). */
export async function readOwnLocations(
  userUlid: string,
): Promise<Exclude<ListState, { status: "loading" }>> {
  try {
    const response = await fetchOwnLocations(userUlid);
    if (response.status !== 200) return { status: "error" };
    const body = (await response.json()) as UserLocationsPayload;
    return { status: "ready", locations: body.data ?? [] };
  } catch {
    return { status: "error" };
  }
}

/** A location's creation (design.md D4): `POST /locations`. */
export function createLocation(payload: CreateLocationPayload): Promise<Response> {
  return request("/locations", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
