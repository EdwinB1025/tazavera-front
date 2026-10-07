import { request } from "@/shared/api";

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
