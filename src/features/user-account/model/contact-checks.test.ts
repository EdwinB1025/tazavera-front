import { describe, it, expect } from "vitest";
import type { ContactFieldValues } from "@/entities/contact";
import { checkContact } from "./contact-checks";

/**
 * The contact form's client checks and its request body (spec "Contact
 * details form"; design.md D4). Every message comes from the fixture below.
 */

const TEXTS = {
  requiredError: "fx-required",
  emailFormatError: "fx-email-format",
  urlFormatError: "fx-url-format",
};

const VALID: ContactFieldValues = {
  address: "Carrer de Verdi 12",
  postalCode: "08012",
  city: "Barcelona",
  country: "España",
  phone: "+34 600 123 456",
  email: "ana@example.com",
  web: "https://example.org",
  social: "@ana",
};

describe("checkContact", () => {
  it.each(["   "])("requires address and city (%j)", (blank) => {
    expect(checkContact({ ...VALID, address: blank, city: blank }, TEXTS)).toEqual({
      address: TEXTS.requiredError,
      city: TEXTS.requiredError,
    });
  });
});
