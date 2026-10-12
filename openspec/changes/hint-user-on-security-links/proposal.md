Type: Refactor (fast lane)

## Why

The front opens the API's web pages `/user/security` (the account's Security section and the header user menu's "Security" entry) and `/email/verify` (the account's "Verify email") without saying which user it expects, so the API serves them to whichever web session the browser holds: the Product owner, signed in on the front as a specialist, could manage the passkeys of a coffee shop account whose web session the browser still held. The API side (`tazzavera-api` branch `feature/bind-web-pages-to-hinted-user`) now signs out a web session of another user when the page is opened with a `login_hint` that does not match. Backlog entry R82, a security fix ordered as fast lane by the Product owner on 2026-10-12.

## What Changes

- Every link the front renders to `/user/security` and `/email/verify` carries `?login_hint=<the signed-in user's ULID>`, the same value the step-up sends (`data.ulid` of `GET /user`), built through the existing API web page address helper, never by hand.
- The account's "Verify email", "Two-factor authentication" and "Passkeys" links and the user menu's "Security" entry keep opening in the security popup as today, with the same texts and accessible names.
- With no user identifier in the session the links render as today, with no `login_hint`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: MODIFIED "Grouped security section": the "Verify email", "Two-factor authentication" and "Passkeys" links carry `login_hint` with the session user's `data.ulid` (scenarios "Two-factor authentication and passkeys" and "Verifying the email" modified; scenario "No user identifier in the session" added).
- `app-shell`: MODIFIED "Signed-in header and user menu": the security entry carries `login_hint` with the session user's `data.ulid` (scenario "The security entry names the signed-in user" and scenario "No user identifier in the session" added).

## Non-goals

- No change to any other link to the API's web pages (sign in, consent, forgot password, the step-up's authorization request).
- No change to the popup behaviour, texts, accessible names, icons or order of the entries.
- No new request, no API or contract change, no new dependency, token, guard test or interface text.
- No change to the active change `route-api-web-pages-through-front`.
- No other backlog entry is folded in.

## Impact

- Modified: `src/shared/api/web-pages.ts` (the address helper takes an optional login hint); `src/pages/account/ui/SecuritySection.tsx`, `src/pages/account/ui/AccountReadView.tsx`, `src/pages/account/ui/AccountEditView.tsx` (the Security section receives the session user's ULID); `src/widgets/app-header/ui/UserMenu.tsx`.
- Tests: in the validation suite, the tests of the modified scenarios and of the popup scenarios get the new expected address; one new test per added scenario. No other assertion changes.
- QA suite: a QA test asserting the old address of these links is updated only in that expected address.
- Risk: the active change `route-api-web-pages-through-front` holds its own MODIFIED text of "Grouped security section" and "Signed-in header and user menu" without `login_hint`; if it is archived after this change, its delta replaces these requirements and drops the `login_hint` wording, so its delta needs the `login_hint` wording added before its archive.

## Propose status

- Change-id: `hint-user-on-security-links`
- Date: 2026-10-12
- `openspec validate hint-user-on-security-links --strict`: valid
- Resolves backlog entry: R82 (fast lane by Product owner's order of 2026-10-12; settled end state is the scope).
- Resolved (architect, design.md): the helper `apiWebPageUrl` takes an optional login hint and adds `login_hint` only when it is non-empty (D1); the Security section receives the ULID from the account views, the user menu reads it from its session user (D2).
- Open: none blocking. Risk recorded above on the overlapping active change `route-api-web-pages-through-front`.
