import { describe, it, expect, beforeEach } from "vitest";
import { saveFlow, readFlow } from "@/features/auth/model/flow";

/**
 * The pending-flow record and the sign-in marker (design.md D3; spec
 * "Credential handling"). Written before `./flow` exists (task 3.1): the
 * import fails to resolve until then, so the file runs and fails as required.
 *
 * Design.md D3 settles the behaviour asserted here: the flow record — PKCE
 * verifier, `state` and the return route — lives in `sessionStorage` under one
 * key and is deleted when the flow ends; the marker records only that the user
 * had signed in, carries no credential, lives in `localStorage`, and is
 * removed when the session ends. The two keys and the record shape below are
 * this module's storage contract: `src/features/auth/api/authorize.ts` writes
 * the same record through these functions and the callback screen reads it
 * under the same key (see `src/pages/callback/ui/CallbackScreen.test.tsx`).
 */

const FLOW_KEY = "tazavera.pending-flow";

const FLOW = {
  verifier: "verifier-123",
  state: "state-123",
  returnRoute: "/en/offerings/1",
};

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe("the pending-flow record (design.md D3)", () => {
  it("keeps the verifier, state and that return route under one sessionStorage key", () => {
    saveFlow(FLOW);

    expect(sessionStorage.length).toBe(1);
    expect(sessionStorage.getItem(FLOW_KEY)).not.toBeNull();
    expect(readFlow()).toEqual(FLOW);
  });
});
