import { request, type Contact, type ContactCreatePayload } from "@/shared/api";

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

type ContactListBody = { data?: Contact[] };
type ContactCreatedBody = { data?: Contact };

/** The contact read's outcome: failed, or the primary contact if any. */
export type PrimaryContactRead =
  | { ok: false }
  | { ok: true; primary: Contact | undefined };

/** The contact read with its status mapped to an outcome (design.md D3). */
export async function readPrimaryContact(ulid: string): Promise<PrimaryContactRead> {
  try {
    const response = await fetchContact(ulid);
    if (response.status !== 200) return { ok: false };
    const body = (await response.json()) as ContactListBody;
    return { ok: true, primary: body.data?.find((item) => item.isPrimary === true) };
  } catch {
    return { ok: false };
  }
}

/** The contact creation's outcome (design.md D3, D4). */
export type ContactWrite =
  | { kind: "created"; contact: Contact }
  | { kind: "exists" }
  | { kind: "stepUp" }
  | { kind: "error" };

/**
 * The contact creation with its status mapped to an outcome: a `201` the
 * created contact, a `409` exists, a `403` the step-up, anything else the
 * generic error.
 */
export async function submitContact(
  ulid: string,
  payload: ContactCreatePayload,
): Promise<ContactWrite> {
  let status: number | null = null;
  let created: Contact | undefined;
  try {
    const response = await createContact(ulid, payload);
    status = response.status;
    if (status === 201) {
      created = ((await response.json()) as ContactCreatedBody).data;
    }
  } catch {
    // A network failure, or a `201` body that cannot be read, shows the
    // generic error (design.md D4).
  }
  if (status === 201 && created !== undefined) return { kind: "created", contact: created };
  if (status === 409) return { kind: "exists" };
  return { kind: status === 403 ? "stepUp" : "error" };
}
