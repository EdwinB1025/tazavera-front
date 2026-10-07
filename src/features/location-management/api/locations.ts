import { request, type CreateLocationPayload } from "@/shared/api";

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
