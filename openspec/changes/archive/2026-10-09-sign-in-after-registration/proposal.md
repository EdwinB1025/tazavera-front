## Why

Backlog entry R44 (Product owner, 2026-10-08): after registering, the user has to type the same credentials again to sign in. The API's `POST /register` (`registerAUser`) now answers `201` with the user, `message` and, when its internal registration grant succeeded, a `token` block in the RFC 6749 §5.1 shape (`token_type`, `expires_in`, `access_token`, `refresh_token`) issued on the front's public client, so the front's usual refresh works with it. The block is missing when the tokens could not be issued after the user was created. The front signs the user in with that block.

## What Changes

- `src/shared/api/tokens.ts`: one new entry point that keeps a registration's token block as the grant in module memory (the grant `exchangeCode` and `refreshTokens` fill), after checking its four fields and their types; anything else is refused (it throws and keeps nothing). Nothing is written to browser storage; no new client and no new request.
- `src/features/user-account/api/register.ts`: on `201`, `registerUser` returns the body's `token` block, or `null` when the body carries none; every other outcome stays the generic error.
- `src/features/auth`: one new function that keeps the block through the new entry point and settles the session with `GET /user`, as a completed popup sign-in does, without setting the "had a session" marker and without touching any sign-in flow record. A refused block or a profile that cannot be loaded ends the session `anonymous` and reports the failure to the caller.
- Register screens (specialist and coffee shop): with a token block and the sign-in succeeding, the user is signed in and the screen opens `/{locale}/account` through client-side navigation (never a full page load, which would drop the in-memory tokens). Without a block, or when the sign-in fails, today's success panel with "Sign in" shows, unchanged.
- After a reload the user appears signed out (no marker, no message); while the page stays open the refresh token keeps the session.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: "Sign-in from a registration grant" added.
- `user-account`: "Registration result" modified (signed in and sent to the account page when the `201` carries a token block that signs in; the success panel otherwise).

## Non-goals

- No change to `/callback`, `exchangeCode`, the PKCE flow records, the marker logic of the other flows, silent re-authentication or the step-up; scopes stay those of a normal sign-in (no `profile:write`).
- No session restore after a reload for a registration sign-in.
- No new token, colour, text, dependency or route; no change to `contracts/` or `src/shared/api/schema.ts`.
- No other backlog entry is folded in (R45, the first location at coffee-shop registration, stays deferred).

## Impact

- Modified: `src/shared/api/tokens.ts`, `src/shared/api/index.ts`, `src/features/user-account/api/register.ts`, `src/features/user-account/ui/RegisterForm.tsx`, `src/features/auth/model/session.ts`, `src/features/auth/index.ts`, `src/pages/register/ui/RegisterClient.tsx`.
- Tests: new `src/shared/api/tokens.test.ts` and `src/features/user-account/api/register.test.ts`; added cases in `src/features/auth/model/session.test.ts` and `src/pages/register/ui/RegisterClient.test.tsx`; `src/features/user-account/ui/RegisterForm.test.tsx` gains the new prop in its render helper.

## Propose status

- Change-id: `sign-in-after-registration`
- Date: 2026-10-09
- `openspec validate sign-in-after-registration --strict`: valid
- Resolves backlog entry: R44 (front part; the API part is done, "API done 2026-10-08")
- Resolved (Product owner, 2026-10-08, R44 "Decided", "Superseded" and "API done"): sign-in from the internal registration grant's `token` block, kept in memory only, no marker, no `/callback`; the success panel stays as the fallback; scopes as a normal sign-in.
- Open: the destination after the registration sign-in, `/{locale}/account` for both roles, is the orchestrator's choice pending Product owner's review.
