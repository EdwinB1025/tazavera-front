import { describe, it, expect } from "vitest";
import type { ContactFieldValues } from "@/entities/contact";
import { checkContact, toContactPayload } from "./contact-checks";

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

const EMPTY: ContactFieldValues = {
  address: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  web: "",
  social: "",
};

describe("checkContact", () => {
  it("returns {} for a valid set", () => {
    expect(checkContact(VALID, TEXTS)).toEqual({});
  });

  it.each(["", "   "])("requires address and city (%j)", (blank) => {
    expect(checkContact({ ...VALID, address: blank, city: blank }, TEXTS)).toEqual({
      address: TEXTS.requiredError,
      city: TEXTS.requiredError,
    });
  });

  it("returns only the required errors for an all-empty set", () => {
    expect(checkContact(EMPTY, TEXTS)).toEqual({
      address: TEXTS.requiredError,
      city: TEXTS.requiredError,
    });
  });

  it("rejects an invalid email and accepts an empty one", () => {
    expect(checkContact({ ...VALID, email: "ana@" }, TEXTS)).toEqual({
      email: TEXTS.emailFormatError,
    });
    expect(checkContact({ ...VALID, email: "" }, TEXTS)).toEqual({});
  });

  it.each(["example", "www.example.org"])("rejects web %j", (web) => {
    expect(checkContact({ ...VALID, web }, TEXTS)).toEqual({
      web: TEXTS.urlFormatError,
    });
  });

  it.each(["https://example.org", ""])("accepts web %j", (web) => {
    expect(checkContact({ ...VALID, web }, TEXTS)).toEqual({});
  });
});

describe("toContactPayload", () => {
  it("maps postalCode to postal_code and keeps typed values", () => {
    expect(toContactPayload(VALID)).toEqual({
      address: VALID.address,
      city: VALID.city,
      postal_code: VALID.postalCode,
      country: VALID.country,
      phone: VALID.phone,
      email: VALID.email,
      web: VALID.web,
      social: VALID.social,
    });
  });

  it.each(["", "  "])("sends each empty optional value (%j) as null", (blank) => {
    const payload = toContactPayload({
      ...VALID,
      postalCode: blank,
      country: blank,
      phone: blank,
      email: blank,
      web: blank,
      social: blank,
    });
    expect(payload).toEqual({
      address: VALID.address,
      city: VALID.city,
      postal_code: null,
      country: null,
      phone: null,
      email: null,
      web: null,
      social: null,
    });
    expect(Object.keys(payload)).not.toContain("postalCode");
    expect(Object.values(payload)).not.toContain("");
  });
});
