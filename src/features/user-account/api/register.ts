import { publicRequest, type RegisterPayload } from "@/shared/api";

/**
 * The outcome of a registration (design.md D3): `201` creates the account,
 * any other status or a network failure is the generic error.
 */
export type RegisterResult = "created" | "error";

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
    return response.status === 201 ? "created" : "error";
  } catch {
    // A network failure shows the generic error.
    return "error";
  }
}
