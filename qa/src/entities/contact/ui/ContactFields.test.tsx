import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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
  it("renders the eight fields in the order of the D1 table", () => {
    renderFields();
    const names = Array.from(document.querySelectorAll("input")).map((input) =>
      input.getAttribute("name"),
    );
    expect(names).toEqual(TABLE.map(([key]) => key));
  });

  it.each(TABLE)("%s shows its value and reports typing through onChange", (key) => {
    const { onChange } = renderFields();
    const input = document.querySelector(`input[name="${key}"]`) as HTMLInputElement;
    expect(input.value).toBe(VALUES[key]);
    fireEvent.change(input, { target: { value: "typed" } });
    expect(onChange).toHaveBeenCalledWith(key, "typed");
  });

  it("shows an error under its field and marks only that field invalid", () => {
    renderFields({ city: "fx-city-error" });
    const city = document.querySelector('input[name="city"]')!;
    expect(city.getAttribute("aria-invalid")).toBe("true");
    const error = screen.getByText("fx-city-error");
    expect(city.getAttribute("aria-describedby")).toBe(error.id);
    const invalid = Array.from(document.querySelectorAll('input[aria-invalid="true"]'));
    expect(invalid).toEqual([city]);
  });
});

// ─── Paired layout (add-coffeeshop-location design.md D12) ───

/** The element holding the named input's field (the field is its label's parent). */
function rowOf(key: ContactFieldKey): HTMLElement {
  const input = document.querySelector(`input[name="${key}"]`)!;
  const label = document.querySelector(`label[for="${input.id}"]`)!;
  return label.parentElement!.parentElement!;
}

describe("ContactFields layout (add-coffeeshop-location design.md D12)", () => {
  it.each([
    ["postalCode", "city"],
    ["phone", "email"],
    ["web", "social"],
  ] as const)("paired: %s and %s share a two-column row from md", (first, second) => {
    render(
      <form>
        <ContactFields
          values={VALUES}
          errors={{}}
          onChange={() => {}}
          texts={TEXTS}
          layout="paired"
        />
      </form>,
    );
    const row = rowOf(first);
    expect(rowOf(second)).toBe(row);
    expect(row.className).toBe("grid gap-6 md:grid-cols-2");
    expect(row.children).toHaveLength(2);
  });

  it("paired: address and country stay on their own, outside any row", () => {
    const { container } = render(
      <ContactFields values={VALUES} errors={{}} onChange={() => {}} texts={TEXTS} layout="paired" />,
    );
    expect(rowOf("address")).toBe(container);
    expect(rowOf("country")).toBe(container);
    expect(container.querySelectorAll(".md\\:grid-cols-2")).toHaveLength(3);
  });

  it("default: every field is a direct child of the consumer, with no row", () => {
    const { container } = render(
      <ContactFields values={VALUES} errors={{}} onChange={() => {}} texts={TEXTS} />,
    );
    for (const [key] of TABLE) expect(rowOf(key)).toBe(container);
    expect(container.querySelectorAll(".md\\:grid-cols-2")).toHaveLength(0);
  });
});
