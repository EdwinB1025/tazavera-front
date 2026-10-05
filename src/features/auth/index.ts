/**
 * Public API of the `auth` feature slice (Feature-Sliced Design).
 *
 * The session of design.md D1 — `useSession` — and its actions, of which sign
 * in lands here first (design.md D1); `signOut` and `requestProfileWrite`
 * follow with their tasks. The callback entry of design.md D1 — the one
 * function `/callback` uses to complete or forward the authorization result —
 * so `src/pages/callback` imports through this entry point and never
 * deep-imports.
 */
export { completeCallback, signIn } from "./api/authorize";
export { useSession } from "./model/session";
