import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { configureClient } from "@/shared/api";
import { PasswordForm, type PasswordFormTexts } from "@/features/user-account";

/**
 * The Password section's content (specs "Password change" and "Writes and
 * the step-up"; design.md D2, D3, D6, D9 and D10). The write goes through the
 * authenticated client, configured here with a token; `fetch` is stubbed to
 * inspect it. Every text comes from the fixture below.
 */

const API = "https://api.tazavera.test";

const TEXTS: PasswordFormTexts = {
  currentPasswordLabel: "fx-current",
  newPasswordLabel: "fx-new",
  passwordConfirmationLabel: "fx-confirmation",
  passwordHelp: "fx-help",
  showPassword: "fx-show",
  hidePassword: "fx-hide",
  requiredError: "fx-required",
  passwordMismatchError: "fx-mismatch",
  forgotPasswordLink: "fx-forgot",
  save: "fx-save",
  passwordUpdated: "fx-updated",
  genericError: "fx-generic",
  stepUpText: "fx-step-up",
  stepUpButton: "fx-confirm-identity",
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_API_URL", API);
  configureClient({
    getTokens: () => ({
      access_token: "token-1",
      token_type: "Bearer",
      refresh_token: "refresh-1",
      expires_in: 3600,
    }),
    refresh: () => Promise.reject(new Error("no refresh")),
    onUnrecoverable: () => {},
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function renderForm() {
  const requestProfileWrite = vi.fn<(returnRoute: string) => void>();
  render(
    <>
      <h2 id="password-heading">heading</h2>
      <PasswordForm
        ulid="01ULID"
        locale="es"
        labelledBy="password-heading"
        texts={TEXTS}
        requestProfileWrite={requestProfileWrite}
      />
    </>,
  );
  return { requestProfileWrite };
}

function field(label: string): HTMLInputElement {
  return screen.getByLabelText(new RegExp(`^${label}`)) as HTMLInputElement;
}

function type(label: string, value: string) {
  fireEvent.change(field(label), { target: { value } });
}

function fillValid() {
  type(TEXTS.currentPasswordLabel, "Old12345");
  type(TEXTS.newPasswordLabel, "New12345");
  type(TEXTS.passwordConfirmationLabel, "New12345");
}

async function save() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: TEXTS.save }));
  });
}

function jsonResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function expectCleared() {
  for (const label of [
    TEXTS.currentPasswordLabel,
    TEXTS.newPasswordLabel,
    TEXTS.passwordConfirmationLabel,
  ]) {
    expect(field(label).value, label).toBe("");
  }
}

describe("PasswordForm — fields", () => {
  it("marks the three fields required, with the toggle names, the help and the autofill names", () => {
    renderForm();
    for (const label of [
      TEXTS.currentPasswordLabel,
      TEXTS.newPasswordLabel,
      TEXTS.passwordConfirmationLabel,
    ]) {
      expect(field(label).required, label).toBe(true);
    }
    expect(field(TEXTS.currentPasswordLabel).autocomplete).toBe("current-password");
    expect(field(TEXTS.newPasswordLabel).autocomplete).toBe("new-password");
    expect(field(TEXTS.passwordConfirmationLabel).autocomplete).toBe("new-password");
    expect(screen.getAllByRole("button", { name: TEXTS.showPassword })).toHaveLength(3);
    expect(screen.getByText(TEXTS.passwordHelp)).toBeTruthy();
    const form = document.querySelector("form")!;
    expect(form.getAttribute("aria-labelledby")).toBe("password-heading");
    expect(form.noValidate).toBe(true);
  });

  it("renders the forgot-password line as a same-tab external link to {API}/forgot-password, sending no request", () => {
    renderForm();
    const link = screen.getByRole("link", { name: TEXTS.forgotPasswordLink });
    expect(link.getAttribute("href")).toBe(`${API}/forgot-password`);
    expect(link.getAttribute("target")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("PasswordForm — client checks", () => {
  it("an empty field shows requiredError, is invalid, the first failing field takes focus and nothing is sent", async () => {
    renderForm();
    type(TEXTS.passwordConfirmationLabel, "New12345");
    await save();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getAllByText(TEXTS.requiredError)).toHaveLength(2);
    expect(field(TEXTS.currentPasswordLabel).getAttribute("aria-invalid")).toBe("true");
    expect(field(TEXTS.newPasswordLabel).getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field(TEXTS.currentPasswordLabel));
  });

  it("a confirmation differing from the new password shows passwordMismatchError on the confirmation and nothing is sent", async () => {
    renderForm();
    fillValid();
    type(TEXTS.passwordConfirmationLabel, "Other123");
    await save();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(TEXTS.passwordMismatchError)).toBeTruthy();
    expect(
      field(TEXTS.passwordConfirmationLabel).getAttribute("aria-invalid"),
    ).toBe("true");
    expect(document.activeElement).toBe(field(TEXTS.passwordConfirmationLabel));
  });
});

describe("PasswordForm — the write", () => {
  it("sends exactly PUT /users/{ulid}/password with currentPassword, password and passwordConfirmation and the token", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200));
    renderForm();
    fillValid();
    await save();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(`${API}/users/01ULID/password`);
    expect(init?.method).toBe("PUT");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer token-1");
    expect(JSON.parse(String(init?.body))).toEqual({
      currentPassword: "Old12345",
      password: "New12345",
      passwordConfirmation: "New12345",
    });
  });

  it("a 200 clears the three fields and shows passwordUpdated as a status", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { message: "api-message" }));
    renderForm();
    fillValid();
    await save();
    expectCleared();
    expect(screen.getByRole("status").textContent).toBe(TEXTS.passwordUpdated);
    expect(screen.queryByText("api-message")).toBeNull();
  });

  for (const [label, outcome] of [
    ["a 422", () => fetchMock.mockResolvedValue(jsonResponse(422, { message: "api-message" }))],
    ["a network failure", () => fetchMock.mockRejectedValue(new TypeError("offline"))],
    ["a 5xx", () => fetchMock.mockResolvedValue(jsonResponse(500))],
  ] as const) {
    it(`${label} shows genericError above the actions and clears the three fields`, async () => {
      outcome();
      renderForm();
      fillValid();
      await save();
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toBe(TEXTS.genericError);
      const button = screen.getByRole("button", { name: TEXTS.save });
      expect(
        alert.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expectCleared();
      expect(screen.queryByText("api-message")).toBeNull();
    });
  }

  it("a 403 shows the step-up notice above the actions, whose button requests the write scope for /{locale}/account inside the click", async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { message: "api-message" }));
    const { requestProfileWrite } = renderForm();
    fillValid();
    await save();
    const notice = screen.getByRole("alert");
    expect(notice.textContent).toBe(TEXTS.stepUpText);
    const button = screen.getByRole("button", { name: TEXTS.save });
    expect(
      notice.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.stepUpButton }));
    expect(requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(requestProfileWrite).toHaveBeenCalledWith("/es/account");
  });

  it("while pending the save carries loading", async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => {}));
    renderForm();
    fillValid();
    await save();
    expect(
      screen.getByRole("button", { name: TEXTS.save }).getAttribute("aria-busy"),
    ).toBe("true");
  });
});

describe("PasswordForm — texts", () => {
  it("renders only texts from the props fixture", () => {
    renderForm();
    const allowed = new Set([...Object.values(TEXTS), "heading"]);
    const rendered = [...document.querySelectorAll("label, p, button, a, h2")]
      .map((node) => (node.textContent ?? "").replace("*", "").trim())
      .filter((text) => text !== "");
    for (const text of rendered) {
      expect(allowed.has(text), text).toBe(true);
    }
  });
});
