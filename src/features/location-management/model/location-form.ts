import type { CreateLocationPayload } from "@/shared/api";
import type { GeocodeQuery } from "@/shared/lib/geocoding";
import { isValidEmail, type ContactFieldValues } from "@/entities/contact";

// ─── UI-specific types (declared before the functions) ───

/** What the form holds while the user types: name, description and the eight contact fields. */
export type LocationFormValues = { name: string; description: string } & ContactFieldValues;

export type LocationFieldKey = keyof LocationFormValues;

/** Per-field error messages; a key without a message is valid. */
export type LocationFormErrors = Partial<Record<LocationFieldKey, string>>;

export type LocationCheckTexts = {
  requiredError: string;
  emailFormatError: string;
};

/** Coordinates as the geocoding entry point returns them. */
export type Coordinates = { lat: string; lon: string };

/** design.md D4: the form order, for focusing the first failing field. */
export const LOCATION_FIELD_ORDER: readonly LocationFieldKey[] = [
  "name",
  "description",
  "address",
  "postalCode",
  "city",
  "country",
  "phone",
  "email",
  "web",
  "social",
];

const REQUIRED: readonly LocationFieldKey[] = ["name", "address", "city"];

/**
 * design.md D7: `requiredError` for an empty (after trim) Name, Address or
 * City; `emailFormatError` for a non-empty Email that fails the contact
 * entity's check. Lengths and the web format are not checked here.
 */
export function validateLocationForm(
  values: LocationFormValues,
  texts: LocationCheckTexts,
): LocationFormErrors {
  const errors: LocationFormErrors = {};
  for (const key of REQUIRED) {
    if (values[key].trim() === "") errors[key] = texts.requiredError;
  }
  if (values.email !== "" && !isValidEmail(values.email)) {
    errors.email = texts.emailFormatError;
  }
  return errors;
}

/** design.md D6: the trimmed address fields the lookup sends. */
export function toGeocodeQuery(values: LocationFormValues): GeocodeQuery {
  return {
    street: values.address.trim(),
    postalCode: values.postalCode.trim(),
    city: values.city.trim(),
    country: values.country.trim(),
  };
}

/** design.md D6: the cache key — the four trimmed values, lower-cased, joined with `|`. */
export function geocodeCacheKey(query: GeocodeQuery): string {
  return [query.street, query.postalCode, query.city, query.country]
    .join("|")
    .toLowerCase();
}

/**
 * design.md D7: the `createALocation` body — `name` as typed, `description`
 * and each optional contact field only when non-empty, the request's names
 * (`postal_code`), and `latitud`/`longitud` as numbers only with coordinates.
 */
export function toCreateLocationPayload(
  values: LocationFormValues,
  coordinates: Coordinates | null,
): CreateLocationPayload {
  const contact: CreateLocationPayload["contact"] = {
    address: values.address,
    city: values.city,
  };
  if (values.postalCode.trim() !== "") contact.postal_code = values.postalCode;
  if (values.country.trim() !== "") contact.country = values.country;
  if (values.phone.trim() !== "") contact.phone = values.phone;
  if (values.email.trim() !== "") contact.email = values.email;
  if (values.web.trim() !== "") contact.web = values.web;
  if (values.social.trim() !== "") contact.social = values.social;

  const payload: CreateLocationPayload = { name: values.name, contact };
  if (values.description.trim() !== "") payload.description = values.description;
  if (coordinates) {
    payload.latitud = Number(coordinates.lat);
    payload.longitud = Number(coordinates.lon);
  }
  return payload;
}
