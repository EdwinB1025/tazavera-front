## Context

Backlog entry R82 (security fix, fast lane by the Product owner's order of 2026-10-12). The front renders three links to the API's web pages that act on the user's account: `/user/security` in the account's Security section ("Two-factor authentication", "Passkeys") and in the header user menu ("Security"), and `/email/verify` in the account's Security section ("Verify email"). All are built with `apiWebPageUrl` from `@/shared/api` (`src/shared/api/web-pages.ts`, `{NEXT_PUBLIC_APP_URL}{path}`) and open in the security popup through `openSecurityPopup` from `@/shared/lib/security-popup`, which opens the anchor's `href`. The step-up already names its expected user with `login_hint` set to the session user's `ulid` (`src/features/auth/api/authorize.ts`, value from `currentUlid` in `src/features/auth/model/session.ts`). The API (`tazzavera-api` branch `feature/bind-web-pages-to-hinted-user`) signs out a web session of another user when the page is opened with a `login_hint` that does not match.

## Goals / Non-Goals

**Goals:**
- Every link to `/user/security` and `/email/verify` carries `login_hint=<session user's ulid>`, built through `apiWebPageUrl`.
- Without a ULID the links render as today.

**Non-Goals:**
- Other links to the API's web pages (forgot password, sign in, consent) and the step-up's request stay as they are.
- No change to the popup, texts, accessible names, icons or order.

## API endpoints consumed

None new. The links are navigations to the API's web pages on the front's origin, not requests: `GET /user/security` and `GET /email/verify` (web routes, session-authenticated by the API, outside `contracts/openapi.yaml`), now with the query parameter `login_hint`. The ULID is `data.ulid` of `GET /user` (`SessionUser["ulid"]`, generated type, optional). No API error reaches the front: a mismatching hint is handled by the API's page inside the popup.

## Types

No derived type. `SessionUser` from `@/shared/api` already carries `ulid?: string`.

## Decisions

### D1. `apiWebPageUrl` takes an optional login hint

`apiWebPageUrl(path: string, loginHint?: string): string` in `src/shared/api/web-pages.ts` (layer `shared`, segment `api`). With a non-empty `loginHint` it returns the address with the query `login_hint=<hint>`, the value URL-encoded (built with `URL` / `URLSearchParams`, never by string concatenation of the value); with `undefined` or an empty string it returns exactly today's address. Existing callers pass no hint and are unchanged. Chosen over building the query in each component so that the three links share one construction and none is built by hand (R82 settled end state).

### D2. Where the ULID comes from

- `src/widgets/app-header/ui/UserMenu.tsx` (layer `widgets`): `apiWebPageUrl("/user/security", user.ulid)`; `user` is the session user it already receives.
- `src/pages/account/ui/SecuritySection.tsx` (layer `pages`): a new optional prop `ulid?: string` (the session user's `data.ulid`), used for both `apiWebPageUrl("/user/security", ulid)` and `apiWebPageUrl("/email/verify", ulid)`.
- `src/pages/account/ui/AccountReadView.tsx` and `src/pages/account/ui/AccountEditView.tsx` (layer `pages`) pass `ulid={user.ulid}` to `SecuritySection`.

This is the same value the step-up sends (`currentUlid` returns the authenticated session user's `ulid`). No import between slices of the same layer is added.

### D3. Signed out

The account's Security section and the user menu render only for an authenticated session. A session user without `ulid` makes `apiWebPageUrl` return today's address, with no `login_hint` (spec scenarios "No user identifier in the session").

## Files

| File | Layer | Change |
|---|---|---|
| `src/shared/api/web-pages.ts` | shared | D1 |
| `src/pages/account/ui/SecuritySection.tsx` | pages | D2 |
| `src/pages/account/ui/AccountReadView.tsx` | pages | D2 |
| `src/pages/account/ui/AccountEditView.tsx` | pages | D2 |
| `src/widgets/app-header/ui/UserMenu.tsx` | widgets | D2 |
| `src/pages/account/ui/AccountClient.test.tsx` | pages | tests (task 1.1) |
| `src/widgets/app-header/ui/AppHeader.test.tsx` | widgets | tests (task 2.1) |

## Risks / Trade-offs

- The active change `route-api-web-pages-through-front` holds MODIFIED text for "Grouped security section" and "Signed-in header and user menu" without `login_hint`. Archived after this change, it would replace these requirements and drop the `login_hint` wording; its delta needs that wording before its archive. This change does not touch it.
- The `ulid` is a user identifier sent in the address of a page on the front's own origin, which forwards it to the API; it is the same value the step-up already sends in its authorization request.
