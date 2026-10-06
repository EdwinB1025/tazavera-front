/**
 * Public API of the `auth` feature slice (Feature-Sliced Design).
 *
 * The session of design.md D1 — `useSession` — and its three actions: sign
 * in, sign out and the step-up `requestProfileWrite`. The callback entry of design.md D1 — the one
 * function `/callback` uses to complete or forward the authorization result —
 * so `src/pages/callback` imports through this entry point and never
 * deep-imports.
 */
export { completeCallback, requestProfileWrite, signIn } from "./api/authorize";
export { signOut, useSession } from "./model/session";
