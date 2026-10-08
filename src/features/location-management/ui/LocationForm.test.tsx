import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { LocationForm, type LocationFormTexts } from "./LocationForm";
import type { SubmitState } from "../model/types";

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
  stepUpText: "fx-step-up",
  stepUpButton: "fx-confirm",
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
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const requestProfileWrite = vi.fn();
  const utils = render(
    <LocationForm
      locale="es"
      texts={TEXTS}
      submitState={submitState}
      onSubmit={onSubmit}
      onCancel={onCancel}
      requestProfileWrite={requestProfileWrite}
    />,
  );
  const rerenderWith = (state: SubmitState) =>
    utils.rerender(
      <LocationForm
        locale="es"
        texts={TEXTS}
        submitState={state}
        onSubmit={onSubmit}
        onCancel={onCancel}
        requestProfileWrite={requestProfileWrite}
      />,
    );
  return { ...utils, onSubmit, onCancel, requestProfileWrite, rerenderWith };
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
  it("renders the help and the attribution with one same-tab OpenStreetMap link", () => {
    renderForm();
    expect(screen.getByText(TEXTS.geocodingHelp)).toBeDefined();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toBe(TEXTS.osmContributors);
    expect(links[0].getAttribute("href")).toBe("https://www.openstreetmap.org/copyright");
    expect(links[0].hasAttribute("target")).toBe(false);
    expect(links[0].parentElement?.textContent).toBe("fx-addresses: © fx-osm");
  });
});

describe("LocationForm checks (spec: Location form checks)", () => {
  it("shows requiredError under Name, Address and City, focuses Name and does not submit", () => {
    const { onSubmit } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.save }));
    for (const key of ["name", "address", "city"]) {
      const field = input(key);
      expect(field.getAttribute("aria-invalid")).toBe("true");
      const error = document.getElementById(field.getAttribute("aria-describedby")!);
      expect(error?.textContent).toBe(TEXTS.requiredError);
    }
    expect(document.activeElement).toBe(input("name"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows emailFormatError for an invalid Email and focuses it", () => {
    const { onSubmit } = renderForm();
    fillRequired();
    type("email", "ana@");
    fireEvent.click(screen.getByRole("button", { name: TEXTS.save }));
    expect(input("email").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText(TEXTS.emailFormatError)).toBeDefined();
    expect(document.activeElement).toBe(input("email"));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("LocationForm submit states (spec: Location creation failures)", () => {
  it("makes Save busy and Cancel disabled while submitting", () => {
    renderForm("submitting");
    expect(screen.getByRole("button", { name: TEXTS.save }).getAttribute("aria-busy")).toBe("true");
    expect((screen.getByRole("button", { name: TEXTS.cancel }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders genericError in one alert region above the actions on error", () => {
    renderForm("error");
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toBe(TEXTS.genericError);
    expect(screen.queryByText(TEXTS.stepUpText)).toBeNull();
    const save = screen.getByRole("button", { name: TEXTS.save });
    expect(alerts[0].compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("submits the values and keeps them after error and step-up", () => {
    const { onSubmit, rerenderWith } = renderForm();
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.save }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: "Tazavera Gràcia",
      address: "Carrer de Verdi 12",
      city: "Barcelona",
    });
    for (const state of ["submitting", "error", "submitting", "step-up"] as const) {
      rerenderWith(state);
    }
    expect(input("name").value).toBe("Tazavera Gràcia");
    expect(input("address").value).toBe("Carrer de Verdi 12");
    expect(input("city").value).toBe("Barcelona");
  });
});
