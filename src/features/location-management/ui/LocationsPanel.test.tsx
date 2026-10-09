import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";

/**
 * The locations panel (design.md D3, D4; specs "Own locations list", "Empty
 * locations state", "Location form", "Location creation"). The token client
 * and the geocoding entry point are replaced by spies so every response can
 * be driven; the list responses are the `listAUsersLocations` contract
 * examples. Every text comes from the fixture below.
 */
const { request, geocodeAddress } = vi.hoisted(() => ({
  request: vi.fn(),
  geocodeAddress: vi.fn(),
}));
vi.mock("@/shared/api", () => ({ request }));
vi.mock("@/shared/lib/geocoding", () => ({ geocodeAddress }));

import { LocationsPanel, type LocationsPanelTexts } from "@/features/location-management";

const TEXTS: LocationsPanelTexts = {
  loading: "fx-loading",
  locationsLoadError: "fx-load-error",
  retry: "fx-retry",
  locationsEmptyText: "fx-empty",
  addLocation: "fx-add",
  locationCreated: "fx-created",
  locationCreatedNoMap: "fx-created-no-map",
  locationNoMap: "fx-no-map",
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

/** The `listAUsersLocations` 200 example of the contract. */
const LOCATIONS = [
  {
    ulid: "01K5Z9C2T6H8M3Q7V1X4B9N2PA",
    name: "Nomad Coffee Born",
    description: "Nomad Coffee al Born.",
    latitud: "41.38610000",
    longitud: "2.17940000",
    contacts: [
      {
        ulid: "01K5ZC0NT4C7A1H8M3Q7V1X4B9",
        isPrimary: true,
        phone: "+34 932 123 456",
        email: "hola@cafeteria.example",
        web: "https://cafeteria.example",
        social: "@cafeteria.bcn",
        address: "Carrer de la Riereta 1",
        country: "España",
        city: "Barcelona",
        postalCode: "08001",
      },
    ],
  },
  {
    ulid: "01K5Z9C2T6H8M3Q7V1X4B9N2PB",
    name: "Nomad Coffee Gràcia",
    description: null,
    latitud: null,
    longitud: null,
    contacts: [
      {
        ulid: "01K5ZC0NT4C7A1H8M3Q7V1X4BB",
        isPrimary: true,
        phone: null,
        email: null,
        web: null,
        social: null,
        address: "Carrer de Verdi 12",
        country: "España",
        city: "Barcelona",
        postalCode: "08012",
      },
    ],
  },
];

const HEADING_ID = "page-heading";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** A request whose response the test never resolves. */
function pending(): Promise<Response> {
  return new Promise<Response>(() => {});
}

beforeEach(() => {
  request.mockReset();
  geocodeAddress.mockReset();
});

afterEach(() => {
  cleanup();
});

function renderPanel() {
  return render(
    <>
      <h1 id={HEADING_ID} tabIndex={-1}>
        fx-page-title
      </h1>
      <LocationsPanel
        userUlid="u1"
        headingId={HEADING_ID}
        texts={TEXTS}
      />
    </>,
  );
}

async function settle(): Promise<void> {
  await act(async () => {});
}

function addButton(): HTMLElement {
  return screen.getByRole("button", { name: TEXTS.addLocation });
}

function field(name: string): HTMLInputElement {
  return document.querySelector(`[name="${name}"]`) as HTMLInputElement;
}

function type(name: string, value: string): void {
  fireEvent.change(field(name), { target: { value } });
}

async function submitValidForm(): Promise<void> {
  type("name", "Tazavera Gràcia");
  type("address", "Carrer de Verdi 12");
  type("city", "Barcelona");
  fireEvent.click(screen.getByRole("button", { name: TEXTS.save }));
  await settle();
}

describe("LocationsPanel — reading (spec: Own locations list)", () => {
  it("shows the loading status while the read is pending", () => {
    request.mockReturnValue(pending());
    renderPanel();
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(request).toHaveBeenCalledWith("/users/u1/locations", expect.anything());
  });

  it.each([
    ["a 500", () => request.mockResolvedValueOnce(json(500, {}))],
    ["a rejected fetch", () => request.mockRejectedValueOnce(new TypeError("network"))],
  ])("shows the load error and Try again on %s, which reads again", async (_label, fail) => {
    fail();
    request.mockResolvedValueOnce(json(200, { data: LOCATIONS }));
    renderPanel();
    await settle();
    expect(screen.getByText(TEXTS.locationsLoadError)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retry }));
    await settle();
    expect(request).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(TEXTS.locationsLoadError)).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the loading status instead of the load error while Try again is pending", async () => {
    request.mockResolvedValueOnce(json(500, {})).mockReturnValueOnce(pending());
    renderPanel();
    await settle();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retry }));
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(screen.queryByText(TEXTS.locationsLoadError)).toBeNull();
  });

  it("renders the empty card with the text and Add location, and no list (spec: Empty locations state)", async () => {
    request.mockResolvedValue(json(200, { data: [] }));
    renderPanel();
    await settle();
    const text = screen.getByText(TEXTS.locationsEmptyText);
    expect(text.closest(".rounded-container")).toBe(addButton().closest(".rounded-container"));
    expect(document.querySelector("ul")).toBeNull();
  });

  it("renders Add location above a list labelled by the heading, one item per location in order", async () => {
    request.mockResolvedValue(json(200, { data: LOCATIONS }));
    renderPanel();
    await settle();
    const list = document.querySelector("ul")!;
    expect(list.getAttribute("aria-labelledby")).toBe(HEADING_ID);
    expect(addButton().compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.querySelector("h2")?.textContent)).toEqual([
      "Nomad Coffee Born",
      "Nomad Coffee Gràcia",
    ]);
    const born = LOCATIONS[0].contacts[0];
    for (const value of [born.address, born.postalCode, born.city, born.country, born.phone, born.email, born.web, born.social]) {
      expect(items[0].textContent).toContain(value);
    }
    expect(items[1].querySelectorAll("dt")).toHaveLength(4);
    expect(items[0].textContent).not.toContain(TEXTS.locationNoMap);
    expect(items[1].textContent).toContain(TEXTS.locationNoMap);
  });

  it("shows the primary contact on the card, not the first one", async () => {
    const primary = LOCATIONS[0].contacts[0];
    const other = { ...primary, ulid: "01K5ZC0NT4C7A1H8M3Q7V1X4BC", isPrimary: false, address: "fx-other-address" };
    request.mockResolvedValue(json(200, { data: [{ ...LOCATIONS[0], contacts: [other, primary] }] }));
    renderPanel();
    await settle();
    const item = screen.getByRole("listitem");
    expect(item.textContent).toContain(primary.address);
    expect(item.textContent).not.toContain(other.address);
  });
});

