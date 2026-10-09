import { readFieldErrors } from "@/shared/lib/field-errors";
import {
  request,
  type ApiResult,
  type PasswordUpdatePayload,
  type ProfileUpdatePayload,
} from "@/shared/api";

/**
 * The outcome of an account write (design.md D2; unify-api-result-shape
 * design.md D2): `200` is a success, `403` (`forbidden`) asks for the
 * write-scope step-up, a `422` carries its field messages
 * (show-field-validation-errors D4), and any other status or a network
 * failure is the generic error.
 */
export type AccountWriteResult = ApiResult<null, "forbidden" | "validation">;

/** Sends one account write through the token client and maps its status. */
async function write(path: string, init: RequestInit): Promise<AccountWriteResult> {
  let status: number | null = null;
  try {
    const response = await request(path, init);
    status = response.status;
    if (status === 422) {
      return { ok: false, kind: "validation", errors: await readFieldErrors(response) };
    }
  } catch {
    // A network failure shows the generic error.
  }
  if (status === 200) return { ok: true, data: null };
  return { ok: false, kind: status === 403 ? "forbidden" : "error" };
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

/** The password change (design.md D1): `PUT /users/{ulid}/password`. */
export function updatePassword(
  ulid: string,
  payload: PasswordUpdatePayload,
): Promise<AccountWriteResult> {
  return write(`/users/${ulid}/password`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/** The account deactivation (design.md D1): `DELETE /users/{ulid}`. */
export function deactivateAccount(ulid: string): Promise<AccountWriteResult> {
  return write(`/users/${ulid}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
}

/** The account deletion (design.md D1): `DELETE /users/{ulid}/force`. */
export function deleteAccount(ulid: string): Promise<AccountWriteResult> {
  return write(`/users/${ulid}/force`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
}
