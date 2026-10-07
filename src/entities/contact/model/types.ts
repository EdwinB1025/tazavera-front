/**
 * UI-specific types of the `contact` entity (design.md "Derived and
 * UI-specific types"). The API types `Contact` and `ContactCreatePayload`
 * come from `@/shared/api`; these describe only what the UI holds.
 */

/** The eight form keys, in field order. */
export type ContactFieldKey =
  | "address"
  | "postalCode"
  | "city"
  | "country"
  | "phone"
  | "email"
  | "web"
  | "social";

/** What the eight fields hold while the user types. */
export type ContactFieldValues = Record<ContactFieldKey, string>;

/** Per-field error messages; a key without a message is valid. */
export type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

/** The eight labels, from the `contact` catalog area. */
export type ContactTexts = {
  contactAddressLabel: string;
  contactPostalCodeLabel: string;
  contactCityLabel: string;
  contactCountryLabel: string;
  contactPhoneLabel: string;
  contactEmailLabel: string;
  contactWebLabel: string;
  contactSocialLabel: string;
};
