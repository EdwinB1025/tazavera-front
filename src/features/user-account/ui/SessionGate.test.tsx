import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { SessionGate, type SessionGateTexts } from "@/features/user-account";

/**
 * The account page's session gate (spec "Account page and its session gate";
 * design.md D1, D6 and D10): one card with the loading status while the
 * session resolves, one card with the signed-out text and "Sign in" while it
 * is anonymous, and its content for an authenticated session. "Sign in" calls
 * the injected `signIn` inside its click and nothing navigates.
 */

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const TEXTS: SessionGateTexts = {
  loading: "fx-loading",
  signedOutText: "fx-signed-out",
  signIn: "fx-sign-in",
};

const USER = {
  ulid: "u1",
  name: "Ana",
  surname: "López",
  email: "ana@example.com",
  role: "specialist" as const,
};

function renderGate(session: Session, signIn = vi.fn<() => void>()) {
  render(
    <SessionGate session={session} texts={TEXTS} signIn={signIn}>
      {(user) => <p data-testid="content">{user.name}</p>}
    </SessionGate>,
  );
  return { signIn };
}

describe("SessionGate", () => {
  it("while loading shows one card with the loading status and no content", () => {
    renderGate({ state: "loading" });
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(screen.queryByTestId("content")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("while anonymous shows one card with the signed-out text and Sign in, and no content", () => {
    renderGate({ state: "anonymous" });
    expect(screen.getByText(TEXTS.signedOutText)).toBeTruthy();
    const button = screen.getByRole("button", { name: TEXTS.signIn });
    expect(button.className).toContain("bg-action-primary");
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("Sign in calls the injected signIn once, inside the click, with no navigation", () => {
    const assign = vi.fn<(url: string) => void>();
    const replace = vi.fn<(url: string) => void>();
    vi.stubGlobal("location", { assign, replace, pathname: "/es/account" });
    const { signIn } = renderGate({ state: "anonymous" });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("while authenticated renders its content with the session user", () => {
    renderGate({ state: "authenticated", user: USER });
    expect(screen.getByTestId("content").textContent).toBe("Ana");
    expect(screen.queryByRole("status")).toBeNull();
  });
});
