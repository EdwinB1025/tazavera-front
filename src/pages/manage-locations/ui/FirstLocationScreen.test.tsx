import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { configureClient, type Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { FirstLocationScreen } from "@/pages/manage-locations";

/**
 * The first location step (require-first-location-on-registration D3–D6;
 * offering-management "First location step", "First location step session
 * gate", "First location step form"). The session and sign in come from
 * `@/features/auth` and the router from `next/navigation`, both mocked
 * (test infrastructure); `fetch` is stubbed so the geocoding lookup and the
 * create request can be answered, as `ManageLocationsClient.test.tsx` does.
 */

const auth = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn<(returnRoute?: string) => void>(),
}));

vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
  signIn: auth.signIn,
}));

const nav = vi.hoisted(() => ({
  push: vi.fn<(href: string) => void>(),
  replace: vi.fn<(href: string) => void>(),
  notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  notFound: nav.notFound,
}));

const API = "https://api.tazavera.test";
const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

const TEXTS = getMessages("location-management", "es");
const COFFEESHOP = { ulid: "01COFFEESHOP", role: "coffeeshop" as const };
const SPECIALIST = { ulid: "01SPECIALIST", role: "specialist" as const };

beforeEach(() => {
  auth.session = { state: "loading" };
  auth.signIn.mockReset();
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.notFound.mockReset();
  fetchMock.mockReset();
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

function renderScreen() {
  return render(<FirstLocationScreen locale="es" />);
}

function heading(): HTMLElement {
  return screen.getByRole("heading", { level: 1, name: TEXTS.firstLocationTitle });
}

function type(name: string, value: string): void {
  const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

describe("FirstLocationScreen — the step (spec: First location step)", () => {
  it("opens for a coffee shop with its heading block, the form with Save and Later, focus on the heading and no read", () => {
    auth.session = { state: "authenticated", user: COFFEESHOP };
    renderScreen();
    expect(heading()).toBeTruthy();
    expect(screen.getByText(TEXTS.firstLocationIntro)).toBeTruthy();
    expect(screen.getByRole("form", { name: TEXTS.newLocationHeading })).toBeTruthy();
    expect(screen.getByRole("button", { name: TEXTS.save })).toBeTruthy();
    expect(screen.getByRole("button", { name: TEXTS.firstLocationLater })).toBeTruthy();
    expect(document.activeElement).toBe(heading());
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("FirstLocationScreen — the gate (spec: First location step session gate)", () => {
  it("while loading shows the heading and the loading status, and no form, signed-out text or 404", () => {
    renderScreen();
    expect(heading()).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(TEXTS.loading);
    expect(screen.queryByRole("form")).toBeNull();
    expect(screen.queryByText(TEXTS.signedOutText)).toBeNull();
    expect(nav.notFound).not.toHaveBeenCalled();
  });

  it("while anonymous shows the heading, the signed-out text and Sign in, no form, and does not redirect", () => {
    auth.session = { state: "anonymous" };
    renderScreen();
    expect(heading()).toBeTruthy();
    expect(screen.getByText(TEXTS.signedOutText)).toBeTruthy();
    expect(screen.getByRole("button", { name: TEXTS.signIn })).toBeTruthy();
    expect(screen.queryByRole("form")).toBeNull();
    expect(nav.push).not.toHaveBeenCalled();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("Sign in calls signIn once with the step's route", () => {
    auth.session = { state: "anonymous" };
    renderScreen();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(auth.signIn).toHaveBeenCalledTimes(1);
    expect(auth.signIn).toHaveBeenCalledWith("/es/manage/locations/first");
  });

  it("calls notFound for another role and sends no location request", () => {
    auth.session = { state: "authenticated", user: SPECIALIST };
    renderScreen();
    expect(nav.notFound).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("FirstLocationScreen — the form (spec: First location step form)", () => {
  it("on 201 replaces the route with /es/manage/locations and renders no creation status", async () => {
    auth.session = { state: "authenticated", user: COFFEESHOP };
    fetchMock.mockImplementation(async (input) =>
      String(input).startsWith(API)
        ? new Response(null, { status: 201 })
        : new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    renderScreen();
    type("name", "Tazavera Gràcia");
    type("address", "Carrer de Verdi 12");
    type("city", "Barcelona");
    fireEvent.click(screen.getByRole("button", { name: TEXTS.save }));
    await act(async () => {});
    expect(nav.replace).toHaveBeenCalledWith("/es/manage/locations");
    expect(screen.queryByText(TEXTS.locationCreated, { exact: false })).toBeNull();
  });

  it("Later pushes /es and sends nothing", () => {
    auth.session = { state: "authenticated", user: COFFEESHOP };
    renderScreen();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.firstLocationLater }));
    expect(nav.push).toHaveBeenCalledWith("/es");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
