import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
  within,
} from "@testing-library/react";
import { configureClient } from "@/shared/api";
import { DangerZone, type DangerZoneTexts } from "@/features/user-account";

/**
 * The Danger zone (specs "Account deactivation and deletion" and "Writes and
 * the step-up"; design.md D3, D6, D7 and D9). Each block's `action-2`
 * trigger opens its `ConfirmDialog`; nothing is sent before the confirm. The
 * writes go through the authenticated client, configured here with a token,
 * and `fetch` is stubbed to inspect them.
 */

const API = "https://api.tazavera.test";

const TEXTS: DangerZoneTexts = {
  deactivateHeading: "fx-deactivate-heading",
  deactivateText: "fx-deactivate-text",
  deleteHeading: "fx-delete-heading",
  deleteText: "fx-delete-text",
  deactivateConfirmTitle: "fx-deactivate-title",
  deleteConfirmTitle: "fx-delete-title",
  confirmDeactivate: "fx-confirm-deactivate",
  confirmDelete: "fx-confirm-delete",
  cancel: "fx-cancel",
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

function renderZone() {
  const signOut = vi.fn<() => void>();
  const requestProfileWrite = vi.fn<(returnRoute: string) => void>();
  render(
    <DangerZone
      ulid="01ULID"
      locale="es"
      texts={TEXTS}
      signOut={signOut}
      requestProfileWrite={requestProfileWrite}
    />,
  );
  return { signOut, requestProfileWrite };
}

function open(trigger: string): HTMLElement {
  fireEvent.click(screen.getByRole("button", { name: trigger }));
  return screen.getByRole("alertdialog");
}

async function confirm(dialog: HTMLElement, label: string) {
  await act(async () => {
    fireEvent.click(within(dialog).getByRole("button", { name: label }));
  });
}

describe("DangerZone — blocks and triggers", () => {
  it("renders both blocks with their headings, texts and action-2 triggers", () => {
    renderZone();
    expect(
      screen.getByRole("heading", { level: 3, name: TEXTS.deactivateHeading }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 3, name: TEXTS.deleteHeading }),
    ).toBeTruthy();
    expect(screen.getByText(TEXTS.deactivateText)).toBeTruthy();
    expect(screen.getByText(TEXTS.deleteText)).toBeTruthy();
    for (const label of [TEXTS.confirmDeactivate, TEXTS.confirmDelete]) {
      const trigger = screen.getByRole("button", { name: label });
      expect(trigger.className, label).toContain("bg-action-2-bg");
      expect(trigger.className, label).toContain("h-10");
    }
  });

  for (const [trigger, title, description] of [
    [TEXTS.confirmDeactivate, TEXTS.deactivateConfirmTitle, TEXTS.deactivateText],
    [TEXTS.confirmDelete, TEXTS.deleteConfirmTitle, TEXTS.deleteText],
  ] as const) {
    it(`the ${trigger} trigger opens its dialog with its title and the block text as description, sending nothing`, () => {
      renderZone();
      const dialog = open(trigger);
      expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
      expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe(title);
      expect(document.getElementById(dialog.getAttribute("aria-describedby")!)?.textContent).toBe(description);
      expect(within(dialog).getByRole("button", { name: TEXTS.cancel })).toBeTruthy();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  }
});

describe("DangerZone — the confirmed request", () => {
  it("confirming deactivation sends exactly DELETE /users/{ulid} with the token", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    renderZone();
    await confirm(open(TEXTS.confirmDeactivate), TEXTS.confirmDeactivate);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(`${API}/users/01ULID`);
    expect(init?.method).toBe("DELETE");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer token-1");
  });

  it("confirming deletion sends exactly DELETE /users/{ulid}/force", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    renderZone();
    await confirm(open(TEXTS.confirmDelete), TEXTS.confirmDelete);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(`${API}/users/01ULID/force`);
    expect(init?.method).toBe("DELETE");
  });

  it("while pending the confirm carries loading, the cancel is disabled and Escape does not close", async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => {}));
    renderZone();
    const dialog = open(TEXTS.confirmDeactivate);
    await confirm(dialog, TEXTS.confirmDeactivate);
    expect(
      within(dialog)
        .getByRole("button", { name: TEXTS.confirmDeactivate })
        .getAttribute("aria-busy"),
    ).toBe("true");
    expect(
      (within(dialog).getByRole("button", { name: TEXTS.cancel }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("a 200 calls signOut once and renders no message", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "api-message" }), { status: 200 }),
    );
    const { signOut } = renderZone();
    await confirm(open(TEXTS.confirmDelete), TEXTS.confirmDelete);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("api-message")).toBeNull();
    expect(screen.queryByText(TEXTS.genericError)).toBeNull();
  });

  it("a 403 keeps the dialog open with the step-up notice, whose button requests the write scope for /{locale}/account inside the click", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "api-message" }), { status: 403 }),
    );
    const { signOut, requestProfileWrite } = renderZone();
    const dialog = open(TEXTS.confirmDeactivate);
    await confirm(dialog, TEXTS.confirmDeactivate);
    expect(screen.getByRole("alertdialog")).toBe(dialog);
    expect(signOut).not.toHaveBeenCalled();
    expect(within(dialog).getByText(TEXTS.stepUpText)).toBeTruthy();
    expect(screen.queryByText("api-message")).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: TEXTS.stepUpButton }));
    expect(requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(requestProfileWrite).toHaveBeenCalledWith("/es/account");
  });

  for (const [label, outcome] of [
    ["a network failure", () => fetchMock.mockRejectedValueOnce(new TypeError("offline"))],
    ["a 5xx", () => fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }))],
  ] as const) {
    it(`${label} shows genericError in the dialog and allows retry`, async () => {
      outcome();
      const { signOut } = renderZone();
      const dialog = open(TEXTS.confirmDelete);
      await confirm(dialog, TEXTS.confirmDelete);
      expect(within(dialog).getByRole("alert").textContent).toBe(TEXTS.genericError);
      expect(signOut).not.toHaveBeenCalled();

      fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
      await confirm(dialog, TEXTS.confirmDelete);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(signOut).toHaveBeenCalledTimes(1);
    });
  }
});
