## Context

Product owner's decision of 2026-10-09 (decisions log): the write permission lasts only the action (option A), every step-up sends `login_hint`, and the API's `access_denied` on a step-up keeps the session. After `secure-step-up`, a granted step-up installs the write grant with `keepTokens` (`src/shared/api/tokens.ts`) through `confirmStepUp` (`src/features/auth/api/identity.ts`), and the write grant stays for the rest of the page load. The step-up authorization URL is built by `authorizeUrl` in `src/features/auth/api/authorize.ts`; the popup's `{ error, state }` takes the error path in `completePopup`, which makes the session `anonymous`. The only callers of `requestProfileWrite` are the account page (`src/pages/account/ui/AccountClient.tsx`, `AccountEditView.tsx`, `PasswordClient.tsx`) and the three account forms it renders (`ProfileForm`, `PasswordForm`, `DangerZone` in `src/features/user-account/ui/`).

## Goals / Non-Goals

**Goals:** the write grant is in use only between a granted step-up and the end of its action; the step-up names its expected user to the API; the API's refusal of another user keeps the session.

**Non-Goals:** changing sign in, silent re-authentication, refresh, sign out, the client-side identity check, the locale the flow reads, the token storage (memory only), or any text.

## Decisions

### D1. The read grant is set aside when the write grant is installed

`tokens.ts` keeps, beside the grant in use, the grant that was in use before the write grant: `keepTokens(grant)` (only the step-up installs through it) first sets the grant in use aside, unless one is already set aside — a second step-up during the same action keeps the original read grant — and then installs the write grant. A new `restoreReadTokens()` puts the set-aside grant back in use and forgets it; with nothing set aside it changes nothing. `clearTokens()` forgets both. Setting the grant aside at install time rather than at the step-up's start keeps a read grant refreshed while the popup was open. Everything stays in module memory. If the restored read grant has expired, the client's existing `401` recovery (refresh, then silent re-authentication) applies, as the decision states.

### D2. The full-page fallback has no read grant to restore

A step-up completed through the full-page fallback runs in a new page load, where no read grant exists in memory: `keepTokens` sets aside "no grant". Ending that action discards the write grant and leaves no grant in use; the next authenticated request then takes the existing `401` path (no grant to refresh, then silent re-authentication with `profile:read`). This keeps "the write permission lasts only the action" without storing anything.

### D3. `login_hint` and `access_denied`

`authorizeUrl` gains `login_hint` when the flow carries a non-empty `expectedUlid`, which only a step-up sets (secure-step-up D2), so the popup and the full-page fallback both send it and `signIn` and the silent restore never do. In `completePopup`, a message `{ error: "access_denied", state }` whose `state` answers the pending step-up (`expectedUlid` set) resolves `other-account` without touching the marker, the tokens or the session; any other error, a `state` mismatch or a failed exchange keeps the existing error path. At `/callback` (full-page fallback) nothing changes: an error there already ends `anonymous`, as a mismatch does, because the previous tokens did not survive the page load. Since the API answers a declined authorization with `access_denied` too, a declined step-up popup now also reports `other-account` with the session kept, which the decision settles.

### D4. Where each action ends

`src/features/auth` exports `endProfileWrite()` (calls `restoreReadTokens`) and the hook `useProfileWriteScope(active)` in a new `src/features/auth/model/write-scope.ts`. The hook ends the write scope whenever `active` is `false`, and when the last active consumer unmounts; the unmount end runs in a microtask and is skipped when another active consumer mounted meanwhile, so React's development double mount and a hand-over between two write views in the same commit (edit mode's "Change password" opening the password route after its own step-up) do not discard a grant just obtained.

- `AccountClient`: `useProfileWriteScope(editing)` — closing edit mode ("Done"), and leaving the account page while in edit mode, end the action; read mode never holds the write grant.
- `PasswordClient`: `useProfileWriteScope(true)` — leaving the Change password view by any navigation ends the action.
- `ProfileForm` and `PasswordForm`: an optional `endProfileWrite` prop, called on a `200` before anything else.
- `DangerZone`: the same optional prop, called when a dialog is closed without completing (cancel or Escape). A completed deactivation or deletion signs out, which clears every grant.
- `AccountEditView` and `PasswordClient` pass `endProfileWrite` from `@/features/auth` to the forms. The prop is optional so the forms' other renders keep compiling.

## Risks / Trade-offs

- [The API's `access_denied` for a declined authorization is indistinguishable from the `login_hint` refusal] → both keep the session and show the "same account" status message; settled by the decision.
- [Full-page fallback ends in a silent re-authentication after the action] → only when no popup can open; it is the existing recovery path (D2).
