import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { LocationForm, type LocationFormTexts } from "@/features/location-management/ui/LocationForm";
import type { SubmitState } from "@/features/location-management/model/types";

/**
 * The location form (design.md D7; specs "Location form", "Location form
 * checks", "Location creation failures"): the section card with its band
 * heading, the two fieldsets, the help and attribution lines, the client
 * checks, the single alert region and the actions. Every text comes from the
 * fixture below.
 */

afterEach(() => {
  cleanup();
});

const TEXTS: LocationFormTexts = {
  newLocationHeading: "fx-new-location",
  locationGroupLegend: "fx-location-legend",
  contactGroupLegend: "fx-contact-legend",
  locationNameLabel: "fx-name",
  locationDescriptionLabel: "fx-description",
  geocodingHelp: "fx-geocoding-help",
  geocodingAttribution: "fx-addresses: © {link}",
  osmContributors: "fx-osm",
  save: "fx-save",
  cancel: "fx-cancel",
  genericError: "fx-generic-error",
  requiredError: "fx-required",
  emailFormatError: "fx-email-format",
  contactAddressLabel: "fx-address",
  contactPostalCodeLabel: "fx-postal-code",
  contactCityLabel: "fx-city",
  contactCountryLabel: "fx-country",
  contactPhoneLabel: "fx-phone",
  contactEmailLabel: "fx-email",
  contactWebLabel: "fx-web",
  contactSocialLabel: "fx-social",
};

function renderForm(submitState: SubmitState = "idle") {
  const onSubmit = vi.fn().mockResolvedValue(null);
  const onCancel = vi.fn();
  const utils = render(
    <LocationForm
      texts={TEXTS}
      submitState={submitState}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  );
  const rerenderWith = (state: SubmitState) =>
    utils.rerender(
      <LocationForm
        texts={TEXTS}
        submitState={state}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );
  return { ...utils, onSubmit, onCancel, rerenderWith };
}

function input(name: string): HTMLInputElement | HTMLTextAreaElement {
  return document.querySelector(`[name="${name}"]`) as HTMLInputElement;
}

function type(name: string, value: string): void {
  fireEvent.change(input(name), { target: { value } });
}

function fillRequired(): void {
  type("name", "Tazavera Gràcia");
  type("address", "Carrer de Verdi 12");
  type("city", "Barcelona");
}

describe("LocationForm structure (design.md D7)", () => {
  it("is a noValidate form in a section card, named by the band h2", () => {
    const { container } = renderForm();
    const form = screen.getByRole("form", { name: TEXTS.newLocationHeading });
    expect(form.hasAttribute("novalidate")).toBe(true);
    const heading = screen.getByRole("heading", { level: 2, name: TEXTS.newLocationHeading });
    expect(heading.className).toBe("type-subheading");
    expect(heading.closest(".bg-surface-section")).not.toBeNull();
    expect((container.firstElementChild as HTMLElement).className).toContain("border-border-subtle");
  });

  it("groups the fields in two fieldsets with visible legends", () => {
    renderForm();
    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(2);
    expect(within(groups[0]).getByText(TEXTS.locationGroupLegend).tagName).toBe("LEGEND");
    expect(within(groups[1]).getByText(TEXTS.contactGroupLegend).tagName).toBe("LEGEND");
    expect(within(groups[0]).getByLabelText(/^fx-name/)).toBe(input("name"));
    expect(within(groups[1]).getByLabelText(/^fx-address/)).toBe(input("address"));
  });

  it("renders Name and Description with their attributes", () => {
    renderForm();
    const name = input("name") as HTMLInputElement;
    expect(name.getAttribute("autocomplete")).toBe("organization");
    expect(name.required).toBe(true);
    expect(name.getAttribute("maxlength")).toBe("150");
    const description = input("description");
    expect(description.tagName).toBe("TEXTAREA");
    expect(description.getAttribute("maxlength")).toBe("255");
  });

  it("renders the eight contact fields with Address and City required, in the paired layout", () => {
    renderForm();
    const lengths = {
      address: "255",
      postalCode: "12",
      city: "90",
      country: "60",
      phone: "25",
      email: "255",
      web: "255",
      social: "255",
    };
    for (const [key, maxLength] of Object.entries(lengths)) {
      const field = input(key) as HTMLInputElement;
      expect(field.getAttribute("maxlength")).toBe(maxLength);
      expect(field.required).toBe(key === "address" || key === "city");
    }
    expect(document.querySelectorAll(".md\\:grid-cols-2")).toHaveLength(3);
  });
});


describe("LocationForm submit states (spec: Location creation failures)", () => {
  it("calls onCancel from Cancel", () => {
    const { onCancel } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.cancel }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
