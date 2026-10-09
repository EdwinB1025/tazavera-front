/**
 * Public API of the `auth` feature slice (Feature-Sliced Design).
 *
 * The session of design.md D1 — `useSession` — and its actions: sign in,
 * sign out, the step-up `requestProfileWrite` and the profile refresh
 * `refreshProfile` of `add-user-account` design.md D5. The callback entry of design.md D1 — the one
 * function `/callback` uses to complete or forward the authorization result —
 * so `src/pages/callback` imports through this entry point and never
 * deep-imports. `signInWithRegistration` signs in with a registration's token
 * block (sign-in-after-registration design.md D3), for `src/pages/register`.
 */
export { completeCallback, requestProfileWrite, signIn } from "./api/authorize";
export {
  refreshProfile,
  signInWithRegistration,
  signOut,
  useSession,
} from "./model/session";
