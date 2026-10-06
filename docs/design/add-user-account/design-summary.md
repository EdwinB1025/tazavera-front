Status: draft — pending Product owner review

# Design summary — add-user-account

Input for `/opsx:propose`. **DRAFT** — open points (§9) to settle in review before the explore.
Capability: `user-account`. Depends on `add-auth` (HTTP client, step-up) and `add-form-fields`.

## 1. Scope

- Registration: specialist and coffeeshop.
- Account settings: view profile, edit profile, change password, deactivate account, delete account permanently.

## 2. Out of scope

- Sign in, sign out, token refresh and the step-up mechanism itself (`add-auth`).
- Theme selector (avatar menu, `app-shell`) and language selector (header).
- Security — 2FA and passkeys: API web page `/user/security`, already an external link in the avatar menu.
- Password reset: stays in the API web flow.
- Management entries of the avatar menu (`add-offering-management`, `add-specialist-evaluations`).

## 3. Endpoints (to verify against `contracts/openapi.yaml`)

| Operation | Auth | Notes |
|---|---|---|
| `POST /register` | Public | Role travels in the body: coffeeshop route sends `coffeeshop`, default route sends `specialist`. |
| `GET /user` | Token | Own profile, no id in the path. |
| `PUT /users/{user}` | `profile:write` | name, surname, email. Ownership enforced by the API. |
| `PUT /users/{user}/password` | `profile:write` | current password + confirmation. |
| `DELETE /users/{user}` | `profile:write` | Deactivate (soft delete). |
| `DELETE /users/{user}/force` | `profile:write` | Permanent delete. |

Six contract operations.

## 4. Routes

- Registration: `/[locale]/register` (specialist) and a coffeeshop route — exact path open (§9.5).
- Settings under `/[locale]/account/*` (fixed by `add-app-shell`): profile, edit, password, deactivate/delete.

## 5. Behaviour

- **Registration:** form → `POST /register` → next step open (§9.2). Landing links to both registration routes (`add-landing`); the API login page links to the front entry.
- **Profile:** read-only view of `GET /user`.
- **Edit, password, deactivate, delete:** need a `profile:write` token → step-up through `add-auth` (re-authentication with `prompt=login`). When it triggers is open (§9.3).
- **Deactivate / delete:** explicit confirmation; on success the local session ends and the user lands on `/[locale]`.
- **Errors:** 422 → message under each field (Field); 403 → [open]; network/5xx → general error message.
- Every screen covers loading / success / error.

## 6. Components

Field, Input, PasswordInput, Button (existing). Confirmation dialog for destructive actions: not built yet (§9.4).
Visual reference: MVC settings pages — capture to add to this folder (rule of 4 Oct).

## 7. Texts

Catalog area `account` (`messages/{locale}/account.json`), en/es/ca. No literal text in components.

## 8. Tests

Per screen: loading, success, 422 field mapping, generic error. Step-up path on a write action. Destructive actions: nothing is sent without confirmation; session cleared after success.

## 9. Open points

1. **Registration body:** exact fields of `POST /register` (password confirmation? surname required? contact data?).
2. **After registration:** start sign in automatically, or show "account created" with a sign-in button?
3. **Step-up timing:** on entering the settings screen, or on submitting each write action?
4. **Confirmation dialog:** shadcn AlertDialog (new dependency/component) or a minimal own dialog?
5. **Route names:** registration paths and the settings sub-paths.
6. **Contacts:** users have contacts in the API — shown or edited here, or out?
7. **403 handling** on write actions (token without `profile:write` after a failed step-up).
8. **Layout:** one settings page with sections, or one page per action?
