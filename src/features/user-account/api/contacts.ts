import { request, type ContactCreatePayload } from "@/shared/api";

/**
 * The session user's contact read (design.md D4): `GET
 * /users/{ulid}/contacts` through the token client. The caller reads the
 * status and the body.
 */
export function fetchContact(ulid: string): Promise<Response> {
  return request(`/users/${ulid}/contacts`, {
    headers: { Accept: "application/json" },
  });
}

/** The primary contact's creation (design.md D4): `POST /users/{ulid}/contacts`. */
export function createContact(
  ulid: string,
  payload: ContactCreatePayload,
): Promise<Response> {
  return request(`/users/${ulid}/contacts`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
