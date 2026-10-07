import { describe, it, expect, beforeEach } from "vitest";
import {
  saveFlow,
  readFlow,
  clearFlow,
  setMarker,
  hasMarker,
  removeMarker,
} from "./flow";

const FLOW = {
  verifier: "verifier-123",
  state: "state-123",
  returnRoute: "/en/offerings/1",
};

/** Everything left in browser storage, as `key=value` lines. */
function storageDump(): string {
  const entries: string[] = [];
  for (const storage of [sessionStorage, localStorage]) {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)!;
      entries.push(`${key}=${storage.getItem(key)}`);
    }
  }
  return entries.join("\n");
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe("the pending-flow record (design.md D3)", () => {
  it("deletes the flow data when the flow ends (spec: During a sign-in flow)", () => {
    saveFlow(FLOW);

    clearFlow();

    expect(readFlow()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});

describe("the sign-in marker (design.md D3)", () => {
  it("records only that the user had signed in and carries no credential (spec: After sign in)", () => {
    saveFlow(FLOW);
    clearFlow();

    setMarker();

    expect(hasMarker()).toBe(true);
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(1);
    const dump = storageDump();
    expect(dump).not.toContain("verifier-123");
    expect(dump).not.toContain("code-123");
    expect(dump).not.toContain("access-1");
  });

  it("is removed when the session ends and leaves no trace (spec: After sign out)", () => {
    setMarker();

    removeMarker();

    expect(hasMarker()).toBe(false);
    expect(localStorage.length).toBe(0);
    expect(storageDump()).toBe("");
  });
});
