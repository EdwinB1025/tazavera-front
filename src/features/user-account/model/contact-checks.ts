import type { ContactCreatePayload } from "@/shared/api";
import type { ContactFieldErrors, ContactFieldValues } from "@/entities/contact";
import { isValidEmail } from "./email";

// ─── UI-specific types (declared before the functions) ───

export type ContactCheckTexts = {
  requiredError: string;
  emailFormatError: string;
  urlFormatError: string;
};

/**
 * The contact form's client checks (spec "Contact details form"; design.md
 * D4), in field order: Address and City are required, a non-empty email is a
 * valid address, a non-empty web is an absolute URL. The lengths are the
 * inputs' `maxLength` (D1), not checked here.
 */
export function checkContact(
  values: ContactFieldValues,
  texts: ContactCheckTexts,
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  if (values.address.trim() === "") errors.address = texts.requiredError;
  if (values.city.trim() === "") errors.city = texts.requiredError;
  if (values.email !== "" && !isValidEmail(values.email)) {
    errors.email = texts.emailFormatError;
  }
  if (values.web !== "" && !URL.canParse(values.web)) {
    errors.web = texts.urlFormatError;
  }
  return errors;
}

/** An empty optional value is sent as `null` (design.md D4). */
function optional(value: string): string | null {
  return value.trim() === "" ? null : value;
}

/** The form values as the `POST /users/{ulid}/contacts` body (design.md D4). */
export function toContactPayload(values: ContactFieldValues): ContactCreatePayload {
  return {
    address: values.address,
    city: values.city,
    postal_code: optional(values.postalCode),
    country: optional(values.country),
    phone: optional(values.phone),
    email: optional(values.email),
    web: optional(values.web),
    social: optional(values.social),
  };
}
