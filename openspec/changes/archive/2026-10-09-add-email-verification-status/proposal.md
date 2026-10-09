Type: Refactor (fast lane)

## Why

Backlog entry R66 (Product owner, 2026-10-09): the API now exposes `emailVerifiedAt` (null, or an ISO date) on the user resource (`GET /user`, operation `getTheAuthenticatedUser`) and serves its email verification page at `{NEXT_PUBLIC_API_URL}/email/verify` (operation `displayTheEmailVerificationPrompt`). The account page must show the email's verification state and offer the verification page while the email is unverified. Unlike other fast-lane changes, this one changes specified behaviour and texts by Product owner's decision (R66); Product owner typed the AUT-period changes as fast lane (as R65).

## What Changes

- Read-only Profile (`ProfileDetails`): a new row right after the email row, label "Email verification", value "Verified" when `emailVerifiedAt` is set and "Not verified" when it is null; no row when the field is absent. The state is plain text in the same label/value row as the other rows, never colour alone.
- Security section (`SecuritySection`): a new first item of its link list, before two-factor: while `emailVerifiedAt` is null, an external same-tab link "Verify email" to `{NEXT_PUBLIC_API_URL}/email/verify`; when it is set, the plain text "Email verified"; when absent, no item. `SecuritySection` receives the value as a prop from the account read view, which already has the session user.
- Texts in `messages/{es,en,ca}/account.json`: new keys `emailVerificationLabel`, `emailVerified` ("Verified"), `emailNotVerified`, `verifyEmail` and `emailVerifiedStatus` ("Email verified"); `securityDescription` also mentions email verification.
- After verifying, Fortify redirects to `/{locale}/account?verified=1` with a full page load; the session reloads the user from `GET /user`, so the page shows the new state. The front adds no handling of `?verified=1` (no message or toast); the query is ignored.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: "Profile settings" (the email verification row) and "Grouped security section" (the "Verify email" entry) modified.

## Non-goals

- No change to tokens, the session, the auth flow or `src/features/auth/api/authorize.ts`.
- No handling of `?verified=1`.
- No new token, colour, icon, dependency or route; no change to `contracts/` or `src/shared/api/schema.ts`.
- No other backlog entry is folded in.

## Impact

- Modified: `src/features/user-account/ui/ProfileDetails.tsx`, `src/pages/account/ui/SecuritySection.tsx`, `src/pages/account/ui/AccountReadView.tsx`, `src/pages/account/ui/AccountScreen.tsx`, `messages/{es,en,ca}/account.json`.
- Tests: `src/features/user-account/ui/ProfileDetails.test.tsx` (three cases of the verification row) and `src/pages/account/ui/AccountClient.test.tsx` (the "Verify email" link and the "Email verified" text); text fixtures gain the new keys.

## Propose status

- Change-id: `add-email-verification-status`
- Date: 2026-10-09
- `openspec validate add-email-verification-status --strict`: valid
- Resolves backlog entry: R66
- Resolved (Product owner, 2026-10-09): the verification state shows in the read-only Profile (row after the email) and in the Security section (first entry: link to `{NEXT_PUBLIC_API_URL}/email/verify` while unverified, "Email verified" text when verified, nothing when `emailVerifiedAt` is absent); no change to tokens or the auth flow; `?verified=1` is deliberately left unhandled (the full page load reloads the user).
- Open: the copy of the new texts and of `securityDescription` is proposed and pending Product owner's review.
