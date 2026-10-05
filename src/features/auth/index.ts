/**
 * Public API of the `auth` feature slice (Feature-Sliced Design).
 *
 * The callback entry of design.md D1 — the one function `/callback` uses to
 * complete or forward the authorization result — so `src/pages/callback`
 * imports through this entry point and never deep-imports.
 */
export { completeCallback } from "./api/authorize";
