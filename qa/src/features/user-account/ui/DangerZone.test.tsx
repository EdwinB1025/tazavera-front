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

describe("DangerZone — the confirmed request", () => {
  for (const [label, outcome] of [
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
