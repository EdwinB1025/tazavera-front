import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  ContactFields,
  type ContactFieldKey,
  type ContactFieldValues,
  type ContactTexts,
} from "@/entities/contact";

/**
 * The contact field group (spec "Contact details form"; design.md D1): eight
 * labelled fields in field order, each input with its name, type, autofill
 * name and maximum length. Every text comes from the fixtures below.
 */

afterEach(() => {
  cleanup();
});

const TEXTS: ContactTexts = {
  contactAddressLabel: "fx-address",
  contactPostalCodeLabel: "fx-postal-code",
  contactCityLabel: "fx-city",
  contactCountryLabel: "fx-country",
  contactPhoneLabel: "fx-phone",
  contactEmailLabel: "fx-email",
  contactWebLabel: "fx-web",
  contactSocialLabel: "fx-social",
};

const VALUES: ContactFieldValues = {
  address: "v-address",
  postalCode: "v-postal",
  city: "v-city",
  country: "v-country",
  phone: "v-phone",
  email: "v-email",
  web: "v-web",
  social: "v-social",
};

/** design.md D1 table: key, label, type, autocomplete, maxlength, required. */
const TABLE: ReadonlyArray<
  [ContactFieldKey, keyof ContactTexts, string, string, number, boolean]
> = [
  ["address", "contactAddressLabel", "text", "street-address", 255, true],
  ["postalCode", "contactPostalCodeLabel", "text", "postal-code", 12, false],
  ["city", "contactCityLabel", "text", "address-level2", 90, true],
  ["country", "contactCountryLabel", "text", "country-name", 60, false],
  ["phone", "contactPhoneLabel", "tel", "tel", 25, false],
  ["email", "contactEmailLabel", "email", "email", 255, false],
  ["web", "contactWebLabel", "url", "url", 255, false],
  ["social", "contactSocialLabel", "text", "off", 255, false],
];

function renderFields(errors = {}) {
  const onChange = vi.fn<(key: ContactFieldKey, value: string) => void>();
  render(
    <form>
      <ContactFields values={VALUES} errors={errors} onChange={onChange} texts={TEXTS} />
    </form>,
  );
  return { onChange };
}

describe("ContactFields", () => {
  it.each(TABLE)(
    "%s carries its label, type, autocomplete, maxlength and required marker",
    (key, labelKey, type, autocomplete, maxLength, required) => {
      renderFields();
      const input = screen.getByLabelText(new RegExp(`^${TEXTS[labelKey]}`)) as HTMLInputElement;
      expect(input.getAttribute("name")).toBe(key);
      expect(input.getAttribute("type")).toBe(type);
      expect(input.getAttribute("autocomplete")).toBe(autocomplete);
      expect(input.getAttribute("maxlength")).toBe(String(maxLength));
      expect(input.required).toBe(required);
      const label = document.querySelector(`label[for="${input.id}"]`)!;
      expect(label.textContent?.includes("*")).toBe(required);
    },
  );
});
