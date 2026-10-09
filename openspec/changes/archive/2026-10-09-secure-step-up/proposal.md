Type: Refactor (fast lane)

## Why

Product owner's AUT findings (2026-10-09, maximum priority, both serious). Product owner typed them as fast lane; they change the step-up's specified outcome, so the spec deltas below state the new behaviour.

- A. On the account page, "Edit profile" opens the step-up popup and, in the same click, switches to the edit view (`src/pages/account/ui/AccountClient.tsx`: `requestProfileWrite(editRoute)` then `router.replace(editRoute)`); closing the popup leaves the edit view open. "Change password" does the same with `router.push(passwordRoute)`. The caller cannot wait because `requestProfileWrite` (`src/features/auth/api/authorize.ts`) returns nothing.
- B. If the user signs in as another user in the step-up popup, the front installs that user's tokens and the session switches to the other account.

## What Changes

- `requestProfileWrite` returns a promise of the step-up outcome: `granted`, `cancelled` (the popup closed), `failed` (the existing error path) or `other-account`. The full-page fallback keeps leaving the page; its promise never resolves.
- Every step-up (popup and full-page fallback) carries the expected user's `ulid` (the session user's). After the code exchange the new tokens are not installed until `GET /user`, sent with the new access token, returns the same `ulid`. Same user: the tokens are installed and the session settles as today. Another user: the previous tokens and session stay as they were (popup), `POST /logout` is sent with the new token, the new tokens are discarded and the outcome is `other-account`. In the full-page fallback the `ulid` travels in the existing `sessionStorage` flow record and the same check runs at `/callback`; on a mismatch the session ends `anonymous` and the return route opens.
- The account page opens the edit view and the password route only after `granted`; `cancelled` and `failed` keep the read view with no message; `other-account` keeps the read view and shows one `role="status"` message, a new `account` catalog key `stepUpOtherAccount` (es/en/ca).
- Sign in (`signIn`) is unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: "Step-up to the write scope" (the caller learns the outcome; a closed popup reports `cancelled`; a step-up by another user keeps the previous session, ends the other user's web session and reports `other-account`; the same check at the callback of the full-page fallback).
- `user-account`: "Account page modes and their session gate" (edit view and password route open only after a granted step-up; a closed popup keeps the read view; another account shows the message).

## Non-goals

- No token (design), dependency or API contract change. Tokens stay in memory only; no auth cookie; the only new stored value is the `ulid` in the existing full-page flow record.
- No change to sign in, silent re-authentication, refresh, sign out, or how the auth flow reads the locale (another change, `adopt-next-intl-routing`, edits that in parallel).
- No other backlog entry is folded in.

## Impact

- Modified: `src/shared/api/tokens.ts`, `src/shared/api/client.ts`, `src/shared/api/index.ts`, `src/features/auth/api/authorize.ts`, `src/features/auth/model/flow.ts`, `src/features/auth/model/session.ts`, `src/pages/account/ui/AccountClient.tsx`, `src/pages/account/ui/AccountScreen.tsx`, `messages/{es,en,ca}/account.json`. New: `src/features/auth/api/identity.ts`.
- Requests: only the added `GET /user` identity check with the new token after a step-up exchange, and `POST /logout` with the new token on a mismatch.
- Tests: new and updated tests in `src/features/auth/api/authorize.test.ts` and `src/pages/account/ui/AccountClient.test.tsx` (tasks name them). QA copies that assert the old behaviour are listed, never edited.

## Propose status

- Change-id: `secure-step-up`
- Date: 2026-10-09
- `openspec validate secure-step-up --strict`: valid
- Resolves backlog entry: none (Product owner's AUT findings passed directly).
- Resolved (Product owner, 2026-10-09): the outcome values (`granted`, `cancelled`, `failed`, `other-account`); the identity check with `GET /user` and the new token before installing it; `POST /logout` with the new token on a mismatch; the `ulid` in the full-page flow record; the message texts. Settled in design.md: an identity that cannot be resolved takes the existing error path (D3); a matching step-up settles the session with the existing profile load (D3).
- Open: nothing.
