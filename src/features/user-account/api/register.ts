import {
  publicRequest,
  type ApiResult,
  type RegisterPayload,
  type RegistrationToken,
} from "@/shared/api";

/**
 * The outcome of a registration (design.md D3; unify-api-result-shape
 * design.md D2): `201` creates the account and carries the body's `token`
 * block, or `null` without one (sign-in-after-registration design.md D2); any
 * other status or a network failure is the generic error.
 */
export type RegisterResult = ApiResult<RegistrationToken | null>;

/** The registration (design.md D1): `POST /register` through the public client. */
export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResult> {
  try {
    const response = await publicRequest("/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (response.status !== 201) return { ok: false, kind: "error" };
    return { ok: true, data: await tokenOf(response) };
  } catch {
    // A network failure shows the generic error.
    return { ok: false, kind: "error" };
  }
}

/**
 * The `token` block of a `201` body, or `null` when the body carries none or
 * is not JSON. Its four fields are checked where the block is kept
 * (sign-in-after-registration design.md D1 and D2).
 */
async function tokenOf(response: Response): Promise<RegistrationToken | null> {
  try {
    const body = (await response.json()) as { token?: unknown };
    return typeof body.token === "object" && body.token !== null
      ? (body.token as RegistrationToken)
      : null;
  } catch {
    return null;
  }
}
