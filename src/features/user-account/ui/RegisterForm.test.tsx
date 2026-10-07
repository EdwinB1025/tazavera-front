import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { RegisterForm, type RegisterFormTexts } from "@/features/user-account";

/**
 * Registration form (specs "Registration routes", "Registration form" and
 * "Registration result"; design.md D2, D3 and D9). The request goes through
 * the public client, so `fetch` is stubbed and every call is inspected: the
 * path, the method, the body and the absence of an `Authorization` header.
 * Every text comes from the fixture below, whose values appear nowhere in the
 * source, so a rendered literal would show up as unknown text.
 */

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const API = "https://api.tazavera.test";

const TEXTS: RegisterFormTexts = {
  nameLabel: "fx-name",
  surnameLabel: "fx-surname",
  emailLabel: "fx-email",
  passwordLabel: "fx-password",
  passwordConfirmationLabel: "fx-confirmation",
  passwordHelp: "fx-password-help",
  showPassword: "fx-show",
  hidePassword: "fx-hide",
  requiredError: "fx-required",
  emailFormatError: "fx-email-format",
  passwordMismatchError: "fx-mismatch",
  registerSubmit: "fx-submit",
  genericError: "fx-generic",
  registerSuccessTitle: "fx-success-title",
  registerSuccessText: "fx-success-text",
  signIn: "fx-sign-in",
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_API_URL", API);
});

function renderForm(role: "specialist" | "coffeeshop" = "specialist") {
  const signIn = vi.fn<() => void>();
  render(
    <>
      <h1 id="register-title">title</h1>
      <RegisterForm
        role={role}
        labelledBy="register-title"
        texts={TEXTS}
        signIn={signIn}
      />
    </>,
  );
  return { signIn };
}

function field(label: string): HTMLInputElement {
  return screen.getByLabelText(new RegExp(`^${label}`)) as HTMLInputElement;
}

function type(label: string, value: string) {
  fireEvent.change(field(label), { target: { value } });
}

function fillValid() {
  type(TEXTS.nameLabel, "Ana");
  type(TEXTS.surnameLabel, "López");
  type(TEXTS.emailLabel, "ana@example.com");
  type(TEXTS.passwordLabel, "Secret123");
  type(TEXTS.passwordConfirmationLabel, "Secret123");
}

async function submit() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: TEXTS.registerSubmit }));
  });
}

function jsonResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("RegisterForm — the request", () => {
  for (const role of ["specialist", "coffeeshop"] as const) {
    it(`sends POST /register without credentials, in camelCase, with role "${role}"`, async () => {
      fetchMock.mockResolvedValue(jsonResponse(201));
      renderForm(role);
      fillValid();
      await submit();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0]!;
      expect(String(url)).toBe(`${API}/register`);
      expect(init?.method).toBe("POST");
      expect(new Headers(init?.headers).has("Authorization")).toBe(false);
      expect(JSON.parse(String(init?.body))).toEqual({
        name: "Ana",
        surname: "López",
        email: "ana@example.com",
        password: "Secret123",
        passwordConfirmation: "Secret123",
        role,
      });
    });
  }

  it("labels the form by the page heading and turns off native validation", () => {
    renderForm();
    const form = document.querySelector("form")!;
    expect(form.getAttribute("aria-labelledby")).toBe("register-title");
    expect(form.noValidate).toBe(true);
  });

  it("marks the five fields required and gives the password fields their toggle names and autofill names", () => {
    renderForm();
    for (const label of [
      TEXTS.nameLabel,
      TEXTS.surnameLabel,
      TEXTS.emailLabel,
      TEXTS.passwordLabel,
      TEXTS.passwordConfirmationLabel,
    ]) {
      expect(field(label).required, label).toBe(true);
    }
    expect(field(TEXTS.nameLabel).autocomplete).toBe("given-name");
    expect(field(TEXTS.surnameLabel).autocomplete).toBe("family-name");
    expect(field(TEXTS.emailLabel).autocomplete).toBe("email");
    expect(field(TEXTS.passwordLabel).autocomplete).toBe("new-password");
    expect(field(TEXTS.passwordConfirmationLabel).autocomplete).toBe(
      "new-password",
    );
    expect(screen.getAllByRole("button", { name: TEXTS.showPassword })).toHaveLength(2);
    expect(screen.getByText(TEXTS.passwordHelp)).toBeTruthy();
  });
});

