import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { AccountClient, type AccountClientTexts } from "./AccountClient";

/**
 * The account page's client region (design.md D1, D4, D6 and D10; specs
 * "Account page and its session gate" and "Security section"). It is the
 * injection seam: the session comes from `useSession()` and the actions from
 * `@/features/auth`, both mocked here.
 */

const auth = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn<(returnRoute?: string) => void>(),
  signOut: vi.fn<() => void>(),
  requestProfileWrite: vi.fn<(returnRoute: string) => void>(),
  refreshProfile: vi.fn<() => Promise<void>>(),
}));

vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
  signIn: auth.signIn,
  signOut: auth.signOut,
  requestProfileWrite: auth.requestProfileWrite,
  refreshProfile: auth.refreshProfile,
}));

const API = "https://api.tazavera.test";
const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  auth.session = { state: "loading" };
  auth.signIn.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_API_URL", API);
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
  profileHeading: "fx-profile",
  passwordHeading: "fx-password",
  securityHeading: "fx-security",
  securityDescription: "fx-security-description",
  securityLink: "fx-security-link",
  dangerZoneHeading: "fx-danger",
  contactHeading: "fx-contact",
  contactDescription: "fx-contact-description",
  contactEmptyText: "fx-contact-empty",
  contactAddButton: "fx-contact-add",
  contactLoadError: "fx-contact-load-error",
  retry: "fx-retry",
  contactAddressLabel: "fx-address",
  contactPostalCodeLabel: "fx-postal-code",
  contactCityLabel: "fx-city",
  contactCountryLabel: "fx-country",
  contactPhoneLabel: "fx-phone",
  contactEmailLabel: "fx-email",
  contactWebLabel: "fx-web",
  contactSocialLabel: "fx-social",
} as AccountClientTexts;

const USER = {
  ulid: "u1",
  name: "Ana",
  surname: "López",
  email: "ana@example.com",
  role: "specialist" as const,
};

function renderClient() {
  return render(<AccountClient locale="es" texts={TEXTS} />);
}

describe("AccountClient — the session gate", () => {
  it("while loading shows the loading status in place of the sections", () => {
    renderClient();
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(screen.queryAllByRole("region")).toHaveLength(0);
  });

  it("while anonymous shows the signed-out text and a Sign in that calls signIn once inside the click", () => {
    auth.session = { state: "anonymous" };
    renderClient();
    expect(screen.getByText(TEXTS.signedOutText)).toBeTruthy();
    expect(screen.queryAllByRole("region")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(auth.signIn).toHaveBeenCalledTimes(1);
  });

  it("while authenticated shows Profile, Contact details, Password, Security and Danger zone in order, each named by its heading", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    const names = screen
      .getAllByRole("region")
      .map((region) => region.getAttribute("aria-labelledby"))
      .map((id) => document.getElementById(id!)?.textContent);
    expect(names).toEqual([
      TEXTS.profileHeading,
      TEXTS.contactHeading,
      TEXTS.passwordHeading,
      TEXTS.securityHeading,
      TEXTS.dangerZoneHeading,
    ]);
  });

  it("shows the signed-out state when the session turns anonymous while the page is open", () => {
    auth.session = { state: "authenticated", user: USER };
    const { rerender } = renderClient();
    expect(screen.getAllByRole("region")).toHaveLength(5);
    auth.session = { state: "anonymous" };
    rerender(<AccountClient locale="es" texts={TEXTS} />);
    expect(screen.queryAllByRole("region")).toHaveLength(0);
    expect(screen.getByText(TEXTS.signedOutText)).toBeTruthy();
  });
});

describe("AccountClient — sections group", () => {
  it("places the five sections as the children of one flex column 1rem apart", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    const regions = screen.getAllByRole("region");
    const group = regions[0].parentElement!;
    expect(Array.from(group.children)).toEqual(regions);
    expect(group.classList.contains("flex")).toBe(true);
    expect(group.classList.contains("flex-col")).toBe(true);
    expect(group.classList.contains("gap-4")).toBe(true);
  });
});

describe("AccountClient — Security section", () => {
  it("shows its description and an external same-tab link to {API}/user/security, sending no request", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    const region = screen.getByRole("region", { name: TEXTS.securityHeading });
    expect(region.textContent).toContain(TEXTS.securityDescription);
    const link = screen.getByRole("link", { name: TEXTS.securityLink });
    expect(link.getAttribute("href")).toBe(`${API}/user/security`);
    expect(link.getAttribute("target")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
