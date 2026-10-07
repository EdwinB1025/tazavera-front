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

const CREATED = {
  ulid: "c9",
  isPrimary: true,
  address: "fx-created-address",
  city: "fx-created-city",
  web: "https://example.org",
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

function cancelButton(): HTMLElement {
  return screen.getByRole("button", { name: TEXTS.cancel });
}

function actionsRow(): HTMLElement {
  return saveButton().parentElement!;
}

function postCalls(): unknown[][] {
  return request.mock.calls.filter(
    ([, init]) => (init as RequestInit | undefined)?.method === "POST",
  );
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

  it("opening replaces the empty state with a form named by the heading and focuses Address", async () => {
    await openForm();
    expect(screen.queryByText(TEXTS.contactEmptyText)).toBeNull();
    expect(screen.queryByRole("button", { name: TEXTS.contactAddButton })).toBeNull();
    const form = screen.getByRole("form", { name: TEXTS.contactHeading });
    expect(form.querySelectorAll("input")).toHaveLength(8);
    expect(saveButton().getAttribute("type")).toBe("submit");
    expect(saveButton().classList.contains("bg-action-primary")).toBe(true);
    expect(cancelButton().classList.contains("bg-action-4-bg")).toBe(true);
    expect(document.activeElement).toBe(input("address"));
  });

  it("Cancel restores the empty state, discards the values and focuses the add button", async () => {
    await openForm();
    type({ address: "typed" });
    fireEvent.click(cancelButton());
    expect(document.querySelector("form")).toBeNull();
    expect(screen.getByText(TEXTS.contactEmptyText)).toBeTruthy();
    const add = screen.getByRole("button", { name: TEXTS.contactAddButton });
    expect(document.activeElement).toBe(add);
    fireEvent.click(add);
    expect(input("address").value).toBe("");
  });

  it("an empty Address and City show the required error, focus Address and send nothing", async () => {
    await openForm();
    fireEvent.click(saveButton());
    await settle();
    const errors = screen.getAllByText(TEXTS.requiredError);
    expect(errors).toHaveLength(2);
    expect(input("address").getAttribute("aria-invalid")).toBe("true");
    expect(input("city").getAttribute("aria-invalid")).toBe("true");
    expect(input("address").getAttribute("aria-describedby")).toBe(errors[0].id);
    expect(input("city").getAttribute("aria-describedby")).toBe(errors[1].id);
    expect(document.activeElement).toBe(input("address"));
    expect(postCalls()).toHaveLength(0);
  });

  it("an invalid email shows its error, focuses it and sends nothing", async () => {
    await openForm();
    type({ ...TYPED, email: "ana@", web: "" });
    fireEvent.click(saveButton());
    await settle();
    expect(input("email").getAttribute("aria-describedby")).toBe(
      screen.getByText(TEXTS.emailFormatError).id,
    );
    expect(document.activeElement).toBe(input("email"));
    expect(postCalls()).toHaveLength(0);
  });

  it("an invalid web shows its error, focuses the first failing field and sends nothing", async () => {
    await openForm();
    type({ ...TYPED, city: "", web: "www.example.org" });
    fireEvent.click(saveButton());
    await settle();
    expect(input("web").getAttribute("aria-describedby")).toBe(
      screen.getByText(TEXTS.urlFormatError).id,
    );
    expect(document.activeElement).toBe(input("city"));
    expect(postCalls()).toHaveLength(0);
  });

  it("a valid submit sends one POST with the D4 body; while pending Save is busy, Cancel disabled, fields editable", async () => {
    await openForm();
    type(TYPED);
    const pending = deferred();
    request.mockReturnValueOnce(pending.promise);
    fireEvent.click(saveButton());
    await settle();
    expect(postCalls()).toHaveLength(1);
    const [path, init] = postCalls()[0] as [string, RequestInit];
    expect(path).toBe("/users/u1/contacts");
    expect(JSON.parse(init.body as string)).toEqual({
      address: TYPED.address,
      city: TYPED.city,
      postal_code: null,
      country: null,
      phone: TYPED.phone,
      email: null,
      web: TYPED.web,
      social: null,
    });
    expect(saveButton().getAttribute("aria-busy")).toBe("true");
    expect((cancelButton() as HTMLButtonElement).disabled).toBe(true);
    for (const field of Array.from(document.querySelectorAll("input"))) {
      expect(field.disabled).toBe(false);
    }
    pending.resolve(json(500, {}));
    await settle();
  });

  it("201 closes the form, shows the saved status above the created contact and focuses the heading", async () => {
    await submitWith(() => Promise.resolve(json(201, { data: CREATED, message: API_MESSAGE })));
    expect(document.querySelector("form")).toBeNull();
    const status = screen.getByRole("status");
    expect(status.textContent).toBe(TEXTS.contactSaved);
    const list = document.querySelector("dl")!;
    expect(list.textContent).toContain(CREATED.address);
    expect(precedes(status, list)).toBe(true);
    expect(document.activeElement).toBe(heading());
    expect(region().textContent).not.toContain(API_MESSAGE);
  });

  it("409 closes the form, reads again and shows the exists status above the re-read contact", async () => {
    await openForm();
    type(TYPED);
    request.mockResolvedValueOnce(json(409, { message: API_MESSAGE }));
    request.mockResolvedValueOnce(json(200, { data: [PRIMARY] }));
    fireEvent.click(saveButton());
    await settle();
    await settle();
    expect(document.querySelector("form")).toBeNull();
    const gets = request.mock.calls.filter(
      ([, init]) => (init as RequestInit | undefined)?.method !== "POST",
    );
    expect(gets).toHaveLength(2);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe(TEXTS.contactExists);
    const list = document.querySelector("dl")!;
    expect(list.textContent).toContain(PRIMARY.address);
    expect(precedes(status, list)).toBe(true);
    expect(document.activeElement).toBe(heading());
    expect(region().textContent).not.toContain(API_MESSAGE);
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

  it("403 shows the step-up notice above the actions and keeps every value", async () => {
    const { requestProfileWrite } = await submitWith(() =>
      Promise.resolve(json(403, { message: API_MESSAGE })),
    );
    const notice = screen.getByText(TEXTS.stepUpText);
    expect(precedes(notice, actionsRow())).toBe(true);
    expectTypedValuesKept();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.stepUpButton }));
    expect(requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(requestProfileWrite).toHaveBeenCalledWith("/es/account");
    expect(region().textContent).not.toContain(API_MESSAGE);
  });

  it.each([
    ["422", () => Promise.resolve(json(422, { message: API_MESSAGE, errors: { city: ["fx-api-field-error"] } }))],
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