describe("RegisterForm — client checks", () => {
  it("an empty required field shows requiredError, is invalid, takes focus and nothing is sent", async () => {
    renderForm();
    fillValid();
    type(TEXTS.surnameLabel, "");
    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(TEXTS.requiredError)).toBeTruthy();
    expect(field(TEXTS.surnameLabel).getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field(TEXTS.surnameLabel));
  });

  it("focuses the first failing field when several fail", async () => {
    renderForm();
    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getAllByText(TEXTS.requiredError)).toHaveLength(5);
    expect(document.activeElement).toBe(field(TEXTS.nameLabel));
  });

  it("an invalid email shows emailFormatError, is invalid, takes focus and nothing is sent", async () => {
    renderForm();
    fillValid();
    type(TEXTS.emailLabel, "not-an-email");
    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(TEXTS.emailFormatError)).toBeTruthy();
    expect(field(TEXTS.emailLabel).getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field(TEXTS.emailLabel));
  });

  it("a mismatched confirmation shows passwordMismatchError on the confirmation, takes focus and nothing is sent", async () => {
    renderForm();
    fillValid();
    type(TEXTS.passwordConfirmationLabel, "Other123");
    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(TEXTS.passwordMismatchError)).toBeTruthy();
    expect(
      field(TEXTS.passwordConfirmationLabel).getAttribute("aria-invalid"),
    ).toBe("true");
    expect(document.activeElement).toBe(field(TEXTS.passwordConfirmationLabel));
  });
});

describe("RegisterForm — pending and result", () => {
  it("while pending the submit carries loading and the fields stay editable", async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => {}));
    renderForm();
    fillValid();
    await submit();

    const button = screen.getByRole("button", { name: TEXTS.registerSubmit });
    expect(button.getAttribute("aria-busy")).toBe("true");
    for (const label of [TEXTS.nameLabel, TEXTS.emailLabel, TEXTS.passwordLabel]) {
      expect(field(label).disabled, label).toBe(false);
      expect(field(label).readOnly, label).toBe(false);
    }
  });

  it("a 201 replaces the form with the success panel and focuses its heading", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { message: "api-message" }));
    renderForm();
    fillValid();
    await submit();

    expect(document.querySelector("form")).toBeNull();
    const heading = screen.getByRole("heading", { name: TEXTS.registerSuccessTitle });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText(TEXTS.registerSuccessText)).toBeTruthy();
    expect(screen.queryByText("api-message")).toBeNull();
  });

  it("the success panel's Sign in calls the injected signIn once, inside the click", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201));
    const { signIn } = renderForm();
    fillValid();
    await submit();

    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  for (const [label, outcome] of [
    ["a 422", () => fetchMock.mockResolvedValue(jsonResponse(422, { message: "api-message" }))],
    ["a network failure", () => fetchMock.mockRejectedValue(new TypeError("offline"))],
  ] as const) {
    it(`${label} shows genericError as an alert above the actions, keeps the values and clears the passwords`, async () => {
      outcome();
      renderForm();
      fillValid();
      await submit();

      const alert = screen.getByRole("alert");
      expect(alert.textContent).toBe(TEXTS.genericError);
      const button = screen.getByRole("button", { name: TEXTS.registerSubmit });
      expect(
        alert.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(field(TEXTS.nameLabel).value).toBe("Ana");
      expect(field(TEXTS.surnameLabel).value).toBe("López");
      expect(field(TEXTS.emailLabel).value).toBe("ana@example.com");
      expect(field(TEXTS.passwordLabel).value).toBe("");
      expect(field(TEXTS.passwordConfirmationLabel).value).toBe("");
      expect(screen.queryByText("api-message")).toBeNull();
    });
  }
});

describe("RegisterForm — texts", () => {
  it("renders only texts from the props fixture", () => {
    renderForm();
    const fixture = new Set(Object.values(TEXTS));
    const rendered = [...document.querySelectorAll("label, p, button")]
      .map((node) => (node.textContent ?? "").replace("*", "").trim())
      .filter((text) => text !== "" && text !== "title");
    for (const text of rendered) {
      expect(fixture.has(text), text).toBe(true);
    }
  });
});
