## Context

Product owner's AUT finding (2026-10-09). `SecuritySection` (`src/pages/account/ui`) renders "Verify email" (`{API}/email/verify`), "Two-factor authentication" and "Passkeys" (`{API}/user/security`) with `ExternalLink` (`src/features/user-account`), a native same-tab anchor. The header user menu (`src/widgets/app-header/ui/UserMenu.tsx`) renders its "Security" entry as a native same-tab anchor to `{API}/user/security`. Tokens live only in memory, so a same-tab navigation away and back loses the session. Sign-in already opens the API in a popup inside the click and polls `popup.closed` (`listenToPopup` in `src/features/auth/api/authorize.ts`, every 250 ms). `src/features/auth` already exports `refreshProfile()` (`add-user-account` design.md D5): `GET /user` settling the session, a no-op unless the session is `authenticated`.

## Goals / Non-Goals

**Goals:** the account tab never navigates when an API security page opens; a just-verified email shows as verified once the popup closes.

**Non-Goals:** tokens, `authorize.ts`, the marker, the session store; new texts, tokens, routes or dependencies; the "Change password" entry.

## API endpoints

| Method and path | Auth | Request | Response used | Errors |
|---|---|---|---|---|
| `GET /user` (`getTheAuthenticatedUser`) | Bearer | none | `200` `data` settles the session (existing `refreshProfile`) | handled by `refreshProfile` as today (one retry, then the previous user is kept) |

No request is sent when an entry opens; the API pages load in the popup window.

## Decisions

### D1. The popup opener (`src/shared/lib/security-popup.ts`, shared)

One exported function, `openSecurityPopup(event: MouseEvent<HTMLAnchorElement>, onClosed?: () => void): void`, used as an anchor's click handler by both `pages/account` and `widgets/app-header` (it lives in `shared` because two layers' slices use it). It acts only on a plain primary click (`button === 0`, no `ctrlKey`, `metaKey`, `shiftKey` or `altKey`); any other click keeps the browser's native behaviour (middle-click and modified clicks open a new tab or window and never navigate the account tab). On a plain primary click it calls `preventDefault()` and, synchronously, `window.open(href, "tazavera-security", "popup")` with the anchor's `href`. When that returns `null` (popup blocked) it calls `window.open(href, "_blank", "noopener")`. It never uses `location.assign` on the popup (a reused popup already on the API origin is cross-origin). When the popup opened and `onClosed` is given, it polls `popup.closed` every 250 ms, as `listenToPopup` does, and on close stops polling and calls `onClosed` once.

### D2. `ExternalLink` click handler (`src/features/user-account/ui/ExternalLink.tsx`, features)

`ExternalLink` gains an optional `onClick?: (event: MouseEvent<HTMLAnchorElement>) => void`, passed to the anchor. Its markup, classes and the `PasswordForm` usage are unchanged.

### D3. The Security section (`src/pages/account`, pages)

`SecuritySection` gains a required prop `refreshProfile: () => Promise<void>`. Its three `ExternalLink`s keep their `href` and text and get `onClick={(event) => openSecurityPopup(event, () => void refreshProfile())}`. `AccountReadView` gains the same prop and passes it on; `AccountClient` passes `refreshProfile` from `@/features/auth` to `AccountReadView`; `AccountEditView`, which already imports `refreshProfile`, passes it to `SecuritySection`. The section does not import `@/features/auth`.

### D4. The header's Security entry (`src/widgets/app-header/ui/UserMenu.tsx`, widgets)

Its anchor keeps `href={securityUrl}` and its text and gets `onClick={(event) => openSecurityPopup(event)}`: the popup and the blocked-popup fallback of D1, with no profile reload (the reload is the account page's, per Product owner's finding). The app-shell requirement's wording ("the external security entry") stays true.

## Files

| Path | Layer | Change |
|---|---|---|
| `src/shared/lib/security-popup.ts` | shared | `openSecurityPopup` (D1) |
| `src/features/user-account/ui/ExternalLink.tsx` | features | optional `onClick` (D2) |
| `src/pages/account/ui/SecuritySection.tsx` | pages | popup entries, `refreshProfile` prop (D3) |
| `src/pages/account/ui/AccountReadView.tsx` | pages | passes `refreshProfile` (D3) |
| `src/pages/account/ui/AccountEditView.tsx` | pages | passes `refreshProfile` (D3) |
| `src/pages/account/ui/AccountClient.tsx` | pages | injects `refreshProfile` (D3) |
| `src/widgets/app-header/ui/UserMenu.tsx` | widgets | popup entry (D4) |

## Risks / Trade-offs

- The popup poll keeps running while the popup is open; it stops when the popup closes. If the account page unmounts first, the poll still ends on close and `refreshProfile` is a no-op on a non-authenticated session.
- With the popup blocked, no close can be observed: the profile is not reloaded until the next page load (accepted: the fallback only keeps the account tab from navigating).
- The header entry gets no test in this change (the tests are the Security section's scenarios); listed for Product owner.