describe("LocationsPanel — texts (spec: Localized location texts)", () => {
  it("renders no message string of a failed or successful response (spec: Response messages not shown)", async () => {
    request
      .mockResolvedValueOnce(json(500, { message: "fx-api-read-failed" }))
      .mockResolvedValueOnce(json(200, { data: [], message: "fx-api-read-ok" }))
      .mockResolvedValueOnce(json(500, { message: "fx-api-create-failed" }));
    geocodeAddress.mockResolvedValue({ status: "not-found" });
    renderPanel();
    await settle();
    expect(document.body.textContent).not.toContain("fx-api-");
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retry }));
    await settle();
    expect(document.body.textContent).not.toContain("fx-api-");
    fireEvent.click(addButton());
    await submitValidForm();
    expect(screen.getByText(TEXTS.genericError)).toBeDefined();
    expect(document.body.textContent).not.toContain("fx-api-");
  });
});

describe("LocationsPanel — reveal (spec: Location form)", () => {
  it.each([
    ["empty", []],
    ["list", LOCATIONS],
  ])("in the %s state Add location reveals the form focused on Name, and Cancel restores the focused button", async (_label, data) => {
    request.mockResolvedValue(json(200, { data }));
    renderPanel();
    await settle();
    fireEvent.click(addButton());
    expect(screen.queryByRole("button", { name: TEXTS.addLocation })).toBeNull();
    expect(screen.getByRole("form", { name: TEXTS.newLocationHeading })).toBeDefined();
    expect(document.activeElement).toBe(field("name"));
    fireEvent.click(screen.getByRole("button", { name: TEXTS.cancel }));
    expect(document.querySelector("form")).toBeNull();
    expect(document.activeElement).toBe(addButton());
  });

  it("sends no geocoding request while typing", async () => {
    request.mockResolvedValue(json(200, { data: [] }));
    renderPanel();
    await settle();
    fireEvent.click(addButton());
    type("address", "Carrer de Verdi 12");
    type("city", "Barcelona");
    expect(geocodeAddress).not.toHaveBeenCalled();
  });
});

describe("LocationsPanel — creation (spec: Location creation)", () => {
  it("on 201 with coordinates closes the form, shows locationCreated only, reads again and focuses the heading", async () => {
    request
      .mockResolvedValueOnce(json(200, { data: [] }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(json(200, { data: LOCATIONS }));
    geocodeAddress.mockResolvedValue({ status: "found", lat: "41.4029", lon: "2.1565" });
    renderPanel();
    await settle();
    fireEvent.click(addButton());
    await submitValidForm();
    expect(document.querySelector("form")).toBeNull();
    const status = screen.getByRole("status");
    expect(status.textContent).toBe(TEXTS.locationCreated);
    expect(request).toHaveBeenCalledTimes(3);
    expect(request.mock.calls[2][0]).toBe("/users/u1/locations");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(document.activeElement).toBe(document.getElementById(HEADING_ID));
  });

  it("on 201 without coordinates shows locationCreated and locationCreatedNoMap", async () => {
    request
      .mockResolvedValueOnce(json(200, { data: [] }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(json(200, { data: LOCATIONS }));
    geocodeAddress.mockResolvedValue({ status: "not-found" });
    renderPanel();
    await settle();
    fireEvent.click(addButton());
    await submitValidForm();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain(TEXTS.locationCreated);
    expect(status.textContent).toContain(TEXTS.locationCreatedNoMap);
  });

  it("clears the status when Add location is activated", async () => {
    request
      .mockResolvedValueOnce(json(200, { data: [] }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(json(200, { data: LOCATIONS }));
    geocodeAddress.mockResolvedValue({ status: "found", lat: "41.4029", lon: "2.1565" });
    renderPanel();
    await settle();
    fireEvent.click(addButton());
    await submitValidForm();
    expect(screen.getByText(TEXTS.locationCreated)).toBeDefined();
    fireEvent.click(addButton());
    expect(screen.queryByText(TEXTS.locationCreated)).toBeNull();
  });
});
