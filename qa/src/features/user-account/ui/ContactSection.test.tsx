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
  save: "fx-save",
  cancel: "fx-cancel",
  genericError: "fx-generic",
  requiredError: "fx-required",
  emailFormatError: "fx-email-format",
  urlFormatError: "fx-url-format",
  contactSaved: "fx-saved",
  contactExists: "fx-exists",
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

describe("ContactSection — reading", () => {
  it("is a region named by its heading, with its description", async () => {
    request.mockResolvedValue(json(200, { data: [] }));
    renderSection();
    await settle();
    expect(region().textContent).toContain(TEXTS.contactDescription);
  });

  it.each([
    ["500", () => Promise.resolve(json(500, { message: API_MESSAGE }))],
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

// ─── The add form (spec "Contact details form") ───

const TYPED = {
  address: "Carrer de Verdi 12",
  postalCode: "",
  city: "Barcelona",
  country: "",
  phone: "+34 600 123 456",
  email: "",
  web: "https://example.org",
  social: "",
};

function input(name: string): HTMLInputElement {
  return document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
}

function type(values: Record<string, string>): void {
  for (const [name, value] of Object.entries(values)) {
    fireEvent.change(input(name), { target: { value } });
  }
}

function saveButton(): HTMLElement {
  return screen.getByRole("button", { name: TEXTS.save });
}

function actionsRow(): HTMLElement {
  return saveButton().parentElement!;
}

/** Opens the form from the empty state. */
async function openForm() {
  request.mockResolvedValueOnce(json(200, { data: [] }));
  const utils = renderSection();
  await settle();
  fireEvent.click(screen.getByRole("button", { name: TEXTS.contactAddButton }));
  return utils;
}

/** Fills the form and submits it, the POST answered by `respond`. */
async function submitWith(respond: () => Promise<Response>) {
  const utils = await openForm();
  type(TYPED);
  request.mockImplementationOnce(respond);
  fireEvent.click(saveButton());
  await settle();
  return utils;
}

function expectTypedValuesKept(): void {
  for (const [name, value] of Object.entries(TYPED)) {
    expect(input(name).value, name).toBe(value);
  }
}

/** True when `a` comes before `b` in document order. */
function precedes(a: Node, b: Node): boolean {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

describe("ContactSection — the add form", () => {
  it("the add button has the primary treatment and an aria-hidden icon before its label", async () => {
    request.mockResolvedValueOnce(json(200, { data: [] }));
    renderSection();
    await settle();
    const button = screen.getByRole("button", { name: TEXTS.contactAddButton });
    expect(button.classList.contains("bg-action-primary")).toBe(true);
    const icon = button.querySelector("svg")!;
    expect(icon).not.toBeNull();
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    const label = Array.from(button.childNodes).find((node) =>
      node.textContent?.includes(TEXTS.contactAddButton),
    )!;
    expect(precedes(icon, label)).toBe(true);
  });

  it("409 followed by an empty re-read shows the empty state with no status", async () => {
    await openForm();
    type(TYPED);
    request.mockResolvedValueOnce(json(409, {}));
    request.mockResolvedValueOnce(json(200, { data: [] }));
    fireEvent.click(saveButton());
    await settle();
    await settle();
    expect(screen.getByText(TEXTS.contactEmptyText)).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText(TEXTS.contactExists)).toBeNull();
  });

  it("409 followed by a failed re-read shows the load error with no status", async () => {
    await openForm();
    type(TYPED);
    request.mockResolvedValueOnce(json(409, {}));
    request.mockResolvedValueOnce(json(500, {}));
    fireEvent.click(saveButton());
    await settle();
    await settle();
    expect(screen.getByText(TEXTS.contactLoadError)).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText(TEXTS.contactExists)).toBeNull();
  });

  it.each([
    ["500", () => Promise.resolve(json(500, { message: API_MESSAGE }))],
    ["418", () => Promise.resolve(json(418, { message: API_MESSAGE }))],
    ["a rejected request", () => Promise.reject(new Error("network"))],
  ])("%s shows the generic error above the actions and keeps every value", async (_, respond) => {
    await submitWith(respond);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe(TEXTS.genericError);
    expect(precedes(alert, actionsRow())).toBe(true);
    expectTypedValuesKept();
    expect(region().textContent).not.toContain(API_MESSAGE);
    expect(region().textContent).not.toContain("fx-api-field-error");
  });
});
