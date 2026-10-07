import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";

/**
 * The Contact details section (specs "Contact details", "Contact details
 * form" and "Writes and the step-up"; design.md D3, D4, D6 and D7). The token
 * client is replaced by a spy so every response can be driven; every text
 * comes from the fixture below.
 */
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/shared/api", () => ({ request }));

import { ContactSection, type ContactSectionTexts } from "@/features/user-account";

const TEXTS = {
  contactHeading: "fx-contact-heading",
  contactDescription: "fx-contact-description",
  contactEmptyText: "fx-empty",
  contactAddButton: "fx-add",
  contactLoadError: "fx-load-error",
  retry: "fx-retry",
  loading: "fx-loading",
  contactAddressLabel: "fx-address",
  contactPostalCodeLabel: "fx-postal-code",
  contactCityLabel: "fx-city",
  contactCountryLabel: "fx-country",
  contactPhoneLabel: "fx-phone",
  contactEmailLabel: "fx-email",
  contactWebLabel: "fx-web",
  contactSocialLabel: "fx-social",
  stepUpText: "fx-step-up",
  stepUpButton: "fx-confirm-identity",
} as ContactSectionTexts;

const PRIMARY = {
  ulid: "c1",
  isPrimary: true,
  address: "Carrer de Verdi 12",
  postalCode: "08012",
  city: "Barcelona",
  country: "España",
  phone: "+34 600 123 456",
  email: "augusto@example.com",
  web: null,
  social: "@augusto.cafe",
};

const SECONDARY = {
  ulid: "c0",
  isPrimary: false,
  address: "fx-secondary-address",
  city: "fx-secondary-city",
};

const API_MESSAGE = "fx-api-message";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** A request whose response the test resolves later. */
function deferred(): { promise: Promise<Response>; resolve: (r: Response) => void } {
  let resolve!: (r: Response) => void;
  const promise = new Promise<Response>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

beforeEach(() => {
  request.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderSection() {
  const requestProfileWrite = vi.fn<(returnRoute: string) => void>();
  const utils = render(
    <ContactSection
      ulid="u1"
      locale="es"
      texts={TEXTS}
      requestProfileWrite={requestProfileWrite}
    />,
  );
  return { ...utils, requestProfileWrite };
}

async function settle(): Promise<void> {
  await act(async () => {});
}

function region(): HTMLElement {
  return screen.getByRole("region", { name: TEXTS.contactHeading });
}

function heading(): HTMLElement {
  return screen.getByRole("heading", { level: 2, name: TEXTS.contactHeading });
}

describe("ContactSection — reading", () => {
  it("is a region named by its heading, with its description", async () => {
    request.mockResolvedValue(json(200, { data: [] }));
    renderSection();
    await settle();
    expect(region().textContent).toContain(TEXTS.contactDescription);
  });

  it("while the read is pending shows the loading status only", () => {
    request.mockReturnValue(deferred().promise);
    renderSection();
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(screen.queryByText(TEXTS.contactEmptyText)).toBeNull();
    expect(document.querySelector("dl")).toBeNull();
    expect(document.querySelector("form")).toBeNull();
  });

  it("shows the primary item read-only, with no form or edit action", async () => {
    request.mockResolvedValue(json(200, { data: [SECONDARY, PRIMARY] }));
    renderSection();
    await settle();
    const list = document.querySelector("dl")!;
    expect(list).not.toBeNull();
    expect(list.textContent).toContain(PRIMARY.address);
    expect(list.textContent).toContain(PRIMARY.city);
    expect(region().textContent).not.toContain(SECONDARY.address);
    expect(document.querySelector("form")).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it.each([
    ["no item", { data: [] }],
    ["only non-primary items", { data: [SECONDARY] }],
    [
      "a primary item with every value null",
      {
        data: [
          {
            ulid: "c1",
            isPrimary: true,
            address: null,
            postalCode: null,
            city: null,
            country: null,
            phone: null,
            email: null,
            web: null,
            social: null,
          },
        ],
      },
    ],
  ])("with %s shows the empty text and the add button, no form", async (_, body) => {
    request.mockResolvedValue(json(200, body));
    renderSection();
    await settle();
    expect(screen.getByText(TEXTS.contactEmptyText)).toBeTruthy();
    expect(screen.getByRole("button", { name: TEXTS.contactAddButton })).toBeTruthy();
    expect(document.querySelector("form")).toBeNull();
    expect(document.querySelector("dl")).toBeNull();
  });

  it.each([
    ["500", () => Promise.resolve(json(500, { message: API_MESSAGE }))],
    ["403", () => Promise.resolve(json(403, { message: API_MESSAGE }))],
    ["404", () => Promise.resolve(json(404, { message: API_MESSAGE }))],
    ["a rejected request", () => Promise.reject(new Error("network"))],
  ])("on %s shows the load error and a retry button", async (_, respond) => {
    request.mockImplementation(respond);
    renderSection();
    await settle();
    expect(screen.getByText(TEXTS.contactLoadError)).toBeTruthy();
    expect(screen.getByRole("button", { name: TEXTS.retry })).toBeTruthy();
    expect(region().textContent).not.toContain(API_MESSAGE);
  });

  it("retry shows the loading status, reads again and focuses the heading", async () => {
    request.mockResolvedValueOnce(json(500, {}));
    renderSection();
    await settle();
    const pending = deferred();
    request.mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retry }));
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0]).toBe("/users/u1/contacts");
    expect(request.mock.calls[1][0]).toBe(request.mock.calls[0][0]);
    await settle();
    expect(document.activeElement).toBe(heading());
    pending.resolve(json(200, { data: [] }));
    await settle();
  });

  it("ignores a response that arrives after unmount", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const pending = deferred();
    request.mockReturnValue(pending.promise);
    const { unmount } = renderSection();
    unmount();
    pending.resolve(json(200, { data: [PRIMARY] }));
    await settle();
    expect(errors).not.toHaveBeenCalled();
  });
});
