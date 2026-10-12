import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { AccountClient, type AccountClientTexts } from "./AccountClient";

/**
 * The account page's client region (design.md D1, D4, D6 and D10; specs
 * "Account page and its session gate" and "Security section"). It is the
 * injection seam: the session comes from `useSession()` and the actions from
 * `@/features/auth`, both mocked here.
 */

type StepUpOutcome = "granted" | "cancelled" | "failed" | "other-account";

const auth = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn<(returnRoute?: string) => void>(),
  signOut: vi.fn<() => void>(),
  requestProfileWrite: vi.fn<(returnRoute: string) => Promise<StepUpOutcome>>(),
  refreshProfile: vi.fn<() => Promise<void>>(),
  endProfileWrite: vi.fn<() => void>(),
}));

vi.mock("@/features/auth", async () => {
  const { useEffect } = await import("react");
  return {
    useSession: () => auth.session,
    signIn: auth.signIn,
    signOut: auth.signOut,
    requestProfileWrite: auth.requestProfileWrite,
    refreshProfile: auth.refreshProfile,
    endProfileWrite: auth.endProfileWrite,
    // A stand-in for the write-scope hook over the mocked endProfileWrite: it
    // ends the scope when inactive and when an active consumer unmounts.
    useProfileWriteScope: (active: boolean) => {
      useEffect(() => {
        if (!active) {
          auth.endProfileWrite();
          return;
        }
        return () => auth.endProfileWrite();
      }, [active]);
    },
  };
});

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
const APP = "https://tazavera.test";
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
  vi.stubEnv("NEXT_PUBLIC_APP_URL", APP);
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
  stepUpOtherAccount: "fx-step-up-other-account",
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
  it("Edit profile starts the identity check for the edit-mode route and opens it", async () => {
    auth.session = { state: "authenticated", user: USER };
    auth.requestProfileWrite.mockResolvedValue("granted");
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.editProfileHeading }));
    expect(auth.requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(auth.requestProfileWrite).toHaveBeenCalledWith("/es/account?edit=1");
    await waitFor(() => {
      expect(nav.replace).toHaveBeenCalledWith("/es/account?edit=1", { scroll: false });
    });
  });

  it("stays in read mode while the identity check is pending (spec: Edit mode waits for the identity check)", () => {
    auth.session = { state: "authenticated", user: USER };
    auth.requestProfileWrite.mockReturnValue(new Promise(() => {}));
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.editProfileHeading }));
    expect(nav.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("region", { name: TEXTS.profileHeading })).toBeTruthy();
  });

  it("stays in read mode with no message when the identity check popup is closed (spec: The identity check popup is closed)", async () => {
    auth.session = { state: "authenticated", user: USER };
    const outcome = Promise.resolve<StepUpOutcome>("cancelled");
    auth.requestProfileWrite.mockReturnValue(outcome);
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.editProfileHeading }));
    await outcome;
    expect(nav.replace).not.toHaveBeenCalled();
    expect(screen.queryByText(TEXTS.stepUpOtherAccount)).toBeNull();
  });

  it("stays in read mode and shows one status message when another account completes the identity check (spec: The identity check is completed by another account)", async () => {
    auth.session = { state: "authenticated", user: USER };
    auth.requestProfileWrite.mockResolvedValue("other-account");
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.editProfileHeading }));
    const message = await screen.findByText(TEXTS.stepUpOtherAccount);
    expect(message.getAttribute("role")).toBe("status");
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("leaving edit mode for read mode ends the write permission (spec: The action ends)", () => {
    auth.session = { state: "authenticated", user: USER };
    nav.query = "edit=1";
    const { rerender } = renderClient();
    auth.endProfileWrite.mockClear();
    nav.query = "";
    rerender(<AccountClient locale="es" texts={TEXTS} />);
    expect(auth.endProfileWrite).toHaveBeenCalled();
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
  it("Change password starts the identity check for the password view and opens it once granted (spec: The password route waits for the identity check)", async () => {
    auth.session = { state: "authenticated", user: USER };
    auth.requestProfileWrite.mockResolvedValue("granted");
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.changePassword }));
    expect(auth.requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(auth.requestProfileWrite).toHaveBeenCalledWith("/es/account/password");
    expect(nav.push).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(nav.push).toHaveBeenCalledWith("/es/account/password");
    });
  });

  it("shows its description and external same-tab links to {APP}/user/security for two-factor and passkeys, sending no request", () => {
    auth.session = { state: "authenticated", user: USER };
    renderClient();
    const region = screen.getByRole("region", { name: TEXTS.securityHeading });
    expect(region.textContent).toContain(TEXTS.securityDescription);
    for (const name of [TEXTS.twoFactor, TEXTS.passkeys]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("href")).toBe(`${APP}/user/security`);
      expect(link.getAttribute("target")).toBeNull();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("while the email is unverified lists a same-tab Verify email link to {APP}/email/verify before two-factor", () => {
    auth.session = { state: "authenticated", user: { ...USER, emailVerifiedAt: null } };
    renderClient();
    const link = screen.getByRole("link", { name: TEXTS.verifyEmail });
    expect(link.getAttribute("href")).toBe(`${APP}/email/verify`);
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

describe("AccountClient — Security section popup", () => {
  const ENTRIES = [
    [TEXTS.verifyEmail, `${APP}/email/verify`],
    [TEXTS.twoFactor, `${APP}/user/security`],
    [TEXTS.passkeys, `${APP}/user/security`],
  ] as const;

  function renderUnverified() {
    auth.session = { state: "authenticated", user: { ...USER, emailVerifiedAt: null } };
    renderClient();
  }

  it("a plain click on each API entry opens it in a popup window and the tab does not navigate", () => {
    const open = vi.fn().mockReturnValue({ closed: false });
    vi.stubGlobal("open", open);
    renderUnverified();
    for (const [name, url] of ENTRIES) {
      open.mockClear();
      const notPrevented = fireEvent.click(screen.getByRole("link", { name }));
      expect(notPrevented).toBe(false);
      expect(open).toHaveBeenCalledWith(url, "tazavera-security", "popup");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("when the popup is blocked opens the entry in a new tab and the tab does not navigate", () => {
    const open = vi.fn().mockReturnValue(null);
    vi.stubGlobal("open", open);
    renderUnverified();
    const notPrevented = fireEvent.click(screen.getByRole("link", { name: TEXTS.verifyEmail }));
    expect(notPrevented).toBe(false);
    expect(open).toHaveBeenLastCalledWith(`${APP}/email/verify`, "_blank", "noopener");
  });

  it("reloads the profile once the popup window closes", () => {
    vi.useFakeTimers();
    try {
      const popup = { closed: false };
      vi.stubGlobal("open", vi.fn().mockReturnValue(popup));
      auth.refreshProfile.mockReset().mockResolvedValue(undefined);
      renderUnverified();
      fireEvent.click(screen.getByRole("link", { name: TEXTS.verifyEmail }));
      vi.advanceTimersByTime(1000);
      expect(auth.refreshProfile).not.toHaveBeenCalled();
      popup.closed = true;
      vi.advanceTimersByTime(1000);
      expect(auth.refreshProfile).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
