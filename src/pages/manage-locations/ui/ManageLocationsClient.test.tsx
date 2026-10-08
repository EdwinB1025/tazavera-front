import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { configureClient, type Session } from "@/shared/api";
import {
  ManageLocationsClient,
  type ManageLocationsClientTexts,
} from "./ManageLocationsClient";

/**
 * The locations page's client region (design.md D2; spec "Access to the
 * locations page"). It is the injection seam: the session comes from
 * `useSession()` and the actions from `@/features/auth`, both mocked here, as
 * `AccountClient.test.tsx` does; `notFound()` is a spy.
 */

const auth = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn<(returnRoute?: string) => void>(),
}));

vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
  signIn: auth.signIn,
}));

const { notFound } = vi.hoisted(() => ({ notFound: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound }));

const API = "https://api.tazavera.test";
const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  auth.session = { state: "loading" };
  auth.signIn.mockReset();
  notFound.mockReset();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_API_URL", API);
  // The token client needs its seam to send; `@/features/auth` fills it in the app.
  configureClient({
    getTokens: () => ({
      access_token: "fx-access",
      token_type: "Bearer",
      refresh_token: "fx-refresh",
      expires_in: 3600,
    }),
    refresh: async () => {},
    onUnrecoverable: () => {},
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const TEXTS = {
  loading: "fx-loading",
  signedOutText: "fx-signed-out",
  signIn: "fx-sign-in",
  locationsEmptyText: "fx-empty",
  addLocation: "fx-add",
} as ManageLocationsClientTexts;

const COFFEESHOP = { ulid: "01COFFEESHOP", role: "coffeeshop" as const };
const SPECIALIST = { ulid: "01SPECIALIST", role: "specialist" as const };

function renderClient() {
  return render(<ManageLocationsClient locale="es" headingId="h" texts={TEXTS} />);
}

describe("ManageLocationsClient — the gate (design.md D2)", () => {
  it("while loading shows the loading status and sends no list request", () => {
    renderClient();
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("while anonymous shows the signed-out text and a Sign in that calls signIn once inside the click", () => {
    auth.session = { state: "anonymous" };
    renderClient();
    expect(screen.getByText(TEXTS.signedOutText)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(auth.signIn).toHaveBeenCalledTimes(1);
    expect(auth.signIn).toHaveBeenCalledWith("/es/manage/locations");
  });

  it("calls notFound for a specialist and sends no location request", () => {
    auth.session = { state: "authenticated", user: SPECIALIST };
    renderClient();
    expect(notFound).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the signed-out state when the session turns anonymous while the page is open", async () => {
    auth.session = { state: "authenticated", user: COFFEESHOP };
    const { rerender } = renderClient();
    await act(async () => {});
    auth.session = { state: "anonymous" };
    rerender(<ManageLocationsClient locale="es" headingId="h" texts={TEXTS} />);
    expect(screen.queryByText(TEXTS.locationsEmptyText)).toBeNull();
    expect(screen.getByText(TEXTS.signedOutText)).toBeTruthy();
  });
});
