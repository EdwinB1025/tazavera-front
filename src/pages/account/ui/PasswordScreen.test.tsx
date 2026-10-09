import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { resetNavigationHistory } from "@/shared/lib/navigation-history";
import { PasswordScreen } from "./PasswordScreen";

/**
 * The Change password view (gate-account-edits-and-group-security design.md
 * D4; spec "Change password view"): the account page's session gate and shell,
 * the password form in a section card and a back link to the account page.
 */

// The back control is a link (apply-header-link-rule); the app router is
// mocked for the form's buttons — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const auth = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  endProfileWrite: vi.fn<() => void>(),
}));

vi.mock("@/features/auth", async () => {
  const { useEffect } = await import("react");
  return {
    useSession: () => auth.session,
    signIn: vi.fn(),
    requestProfileWrite: vi.fn(),
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

afterEach(() => {
  cleanup();
  resetNavigationHistory();
  auth.session = { state: "loading" };
});

const es = getMessages("account", "es");

const USER = {
  ulid: "u1",
  name: "Ana",
  surname: "López",
  email: "ana@example.com",
  role: "specialist" as const,
};

describe("PasswordScreen", () => {
  it("shows the password form in the section named Change password (spec: The password form)", () => {
    auth.session = { state: "authenticated", user: USER };
    render(<PasswordScreen locale="es" />);
    const region = screen.getByRole("region", { name: es.changePassword });
    for (const label of [
      es.currentPasswordLabel,
      es.newPasswordLabel,
      es.passwordConfirmationLabel,
    ]) {
      expect(region.contains(screen.getByLabelText(new RegExp(`^${label}`)))).toBe(true);
    }
  });

  it("addresses the account page from its back link (spec: Back to the account)", () => {
    render(<PasswordScreen locale="es" />);
    expect(screen.getByRole("link", { name: es.backToAccount }).getAttribute("href")).toBe(
      "/es/account",
    );
  });

  it("leaving the view ends the write permission (spec: The action ends)", () => {
    auth.session = { state: "authenticated", user: USER };
    const { unmount } = render(<PasswordScreen locale="es" />);
    auth.endProfileWrite.mockClear();
    unmount();
    expect(auth.endProfileWrite).toHaveBeenCalledTimes(1);
  });

  it("while anonymous shows the signed-out text and Sign in, with no section (spec: The view's session gate)", () => {
    auth.session = { state: "anonymous" };
    render(<PasswordScreen locale="es" />);
    expect(screen.getByText(es.signedOutText)).toBeTruthy();
    expect(screen.getByRole("button", { name: es.signIn })).toBeTruthy();
    expect(screen.queryAllByRole("region")).toHaveLength(0);
  });
});
