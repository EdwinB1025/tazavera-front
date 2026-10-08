import { describe, it, expect } from "vitest";
import {
  toCreateLocationPayload,
  validateLocationForm,
  type LocationFormValues,
} from "@/features/location-management/model/location-form";

/**
 * The location form's client checks and its request body (design.md D6, D7).
 * Every message comes from the fixture below.
 */

const TEXTS = { requiredError: "fx-required", emailFormatError: "fx-email-format" };

const EMPTY: LocationFormValues = {
  name: "",
  description: "",
  address: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  web: "",
  social: "",
};

const MINIMAL: LocationFormValues = {
  ...EMPTY,
  name: "Tazavera Gràcia",
  address: "Carrer de Verdi 12",
  city: "Barcelona",
};

describe("validateLocationForm (design.md D7)", () => {
  it.each(["", "   "])("requires Name, Address and City (%j)", (blank) => {
    expect(
      validateLocationForm({ ...MINIMAL, name: blank, address: blank, city: blank }, TEXTS),
    ).toEqual({
      name: TEXTS.requiredError,
      address: TEXTS.requiredError,
      city: TEXTS.requiredError,
    });
  });

  it("rejects a non-empty invalid Email", () => {
    expect(validateLocationForm({ ...MINIMAL, email: "ana@" }, TEXTS)).toEqual({
      email: TEXTS.emailFormatError,
    });
  });

  it("returns nothing for empty optional fields", () => {
    expect(validateLocationForm(MINIMAL, TEXTS)).toEqual({});
  });
});

describe("toCreateLocationPayload (design.md D6, D7)", () => {
  it("sends name and the required contact fields, omitting empty description and optional fields", () => {
    expect(toCreateLocationPayload(MINIMAL, null)).toEqual({
      name: "Tazavera Gràcia",
      contact: { address: "Carrer de Verdi 12", city: "Barcelona" },
    });
  });

  it("sends the description and the optional contact fields with the request's names", () => {
    const payload = toCreateLocationPayload(
      {
        ...MINIMAL,
        description: "Barra de especialidad",
        postalCode: "08012",
        country: "España",
        phone: "+34 932 123 456",
        email: "hola@cafeteria.example",
        web: "https://cafeteria.example",
        social: "@cafeteria.bcn",
      },
      null,
    );
    expect(payload).toEqual({
      name: "Tazavera Gràcia",
      description: "Barra de especialidad",
      contact: {
        address: "Carrer de Verdi 12",
        city: "Barcelona",
        postal_code: "08012",
        country: "España",
        phone: "+34 932 123 456",
        email: "hola@cafeteria.example",
        web: "https://cafeteria.example",
        social: "@cafeteria.bcn",
      },
    });
  });

  it("sends latitud and longitud as numbers with coordinates, and neither key without", () => {
    const withCoordinates = toCreateLocationPayload(MINIMAL, { lat: "41.4029", lon: "2.1565" });
    expect(withCoordinates.latitud).toBe(41.4029);
    expect(withCoordinates.longitud).toBe(2.1565);
    const without = toCreateLocationPayload(MINIMAL, null);
    expect("latitud" in without).toBe(false);
    expect("longitud" in without).toBe(false);
  });
});
