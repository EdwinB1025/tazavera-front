import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { configureClient, type SessionUser } from "@/shared/api";
import { ProfileForm, type ProfileFormTexts } from "@/features/user-account";

/**
 * The Profile section's content (specs "Profile settings" and "Writes and
 * the step-up"; design.md D2, D3, D6, D9 and D10). The write goes through the
 * authenticated client, configured here with a token; `fetch` is stubbed to
 * inspect it. Every text comes from the fixture below.
 */

const API = "https://api.tazavera.test";

const TEXTS: ProfileFormTexts = {
  nameLabel: "fx-name",
  surnameLabel: "fx-surname",
  emailLabel: "fx-email",
  emailFormatError: "fx-email-format",
  save: "fx-save",
  profileUpdated: "fx-updated",
  genericError: "fx-generic",
  stepUpText: "fx-step-up",
  stepUpButton: "fx-confirm-identity",
};

const USER: SessionUser = {
  ulid: "01ULID",
  name: "Ana",
  surname: "López",
  email: "ana@example.com",
  role: "specialist",
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
  const refreshProfile = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const requestProfileWrite = vi.fn<(returnRoute: string) => void>();
  render(
    <>
      <h2 id="profile-heading">heading</h2>
      <ProfileForm
        user={USER}
        locale="es"
        labelledBy="profile-heading"
        texts={TEXTS}
        refreshProfile={refreshProfile}
        requestProfileWrite={requestProfileWrite}
      />
    </>,
  );
  return { refreshProfile, requestProfileWrite };
}

function field(label: string): HTMLInputElement {
  return screen.getByLabelText(new RegExp(`^${label}`)) as HTMLInputElement;
}

function type(label: string, value: string) {
  fireEvent.change(field(label), { target: { value } });
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

function sentBody(): unknown {
  return JSON.parse(String(fetchMock.mock.calls[0]![1]?.body));
}

describe("ProfileForm — view", () => {
  it("prefills the three fields from the session, with no required marker and their autofill names", () => {
    renderForm();
    expect(field(TEXTS.nameLabel).value).toBe("Ana");
    expect(field(TEXTS.surnameLabel).value).toBe("López");
    expect(field(TEXTS.emailLabel).value).toBe("ana@example.com");
    for (const label of [TEXTS.nameLabel, TEXTS.surnameLabel, TEXTS.emailLabel]) {
      expect(field(label).required, label).toBe(false);
    }
    expect(document.body.textContent).not.toContain("*");
    expect(field(TEXTS.nameLabel).autocomplete).toBe("given-name");
    expect(field(TEXTS.surnameLabel).autocomplete).toBe("family-name");
    expect(field(TEXTS.emailLabel).autocomplete).toBe("email");
  });
});

describe("ProfileForm — client checks", () => {
  it("an invalid email shows emailFormatError, is invalid, takes focus and nothing is sent", async () => {
    renderForm();
    type(TEXTS.emailLabel, "not-an-email");
    await save();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(TEXTS.emailFormatError)).toBeTruthy();
    expect(field(TEXTS.emailLabel).getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field(TEXTS.emailLabel));
  });

  it("an emptied field is sent with no client check blocking it, and its 422 shows genericError", async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { message: "api-message" }));
    renderForm();
    type(TEXTS.nameLabel, "");
    type(TEXTS.emailLabel, "");
    await save();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sentBody()).toEqual({ name: "", surname: "López", email: "" });
    expect(screen.getByRole("alert").textContent).toBe(TEXTS.genericError);
    expect(screen.queryByText("api-message")).toBeNull();
  });
});

describe("ProfileForm — the write", () => {
  it("sends exactly PUT /users/{ulid} with name, surname and email and the token", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200));
    renderForm();
    type(TEXTS.nameLabel, "Andrea");
    await save();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(`${API}/users/01ULID`);
    expect(init?.method).toBe("PUT");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer token-1");
    expect(sentBody()).toEqual({
      name: "Andrea",
      surname: "López",
      email: "ana@example.com",
    });
  });

  it("a 200 keeps the submitted values, shows profileUpdated with Check as a status and calls refreshProfile once", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { data: { ...USER, name: "From-PUT" }, message: "api-message" }),
    );
    const { refreshProfile } = renderForm();
    type(TEXTS.nameLabel, "Andrea");
    await save();
    expect(field(TEXTS.nameLabel).value).toBe("Andrea");
    const status = screen.getByRole("status");
    expect(status.textContent).toBe(TEXTS.profileUpdated);
    expect(status.querySelector("svg")?.getAttribute("class")).toContain("lucide-check");
    expect(refreshProfile).toHaveBeenCalledTimes(1);
    expect(refreshProfile).toHaveBeenCalledWith();
    expect(screen.queryByText("From-PUT")).toBeNull();
    expect(screen.queryByText("api-message")).toBeNull();
  });

  for (const [label, outcome] of [
    ["a 422", () => fetchMock.mockResolvedValue(jsonResponse(422))],
  ] as const) {
    it(`${label} shows genericError above the actions and keeps the values`, async () => {
      outcome();
      const { refreshProfile } = renderForm();
      type(TEXTS.surnameLabel, "Gómez");
      await save();
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toBe(TEXTS.genericError);
      const button = screen.getByRole("button", { name: TEXTS.save });
      expect(
        alert.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(field(TEXTS.surnameLabel).value).toBe("Gómez");
      expect(refreshProfile).not.toHaveBeenCalled();
    });
  }

  it("a 403 shows the step-up notice above the actions, whose button requests the write scope for /{locale}/account inside the click", async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { message: "api-message" }));
    const { requestProfileWrite, refreshProfile } = renderForm();
    type(TEXTS.nameLabel, "Andrea");
    await save();
    const notice = screen.getByRole("alert");
    expect(notice.textContent).toBe(TEXTS.stepUpText);
    const save_ = screen.getByRole("button", { name: TEXTS.save });
    expect(
      notice.compareDocumentPosition(save_) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(field(TEXTS.nameLabel).value).toBe("Andrea");
    fireEvent.click(screen.getByRole("button", { name: TEXTS.stepUpButton }));
    expect(requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(requestProfileWrite).toHaveBeenCalledWith("/es/account");
    expect(refreshProfile).not.toHaveBeenCalled();
    expect(screen.queryByText("api-message")).toBeNull();
  });
});
