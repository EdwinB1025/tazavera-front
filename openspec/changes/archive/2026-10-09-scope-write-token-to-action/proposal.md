Type: Refactor (fast lane)

## Why

Product owner's decision of 2026-10-09 (decisions log, "permiso de escritura, `login_hint` y `API_INTERNAL_URL`"), the step-up change that follows `secure-step-up`. Product owner typed it as fast lane; it changes the step-up's specified outcome, so the spec deltas below state the new behaviour.

- After a granted step-up the write tokens replace the read tokens for the rest of the session, so every later write is sent with the write permission.
- The API (`tazavera-api` at `89e25c4`) accepts a `login_hint` on the authorization request and refuses to issue a code to another user, answering `error=access_denied`; the front does not send it yet.

## What Changes

- The write permission lasts only the action (option A). When a step-up is granted, the tokens in use are kept aside in memory before the write tokens are installed. When the action ends — the profile form saves, edit mode closes, the password form saves, the user leaves edit mode or the password route by any navigation, or a danger-zone dialog is cancelled — the write tokens are discarded and the kept read tokens are back in use, with no request. A later write needs a new step-up.
- Every step-up authorization request (popup and full-page fallback) carries `login_hint=<the session user's ulid>`. Sign in sends none.
- A step-up popup answered with `error=access_denied` (and the request's `state`) keeps the previous session and tokens and reports `other-account`, so the account page shows its existing status message. The client-side identity check of `secure-step-up` stays.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: "Step-up to the write scope" (write tokens scoped to the action and discarded at its end; `login_hint` sent; `access_denied` on a step-up popup keeps the session and reports `other-account`).
- `user-account`: "Writes and the step-up" (the points of the account modes where the action ends).

## Non-goals

- No text, token (design), dependency or API contract change. Tokens stay in memory only; nothing new is stored.
- No change to sign in, silent re-authentication, refresh, sign out, or how the auth flow reads the locale (`adopt-next-intl-routing` edits that in parallel).
- No backlog entry is folded in.

## Impact

- Modified: `src/shared/api/tokens.ts`, `src/shared/api/index.ts`, `src/features/auth/api/authorize.ts`, `src/features/auth/index.ts`, `src/features/user-account/ui/ProfileForm.tsx`, `src/features/user-account/ui/PasswordForm.tsx`, `src/features/user-account/ui/DangerZone.tsx`, `src/pages/account/ui/AccountClient.tsx`, `src/pages/account/ui/AccountEditView.tsx`, `src/pages/account/ui/PasswordClient.tsx`. New: `src/features/auth/model/write-scope.ts`.
- Requests: the step-up authorization URL gains `login_hint`; no request is added.
- Tests: new tests in `src/features/auth/api/authorize.test.ts`, `src/features/user-account/ui/ProfileForm.test.tsx`, `src/features/user-account/ui/PasswordForm.test.tsx`, `src/features/user-account/ui/DangerZone.test.tsx`, `src/pages/account/ui/AccountClient.test.tsx` and `src/pages/account/ui/PasswordScreen.test.tsx`. QA copies are never edited.

## Propose status

- Change-id: `scope-write-token-to-action`
- Date: 2026-10-09
- `openspec validate scope-write-token-to-action --strict`: valid
- Resolves backlog entry: none (Product owner's decision passed directly).
- Resolved (Product owner, 2026-10-09): option A (write tokens last only the action, read tokens kept aside in memory and restored with no request); `login_hint` with the session user's `ulid` on every step-up; `access_denied` on a step-up keeps the session and reports `other-account`; the client-side identity check stays. Settled in design.md: the read tokens are set aside when the write grant is installed (D1); the full-page fallback has no read tokens to restore (D2); where each end of action is wired (D4); `access_denied` keeps the session only in the popup (D3).
- Open: nothing.
