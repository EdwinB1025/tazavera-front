import {
  request,
  type ApiResult,
  type CreateLocationPayload,
  type UserLocation,
  type UserLocationsPayload,
} from "@/shared/api";

/**
 * The session user's locations read (design.md D3): `GET
 * /users/{ulid}/locations` through the token client.
 */
function fetchOwnLocations(userUlid: string): Promise<Response> {
  return request(`/users/${userUlid}/locations`, {
    headers: { Accept: "application/json" },
  });
}

/**
 * The read with its status mapped to the shared result (design.md D3;
 * unify-api-result-shape design.md D2, D4): a `200` carries the locations,
 * anything else or a transport failure is an error.
 */
export async function readOwnLocations(userUlid: string): Promise<ApiResult<UserLocation[]>> {
  try {
    const response = await fetchOwnLocations(userUlid);
    if (response.status !== 200) return { ok: false, kind: "error" };
    const body = (await response.json()) as UserLocationsPayload;
    return { ok: true, data: body.data ?? [] };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/**
 * A location's creation (design.md D4): `POST /locations`. A `201` is
 * created, a `403` the step-up, anything else or a transport failure an
 * error.
 */
export async function createLocation(
  payload: CreateLocationPayload,
): Promise<ApiResult<null, "forbidden">> {
  try {
    const response = await request("/locations", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (response.status === 201) return { ok: true, data: null };
    return { ok: false, kind: response.status === 403 ? "forbidden" : "error" };
  } catch {
    return { ok: false, kind: "error" };
  }
}
