## Why

Product owner's AUT finding (2026-10-09, maximum priority): the account page's Security section opens the API's pages ("Verify email", "Two-factor authentication", "Passkeys") as same-tab links. Leaving the tab drops the in-memory tokens, so coming back with the browser's Back button the user has lost the session. Sign-in already avoids this with a popup window (`startInteractive` in `src/features/auth/api/authorize.ts`).

## What Changes

- The three API entries of the Security section stay links with the same text and destination, but a plain primary click opens the API page in a popup window named `tazavera-security`, synchronously inside the click; when the popup is blocked, the page opens in a new tab with `noopener`. The account tab never navigates and keeps its session.
- When that popup closes, the account page reloads the session's profile from `GET /user` with the existing `refreshProfile` of `src/features/auth`, so a just-verified email shows as verified.
- The header user menu's "Security" entry, a same-tab link to the API's security page today, opens it the same way (popup, blocked-popup fallback), with no profile reload.
- "Change password" is unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: "Grouped security section" modified (the API entries open in a popup window and the account tab keeps the session; the profile is reloaded when the popup closes).

## Non-goals

- No change to tokens, `authorize.ts`, the "had a session" marker or the session store; no new text, token, route or dependency; no change to `contracts/` or `src/shared/api/schema.ts`.
- The app-shell requirement keeps its text (the header's security entry is still an external link to the API's security page); no app-shell delta.

## Impact

- New: `src/shared/lib/security-popup.ts`.
- Modified: `src/features/user-account/ui/ExternalLink.tsx`, `src/pages/account/ui/SecuritySection.tsx`, `src/pages/account/ui/AccountReadView.tsx`, `src/pages/account/ui/AccountEditView.tsx`, `src/pages/account/ui/AccountClient.tsx`, `src/widgets/app-header/ui/UserMenu.tsx`.
- Tests: `src/pages/account/ui/AccountClient.test.tsx` (Security section).

## Propose status

- Change-id: `open-security-pages-in-popup`
- Date: 2026-10-09
- `openspec validate open-security-pages-in-popup --strict`: valid
- Resolves backlog entry: none (Product owner's AUT finding of 2026-10-09)
- Resolved (Product owner, 2026-10-09): popup `window.open(url, "tazavera-security", "popup")` inside the click, `window.open(url, "_blank", "noopener")` when blocked, no `location.assign`; profile reload on close with the existing `refreshProfile` of `src/features/auth`, injected from the page layer; the header's "Security" entry (a same-tab link to `{API}/user/security`) gets the same popup behaviour.
- Decided by the architect (design.md): the opener lives in `src/shared/lib` because `pages/account` and `widgets/app-header` both use it; only a plain primary click is intercepted; the poll interval is 250 ms as in `authorize.ts`; the header entry reloads no profile.
- Open: no test covers the header entry's popup (outside the scenarios of this change).
