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

const nav = vi.hoisted(() => ({
  query: "",
  push: vi.fn<(href: string) => void>(),
  replace: vi.fn<(href: string, options?: { scroll?: boolean }) => void>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  useSearchParams: () => new URLSearchParams(nav.query),
}));

const API = "https://api.tazavera.test";
const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  auth.session = { state: "loading" };
  auth.signIn.mockReset();
  auth.requestProfileWrite.mockReset();
  nav.query = "";
  nav.push.mockReset();
  nav.replace.mockReset();
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
  editProfileHeading: "fx-edit-profile",
  securityHeading: "fx-security",
  securityDescription: "fx-security-description",
  changePassword: "fx-change-password",
  twoFactor: "fx-two-factor",
  passkeys: "fx-passkeys",
  verifyEmail: "fx-verify-email",
  emailVerifiedStatus: "fx-email-verified",
  done: "fx-done",
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

function regionNames() {
  return screen
    .getAllByRole("region")
    .map((region) => region.getAttribute("aria-labelledby"))
    .map((id) => document.getElementById(id!)?.textContent);
}

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

  it("in read mode shows Profile, Contact details and Security in order, each named by its heading", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    expect(regionNames()).toEqual([
      TEXTS.profileHeading,
      TEXTS.contactHeading,
      TEXTS.securityHeading,
    ]);
  });

  it("in edit mode shows Edit profile, Contact details, Security and Danger zone in order", () => {
    auth.session = { state: "authenticated", user: USER };
    nav.query = "edit=1";
    renderClient();
    expect(regionNames()).toEqual([
      TEXTS.editProfileHeading,
      TEXTS.contactHeading,
      TEXTS.securityHeading,
      TEXTS.dangerZoneHeading,
    ]);
  });

  it("shows the signed-out state when the session turns anonymous while the page is open", () => {
    auth.session = { state: "authenticated", user: USER };
    const { rerender } = renderClient();
    expect(screen.getAllByRole("region")).toHaveLength(3);
    auth.session = { state: "anonymous" };
    rerender(<AccountClient locale="es" texts={TEXTS} />);
    expect(screen.queryAllByRole("region")).toHaveLength(0);
    expect(screen.getByText(TEXTS.signedOutText)).toBeTruthy();
  });

  it("while loading and while anonymous shows a section card with a subtle border, no accent edge and no header band", () => {
    for (const session of [
      { state: "loading" },
      { state: "anonymous" },
    ] satisfies Session[]) {
      auth.session = session;
      const { container } = renderClient();
      const card = container.firstElementChild!;
      expect(card.classList.contains("border")).toBe(true);
      expect(card.classList.contains("border-border-subtle")).toBe(true);
      expect(card.classList.contains("border-l-4")).toBe(false);
      expect(container.querySelector(".bg-surface-section")).toBeNull();
      cleanup();
    }
  });
});

describe("AccountClient — sections group", () => {
  it("places the read-mode sections as the children of one flex column 1rem apart", () => {
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

describe("AccountClient — edit mode", () => {
  it("Edit profile starts the identity check for the edit-mode route and opens it", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.editProfileHeading }));
    expect(auth.requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(auth.requestProfileWrite).toHaveBeenCalledWith("/es/account?edit=1");
    expect(nav.replace).toHaveBeenCalledWith("/es/account?edit=1", { scroll: false });
  });

  it("Done returns to read mode and sends nothing", () => {
    auth.session = { state: "authenticated", user: USER };
    nav.query = "edit=1";
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.done }));
    expect(nav.replace).toHaveBeenCalledWith("/es/account", { scroll: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("AccountClient — Security section", () => {
  it("Change password starts the identity check for the password view and opens it", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.changePassword }));
    expect(auth.requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(auth.requestProfileWrite).toHaveBeenCalledWith("/es/account/password");
    expect(nav.push).toHaveBeenCalledWith("/es/account/password");
  });

  it("shows its description and external same-tab links to {API}/user/security for two-factor and passkeys, sending no request", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    const region = screen.getByRole("region", { name: TEXTS.securityHeading });
    expect(region.textContent).toContain(TEXTS.securityDescription);
    for (const name of [TEXTS.twoFactor, TEXTS.passkeys]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("href")).toBe(`${API}/user/security`);
      expect(link.getAttribute("target")).toBeNull();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("while the email is unverified lists a same-tab Verify email link to {API}/email/verify before two-factor", () => {
    auth.session = { state: "authenticated", user: { ...USER, emailVerifiedAt: null } };
    renderClient();
    const link = screen.getByRole("link", { name: TEXTS.verifyEmail });
    expect(link.getAttribute("href")).toBe(`${API}/email/verify`);
    expect(link.getAttribute("target")).toBeNull();
    const items = link.closest("ul")!.querySelectorAll("li");
    expect(items[0].contains(link)).toBe(true);
    expect(items[1].textContent).toBe(TEXTS.twoFactor);
  });

  it("when the email is verified lists the text Email verified first and no Verify email link", () => {
    auth.session = {
      state: "authenticated",
      user: { ...USER, emailVerifiedAt: "2026-10-09T10:00:00Z" },
    };
    renderClient();
    const item = screen.getByRole("link", { name: TEXTS.twoFactor }).closest("ul")!
      .firstElementChild!;
    expect(item.textContent).toBe(TEXTS.emailVerifiedStatus);
    expect(screen.queryByRole("link", { name: TEXTS.verifyEmail })).toBeNull();
  });
});
