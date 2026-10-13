import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { useForgetListPreferences } from "./forget-list-preferences";

const LIST_KEY = "tazavera.list-filters.my-evaluations";
const FLOW_KEY = "tazavera.pending-flow";

function signedIn(ulid: string): Session {
  return { state: "authenticated", user: { ulid, name: "Ana", role: "specialist" } };
}

beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem(LIST_KEY, "process=washed");
  sessionStorage.setItem(FLOW_KEY, "{}");
});

/** Spec "Remembered filters forgotten with the session" (design.md D4). */
describe("useForgetListPreferences", () => {
  it("forgets the kept filters when the user signs out", () => {
    const { rerender } = renderHook((session: Session) => useForgetListPreferences(session), {
      initialProps: signedIn("A"),
    });
    rerender({ state: "anonymous" });
    expect(sessionStorage.getItem(LIST_KEY)).toBeNull();
    expect(sessionStorage.getItem(FLOW_KEY)).toBe("{}");
  });

  it("forgets the kept filters when another user signs in", () => {
    const { rerender } = renderHook((session: Session) => useForgetListPreferences(session), {
      initialProps: signedIn("A"),
    });
    rerender(signedIn("B"));
    expect(sessionStorage.getItem(LIST_KEY)).toBeNull();
    sessionStorage.setItem(LIST_KEY, "city=Bogot%C3%A1");
    rerender(signedIn("B"));
    expect(sessionStorage.getItem(LIST_KEY)).toBe("city=Bogot%C3%A1");
  });
});
