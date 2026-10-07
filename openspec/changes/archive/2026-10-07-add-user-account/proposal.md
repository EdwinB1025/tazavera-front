# Proposal

## Why

The front cannot create an account nor manage it: five of the contract's six user operations (`registerAUser`, `updateAUser`, `updateUserPassword`, `deactivateAUser`, `permanentlyDeleteAUser`) are unconsumed, and the user menu links to five account routes that do not exist (`UserMenu.tsx:81-87`). With the bootcamp delivery this week, the front must consume every operation of the contract, and the approved design summary for `add-user-account` settles the whole behaviour (one account page with four sections, reactive step-up, one "My account" menu entry).

## What Changes

- Two registration routes — `/[locale]/register` (specialist) and `/[locale]/register/coffeeshop` (coffeeshop) — fed by the links the entry page and the About us page already carry. `POST /register` is sent without credentials with the route's `role`; a `201` replaces the form with a success panel whose "Sign in" starts sign in from inside the click.
- One account page `/[locale]/account` with four sections: Profile (read-only role plus name, surname and email via `PUT /users/{user_ulid}`), Password (`PUT /users/{user_ulid}/password`, plus an external link to the API's password reset), Security (external link to the API's security page) and Danger zone (Deactivate `DELETE /users/{user_ulid}`, Delete `DELETE /users/{user_ulid}/force`, each behind its confirmation dialog).
- The four writes use the reactive step-up of `auth`: a `403` shows the step-up notice and the user confirms identity and activates the action again; a session that ends `anonymous` (declined step-up, unrecovered `401`) shows the signed-out state.
- Client-side validation follows the "validación de formularios en el navegador" decision: only what each operation's `requestBody` documents. Any `422` shows the generic form-level error (field mapping is backlog R8).
- New message area `account` (`messages/{es,en,ca}/account.json`) with the texts of both screens.
- **Modified `auth`:** a profile refresh re-runs `GET /user` and settles the session with its data (never with another response body); a transient failure retries once after a short pause and a second failure keeps the previous user silently. The scenario "The profile cannot be resolved" is scoped to the session's first resolution.
- **Modified `app-shell`:** the user menu's five account entries become one "My account" entry pointing at `/[locale]/account`; the `shell` catalog gains `myAccount` and drops the five keys.
- The confirmation dialogs are `ConfirmDialog` from `add-evaluation-scales`; the apply of this change waits for that change to be merged into `develop` (design summary Open 11).

## Capabilities

### New Capabilities

- `user-account`: registration (specialist and coffeeshop) and profile settings (view, edit, password, deactivate, delete).

### Modified Capabilities

- `auth`: "Session states and profile" scopes its unresolvable-profile scenario to the session's first resolution and gains the outcomes of a profile refresh (success, one retry on a transient failure, previous user kept on a second failure).
- `app-shell`: "Signed-in header and user menu" offers one account entry pointing at the account page in place of the profile settings entries.

## Out of Scope

- Sign in, sign out, token refresh and the step-up mechanism itself (`add-auth`).
- The theme selector (user menu) and the language selector (header).
- Security (2FA, passkeys) and password reset: pages of the API, reached by external links in the same tab.
- The management entries of the user menu (`add-offering-management`, `add-specialist-evaluations`).
- Contacts (closed by Product owner) and restoring a deactivated account (no contract operation).
- Field mapping of `422` responses (backlog R8): any `422` shows the generic form-level error.
- A `base-controls` delta: the account page's external links are native anchors that reuse the link treatment classes through a plain export, which changes no observable behaviour (base-controls keeps external navigation out of the treatment's scope).

## Impact

- Code created: the routes `app/[locale]/register/page.tsx`, `app/[locale]/register/coffeeshop/page.tsx` and `app/[locale]/account/page.tsx`; the slices `src/pages/register`, `src/pages/account` and `src/features/user-account`.
- Code modified: `src/features/auth` (the profile refresh), `src/widgets/app-header/ui/UserMenu.tsx` and `AppHeader.tsx`, `src/app/shell/AppShell.tsx`, `src/shared/api/index.ts` (derived payload types), `src/shared/ui/Link.tsx` and `src/shared/ui/index.ts` (the treatment-classes export), `src/app/styles/theme-tokens.test.ts` (two contrast pairs), `messages/{es,en,ca}/shell.json`, and the new `messages/{es,en,ca}/account.json`.
- API: consumes `registerAUser` (`POST /register`), `getTheAuthenticatedUser` (`GET /user`, through the session and the profile refresh), `updateAUser` (`PUT /users/{user_ulid}`), `updateUserPassword` (`PUT /users/{user_ulid}/password`), `deactivateAUser` (`DELETE /users/{user_ulid}`) and `permanentlyDeleteAUser` (`DELETE /users/{user_ulid}/force`). `contracts/openapi.yaml` and `src/shared/api/schema.ts` stay untouched.
- Dependencies: none added. One blocking dependency: `ConfirmDialog` (`add-evaluation-scales`) must be merged into `develop` before the apply starts.
- Tests: `src/widgets/app-header/ui/AppHeader.test.tsx` (the menu entry tables and texts fixture), new slice tests next to their components, the two contrast pairs in `src/app/styles/theme-tokens.test.ts`; the catalog guard covers the new `account` area and the changed `shell` keys automatically.
