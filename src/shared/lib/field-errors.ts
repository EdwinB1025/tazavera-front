/**
 * The `422` mapping (show-field-validation-errors design.md D2; form-fields
 * "Server validation errors"): Laravel's `{"message", "errors": {key:
 * [messages]}}` turned into one message per key, then into the messages of a
 * form's fields.
 */

/** A `422`'s messages: each API key → its first message. */
export type FieldErrors = Record<string, string>;

/** Each key of `body.errors` whose first message is a non-empty text. */
export function toFieldErrors(body: unknown): FieldErrors {
  const errors = (body as { errors?: unknown } | null)?.errors;
  if (typeof errors !== "object" || errors === null) return {};
  const messages: FieldErrors = {};
  for (const [key, value] of Object.entries(errors)) {
    const first: unknown = Array.isArray(value) ? value[0] : undefined;
    if (typeof first === "string" && first !== "") messages[key] = first;
  }
  return messages;
}

/** The messages of a `422` response; a body that cannot be read has none. */
export async function readFieldErrors(response: Response): Promise<FieldErrors> {
  try {
    return toFieldErrors(await response.json());
  } catch {
    return {};
  }
}

/**
 * The messages a form shows under its fields. A key maps to `aliases[key]`,
 * else to itself when it is one of `fields`. `unmatched` is `true` when a key
 * maps to no field or no field received a message: the form-level error shows.
 */
export function splitFieldErrors<F extends string>(
  errors: FieldErrors,
  fields: readonly F[],
  aliases: Readonly<Record<string, F>> = {},
): { fields: Partial<Record<F, string>>; unmatched: boolean } {
  const mapped: Partial<Record<F, string>> = {};
  let unmatched = false;
  for (const [key, message] of Object.entries(errors)) {
    const field = aliases[key] ?? fields.find((name) => name === key);
    if (field === undefined) unmatched = true;
    else mapped[field] ??= message;
  }
  return { fields: mapped, unmatched: unmatched || Object.keys(mapped).length === 0 };
}
