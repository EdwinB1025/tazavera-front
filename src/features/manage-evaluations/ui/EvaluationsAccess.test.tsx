import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Session } from "@/shared/api";

/**
 * The access gate of every evaluation route (design.md D13; spec "Sign-in to
 * the evaluation routes"; tasks 3.1): `loading` waits, `anonymous` shows the
 * message with the "Sign in" button, a specialist sees the content and any
 * other role gets the 404 page.
 */

const useSession = vi.fn<() => Session>();
const signIn = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
});

vi.mock("@/features/auth", () => ({
  useSession: () => useSession(),
  signIn: (...args: unknown[]) => signIn(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

import { EvaluationsAccess } from "./EvaluationsAccess";

const TEXTS = { message: "Sign in to manage your evaluations.", signInLabel: "Sign in" };

function renderGate() {
  return render(
    <EvaluationsAccess texts={TEXTS}>
      <p>Protected content</p>
    </EvaluationsAccess>,
  );
}

function user(role: "specialist" | "coffeeshop"): Session {
  return { state: "authenticated", user: { ulid: "01JUSER", role } as never };
}

beforeEach(() => {
  useSession.mockReset();
  signIn.mockReset();
  notFound.mockClear();
  window.history.replaceState(null, "", "/en/manage/evaluations/new?offering=01JOFFER");
});

afterEach(cleanup);

describe("EvaluationsAccess (design.md D13)", () => {
  it("renders neither the content nor the message while the session is loading", () => {
    useSession.mockReturnValue({ state: "loading" });
    renderGate();
    expect(screen.queryByText("Protected content")).toBeNull();
    expect(screen.queryByText(TEXTS.message)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows the message and a Sign in button that signs in for the current route on click", () => {
    useSession.mockReturnValue({ state: "anonymous" });
    renderGate();
    expect(screen.queryByText("Protected content")).toBeNull();
    expect(screen.getByText(TEXTS.message)).toBeDefined();
    expect(signIn).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith("/en/manage/evaluations/new?offering=01JOFFER");
  });

  it("renders the content for a signed-in specialist", () => {
    useSession.mockReturnValue(user("specialist"));
    renderGate();
    expect(screen.getByText("Protected content")).toBeDefined();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("renders the 404 page for any other role", () => {
    useSession.mockReturnValue(user("coffeeshop"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderGate()).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    spy.mockRestore();
    expect(notFound).toHaveBeenCalled();
    expect(screen.queryByText("Protected content")).toBeNull();
  });
});
