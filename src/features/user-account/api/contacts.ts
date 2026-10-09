import { request, type ApiResult, type Contact, type ContactCreatePayload } from "@/shared/api";
import { readFieldErrors, type FieldErrors } from "@/shared/lib/field-errors";

/**
 * The session user's contact read (design.md D4): `GET
 * /users/{ulid}/contacts` through the token client. `readPrimaryContact`
 * reads the status and the body.
 */
function fetchContact(ulid: string): Promise<Response> {
  return request(`/users/${ulid}/contacts`, {
    headers: { Accept: "application/json" },
  });
}

/** The primary contact's creation (design.md D4): `POST /users/{ulid}/contacts`. */
function createContact(
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
export type PrimaryContactRead = ApiResult<Contact | undefined>;

/** The contact read with its status mapped to an outcome (design.md D3). */
export async function readPrimaryContact(ulid: string): Promise<PrimaryContactRead> {
  try {
    const response = await fetchContact(ulid);
    if (response.status !== 200) return { ok: false, kind: "error" };
    const body = (await response.json()) as ContactListBody;
    return { ok: true, data: body.data?.find((item) => item.isPrimary === true) };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/** The contact creation's outcome (design.md D3, D4; unify-api-result-shape design.md D2). */
export type ContactWrite = ApiResult<Contact, "conflict" | "validation">;

/**
 * The contact creation with its status mapped to an outcome: a `201` the
 * created contact, a `409` a conflict (it exists), a `422` its field messages
 * (show-field-validation-errors D4), anything else (a `403` included) the
 * generic error.
 */
export async function submitContact(
  ulid: string,
  payload: ContactCreatePayload,
): Promise<ContactWrite> {
  let status: number | null = null;
  let created: Contact | undefined;
  let invalid: FieldErrors = {};
  try {
    const response = await createContact(ulid, payload);
    status = response.status;
    if (status === 201) {
      created = ((await response.json()) as ContactCreatedBody).data;
    }
    if (status === 422) invalid = await readFieldErrors(response);
  } catch {
    // A network failure, or a `201` body that cannot be read, shows the
    // generic error (design.md D4).
  }
  if (status === 201 && created !== undefined) return { ok: true, data: created };
  if (status === 409) return { ok: false, kind: "conflict" };
  if (status === 422) return { ok: false, kind: "validation", errors: invalid };
  return { ok: false, kind: "error" };
}
