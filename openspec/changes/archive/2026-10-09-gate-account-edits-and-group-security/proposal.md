Type: Refactor (fast lane)

## Why

Product owner's AUT (backlog entry R65, 2026-10-09): on the account page the edit options (the always-open "Edit profile" form, the Password card and the Danger zone) must stay closed until the user confirms identity, and the account-security options must sit together. Unlike other fast-lane changes, this one changes specified behaviour and texts by Product owner's decision (R65); Product owner typed this AUT correction as fast lane.

## What Changes

- Account page, read mode (default): Profile (read-only rows plus an "Edit profile" button), Contact details (unchanged) and Security, in that order. No profile form, no Password card and no Danger zone.
- "Edit profile" runs the identity check (`requestProfileWrite`) with the return route `/{locale}/account?edit=1` and opens edit mode on the same page: the Profile section becomes the existing profile form (prefilled) with a "Done" button, and the existing Danger zone follows Security. "Done" returns to read mode without writing.
- Security section: "Change password" (identity check, then the new password view), "Two-factor authentication" and "Passkeys" (both to the API's `/user/security` page, as the former "Manage security" link). "Verify email" is not added (R66).
- New "Change password" view at `/{locale}/account/password`: same session gate and page shell as the account page, the existing password form in a section card and a back link to `/{locale}/account`.
- Texts: new keys "Done", "Change password", "Two-factor authentication", "Passkeys" and "Back to my account" in es, en and ca; `securityDescription` covers password, two-factor and passkeys; `securityLink` is removed.
- The reactive step-up (`403` → "Confirm identity") stays on every write.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: "Profile settings" and "Writes and the step-up" modified; "Account page and its session gate" and "Security section" replaced by the added "Account page modes and their session gate" and "Grouped security section" (the OpenSpec CLI refuses a MODIFIED block that drops a scenario, as in nest-card-taste-notes); "Change password view" added.

## Non-goals

- No change to tokens, the session, the auth flow or `src/features/auth/api/authorize.ts`; the front does not track which scope the token holds.
- No change to `ProfileForm`, `PasswordForm`, `DangerZone`, `ProfileDetails` or their requests.
- No "Verify email" entry (R66), no change to the API or its contract.
- No other backlog entry is folded in.

## Impact

- Modified: `src/pages/account/ui/AccountClient.tsx`, `src/pages/account/ui/AccountScreen.tsx`, `src/pages/account/index.ts`, `messages/{es,en,ca}/account.json`.
- Added: `src/pages/account/ui/` read view, edit view, security section, gate cards and the password view's screen and client region; `app/[locale]/account/password/page.tsx`.
- Tests: `src/pages/account/ui/AccountClient.test.tsx` updated (sections per mode, the identity check calls, Done, the Security entries); one new test file for the password view (form, back link). `ProfileForm`, `PasswordForm`, `DangerZone`, `ProfileDetails` and `authorize` tests unchanged.

## Propose status

- Change-id: `gate-account-edits-and-group-security`
- Date: 2026-10-09
- `openspec validate gate-account-edits-and-group-security --strict`: valid
- Resolves backlog entry: R65
- Resolved (Product owner, 2026-10-09): read and edit modes on the same `/{locale}/account` page (design.md D1, D2); the Security section's three entries (D3); the password view at `/{locale}/account/password` (D4); no change to tokens or the auth flow; the front does not track the token scope, so the identity check runs on every "Edit profile" and "Change password" click (Product owner may later ask to skip it when the write scope is already held).
- Resolved in design: the edit-mode return route carries the query `?edit=1`, which the return-route validation keeps (it refuses a hash); the mode is read from the URL (D2).
- Open: the copy of the new texts is proposed and pending Product owner's review (D5); the order of the identity check and the mode change in popup mode (design.md Risks).
