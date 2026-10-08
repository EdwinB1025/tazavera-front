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
  roleLabel: "fx-role",
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

describe("ProfileForm — view", () => {
  it("labels the form by the section heading and turns off native validation", () => {
    renderForm();
    const form = document.querySelector("form")!;
    expect(form.getAttribute("aria-labelledby")).toBe("profile-heading");
    expect(form.noValidate).toBe(true);
  });
});

describe("ProfileForm — the write", () => {
  it("while pending the save carries loading", async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => {}));
    renderForm();
    await save();
    expect(
      screen.getByRole("button", { name: TEXTS.save }).getAttribute("aria-busy"),
    ).toBe("true");
  });

  for (const [label, outcome] of [
    ["a network failure", () => fetchMock.mockRejectedValue(new TypeError("offline"))],
    ["a 5xx", () => fetchMock.mockResolvedValue(jsonResponse(500))],
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
});

describe("ProfileForm — texts", () => {
  it("renders only texts from the props fixture and the session values", () => {
    renderForm();
    const allowed = new Set([...Object.values(TEXTS), "specialist", "heading"]);
    const rendered = [...document.querySelectorAll("label, p, button, dt, dd, h2")]
      .map((node) => (node.textContent ?? "").trim())
      .filter((text) => text !== "");
    for (const text of rendered) {
      expect(allowed.has(text), text).toBe(true);
    }
  });
});
