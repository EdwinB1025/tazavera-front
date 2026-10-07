import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Contact } from "@/shared/api";
import { LINK_CLASSES } from "@/shared/ui";
import { ContactDetails, type ContactTexts } from "@/entities/contact";

/**
 * The contact's read-only list (spec "Contact details"; design.md D1): one
 * `dl` with one label/value row per non-null value, in field order. Every
 * text comes from the fixtures below.
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

const CONTACT: Contact = {
  ulid: "c1",
  isPrimary: true,
  address: "Carrer de Verdi 12",
  postalCode: "08012",
  city: "Barcelona",
  country: "España",
  phone: "+34 600 123 456",
  email: "augusto@example.com",
  web: "https://example.org",
  social: "@augusto.cafe",
};

function terms(): string[] {
  return Array.from(document.querySelectorAll("dt")).map((dt) => dt.textContent ?? "");
}

function values(): string[] {
  return Array.from(document.querySelectorAll("dd")).map((dd) => dd.textContent ?? "");
}

describe("ContactDetails", () => {
  it("renders one dl with eight rows in field order, each value as given", () => {
    render(<ContactDetails contact={CONTACT} texts={TEXTS} />);
    expect(document.querySelectorAll("dl")).toHaveLength(1);
    expect(terms()).toEqual([
      TEXTS.contactAddressLabel,
      TEXTS.contactPostalCodeLabel,
      TEXTS.contactCityLabel,
      TEXTS.contactCountryLabel,
      TEXTS.contactPhoneLabel,
      TEXTS.contactEmailLabel,
      TEXTS.contactWebLabel,
      TEXTS.contactSocialLabel,
    ]);
    expect(values()).toEqual([
      CONTACT.address,
      CONTACT.postalCode,
      CONTACT.city,
      CONTACT.country,
      CONTACT.phone,
      CONTACT.email,
      CONTACT.web,
      CONTACT.social,
    ]);
  });

  it("renders no row for a null web", () => {
    render(<ContactDetails contact={{ ...CONTACT, web: null }} texts={TEXTS} />);
    expect(document.querySelectorAll("dt")).toHaveLength(7);
    expect(terms()).not.toContain(TEXTS.contactWebLabel);
  });

  it.each(["https://example.org"])(
    "renders web %s as a same-tab link with the link classes",
    (web) => {
      render(<ContactDetails contact={{ ...CONTACT, web }} texts={TEXTS} />);
      const link = screen.getByRole("link", { name: web });
      expect(link.getAttribute("href")).toBe(web);
      expect(link.hasAttribute("target")).toBe(false);
      for (const token of LINK_CLASSES.split(" ").filter(Boolean)) {
        expect(link.classList.contains(token), token).toBe(true);
      }
    },
  );

  it.each(["javascript:alert(1)"])(
    "renders web %s as text, never a link",
    (web) => {
      render(<ContactDetails contact={{ ...CONTACT, web }} texts={TEXTS} />);
      expect(document.querySelector("dl a")).toBeNull();
      expect(values()).toContain(web);
    },
  );
});
