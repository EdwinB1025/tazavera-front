import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

import { EvaluationsAccess } from "@/features/manage-evaluations/ui/EvaluationsAccess";

const TEXTS = { message: "Sign in to manage your evaluations.", signInLabel: "Sign in" };

// The gate's caller: supplies the mocked session and sign-in action as props.
function Gate() {
  return (
    <EvaluationsAccess session={useSession()} signIn={signIn} texts={TEXTS}>
      <p>Protected content</p>
    </EvaluationsAccess>
  );
}

function renderGate() {
  return render(<Gate />);
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
  it("renders the content for a signed-in specialist", () => {
    useSession.mockReturnValue(user("specialist"));
    renderGate();
    expect(screen.getByText("Protected content")).toBeDefined();
    expect(notFound).not.toHaveBeenCalled();
  });
});
