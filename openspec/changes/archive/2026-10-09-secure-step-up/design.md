## Context

Product owner's AUT findings A and B (2026-10-09). The step-up (`requestProfileWrite` in `src/features/auth/api/authorize.ts`) opens a popup synchronously in the click (design.md D10 of the auth change) or falls back to a full-page redirect with its PKCE record in `sessionStorage`. The popup result is completed in the opener by `completePopup`; the full-page result at `/callback` by `completeCallback`. Both call `exchangeCode` of `src/shared/api/tokens.ts`, which installs the grant in memory at once, so a step-up by another user replaces the session. `requestProfileWrite` returns nothing, so `AccountClient` navigates in the same click.

## Goals / Non-Goals

**Goals:** the caller of a step-up learns its outcome; the account page navigates only after `granted`; a step-up never installs another user's tokens.

**Non-Goals:** changing sign in, silent re-authentication, refresh, sign out, the locale the flow reads, the token storage, or the forms that already call `requestProfileWrite` from their step-up notice (they ignore the promise and keep their behaviour).

## Decisions

### D1. The outcome type and the promise

```ts
export type StepUpOutcome = "granted" | "cancelled" | "failed" | "other-account";
export function requestProfileWrite(returnRoute: string): Promise<StepUpOutcome>;
```

In popup mode the promise resolves once: `granted` after the exchange, the identity check of D3 and the session settled; `failed` on the existing error path (error result, `state` mismatch, failed exchange, identity not resolved); `cancelled` when the popup closes without a result (the existing D10 handling: flow discarded, session unchanged, no message); `other-account` per D3. In the full-page fallback the page leaves and the promise never resolves. `signIn` runs the same start and ignores the promise.

### D2. The expected user travels with the flow

`PendingFlow` gains an optional `expectedUlid`. Only a step-up sets it, to the session user's `ulid` read through the session seam (`currentUlid`, filled by `../model/session`), or an empty string when the session has none, so no user matches. The popup keeps it in the in-memory record; the full-page fallback writes it in the existing `sessionStorage` record. Nothing else is stored. Flows without `expectedUlid` (sign in, silent restore) are completed as today.

### D3. Identity check before the tokens are installed

`src/shared/api` exposes `exchangeCodeForGrant` (the exchange without keeping the grant), `keepTokens` (installs a grant) and `requestWithToken` (one request with a given Bearer token, no `401` recovery); `exchangeCode` keeps its behaviour on top of them. A new `src/features/auth/api/identity.ts` holds `confirmStepUp(code, verifier, expectedUlid)`: it exchanges the code, sends `GET /user` with the new access token and compares `data.ulid`. Same user: `keepTokens` and `true`; the caller then sets the marker and settles the session with the existing profile load (`authenticated`, as today). Another user: `POST /logout` with the new token (its answer is ignored, as in sign out), the grant is dropped and `false`. A `GET /user` that is not `ok` or carries no `ulid` throws, and the caller takes the existing error path.

At `/callback` a step-up record runs the same check; a mismatch takes the existing error path (flow cleared, marker removed, session `anonymous`, return route opened), because the previous tokens did not survive the full page load.

### D4. The account page waits for the outcome

`AccountClient` calls `requestProfileWrite` first in the click (the popup still opens synchronously), then awaits the promise. `granted`: "Edit profile" replaces the route with `?edit=1` (`scroll: false`) and "Change password" pushes the password route. `cancelled` and `failed`: nothing happens. `other-account`: a `<p role="status" className="type-body">` with `texts.stepUpOtherAccount` renders before the view, in both modes; a new click clears it.

### D5. The new text

`account` catalog key `stepUpOtherAccount`: es "Confirma tu identidad con la misma cuenta con la que iniciaste sesión.", en "Confirm your identity with the account you signed in with.", ca "Confirma la teva identitat amb el mateix compte amb què has iniciat la sessió.". Passed as a prop through `AccountScreen`.

## Risks / Trade-offs

- A granted step-up now sends `GET /user` twice (the identity check, then the existing profile load). Accepted: the session settles exactly as before.
- `src/features/auth/api/authorize.ts` was already over the 300-line limit before this change; the identity check lives in its own file to keep the growth small. Reported for the backlog.
