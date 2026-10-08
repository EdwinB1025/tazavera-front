import { request, type ProfileUpdatePayload } from "@/shared/api";

/**
 * The outcome of an account write (design.md D2): `200` is a success, `403`
 * asks for the write-scope step-up, and any other status or a network
 * failure is the generic error.
 */
export type AccountWriteResult = "success" | "stepUp" | "error";

/** Sends one account write through the token client and maps its status. */
async function write(path: string, init: RequestInit): Promise<AccountWriteResult> {
  let status: number | null = null;
  try {
    const response = await request(path, init);
    status = response.status;
  } catch {
    // A network failure shows the generic error.
  }
  if (status === 200) return "success";
  return status === 403 ? "stepUp" : "error";
}

/** The profile update (design.md D1): `PUT /users/{ulid}`. */
export function updateProfile(
  ulid: string,
  payload: ProfileUpdatePayload,
): Promise<AccountWriteResult> {
  return write(`/users/${ulid}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
