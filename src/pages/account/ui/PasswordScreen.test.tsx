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

const auth = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
}));

vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
  signIn: vi.fn(),
  requestProfileWrite: vi.fn(),
}));

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
      expect(region.contains(screen.getByLabelText(label))).toBe(true);
    }
  });

  it("addresses the account page from its back link (spec: Back to the account)", () => {
    render(<PasswordScreen locale="es" />);
    expect(
      screen.getByRole("link", { name: es.backToAccount }).getAttribute("href"),
    ).toBe("/es/account");
  });

  it("while anonymous shows the signed-out text and Sign in, with no section (spec: The view's session gate)", () => {
    auth.session = { state: "anonymous" };
    render(<PasswordScreen locale="es" />);
    expect(screen.getByText(es.signedOutText)).toBeTruthy();
    expect(screen.getByRole("button", { name: es.signIn })).toBeTruthy();
    expect(screen.queryAllByRole("region")).toHaveLength(0);
  });
});
