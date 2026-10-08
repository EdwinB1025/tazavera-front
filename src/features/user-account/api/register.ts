import { publicRequest, type ApiResult, type RegisterPayload } from "@/shared/api";

/**
 * The outcome of a registration (design.md D3; unify-api-result-shape
 * design.md D2): `201` creates the account, any other status or a network
 * failure is the generic error.
 */
export type RegisterResult = ApiResult<null>;

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
    return response.status === 201 ? { ok: true, data: null } : { ok: false, kind: "error" };
  } catch {
    // A network failure shows the generic error.
    return { ok: false, kind: "error" };
  }
}
