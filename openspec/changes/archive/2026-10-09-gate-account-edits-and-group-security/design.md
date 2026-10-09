## Context

Product owner's AUT (backlog R65, settled 2026-10-09). Today `src/pages/account/ui/AccountClient.tsx` renders six section cards: Profile (`ProfileDetails`), Contact details, Edit profile (`ProfileForm`), Password (`PasswordForm`), Security (one `ExternalLink` to `{NEXT_PUBLIC_API_URL}/user/security`) and Danger zone (`DangerZone`). The writes use the reactive step-up (`403` → `StepUpNotice` → `requestProfileWrite(returnRoute)` of `src/features/auth/api/authorize.ts`). No API endpoint is added or changed.

## Goals / Non-Goals

**Goals:** the edit options open only from an explicit "Edit profile" that runs the identity check; the security options sit in one Security section; "Change password" becomes its own view.

**Non-Goals:** changing tokens, the session, the auth flow or `authorize.ts`; tracking the token's scope in the front; changing the user-account feature components or their requests.

## Decisions

### D1. Read mode (default)

`/{locale}/account` without the `edit` query shows Profile (`ProfileDetails` plus an "Edit profile" button, text `editProfileHeading`), Contact details (`ContactSection`, unchanged) and Security (D3), in that order, as `AccountSection` cards in the existing `flex flex-col gap-4` group.

### D2. Edit mode and its return route

- Edit mode is `/{locale}/account?edit=1`: the client region reads it with `useSearchParams()` (`edit === "1"`). `toAppRoute` (`src/features/auth/model/return-route.ts`) keeps the path and query and refuses a hash, so the query is the only form that survives the full-page return without changing `authorize.ts`.
- "Edit profile" calls `requestProfileWrite("/{locale}/account?edit=1")` synchronously inside the click (the popup must open within it), then opens `/{locale}/account?edit=1` with the App Router's `replace` without scrolling. In the full-page fallback the browser leaves for the authorization page and comes back to that route; in popup mode the popup completes in place and the page underneath is already in edit mode.
- Edit mode shows the Profile section as the existing `ProfileForm` (heading `editProfileHeading`, description `profileDescription`, prefilled as today) with a "Done" button below the form, then Contact details, Security and the existing Danger zone (`DangerZone` in its `dangerZoneHeading` section).
- "Done" opens `/{locale}/account` with `replace` without scrolling: no write, no other navigation.
- Reaching edit mode without the check (typing the URL, closing the popup) has no guard: the writes keep the reactive step-up and the API enforces the scope.

### D3. Security section

One `AccountSection` (`securityHeading`, `securityDescription`) holding, in order: a "Change password" button that calls `requestProfileWrite("/{locale}/account/password")` synchronously inside the click and then pushes `/{locale}/account/password`; "Two-factor authentication" and "Passkeys", each an `ExternalLink` to `{NEXT_PUBLIC_API_URL}/user/security` (same tab, no request from the front). Buttons use the shared `Button` (variant `action-4`, as the account page's other secondary actions); every control keeps its own `focus-visible:focus-ring`.

### D4. Change password view

- Route `app/[locale]/account/password/page.tsx`: it only awaits `params` and renders the screen exported by the `account` page slice, like `app/[locale]/account/page.tsx` (no metadata, as the account page).
- The screen lives in the `account` page slice (`src/pages/account/ui/`), so it shares the gate cards with the account page: the same `PageSection` shell and `w-full` column, a `BackLink` (fallback `/{locale}/account`, text `backToAccount`) above the heading block, the heading `passwordHeading` as `h1`, and a client region with the same session gate holding one `AccountSection` (heading `changePassword`) with the existing `PasswordForm` (states and reactive step-up as today).

### D5. Texts

New keys in `messages/{es,en,ca}/account.json` (copy proposed, pending Product owner's review): `done` (Hecho / Done / Fet), `changePassword` (Cambiar la contraseña / Change password / Canviar la contrasenya), `twoFactor` (Verificación en dos pasos / Two-factor authentication / Verificació en dos passos), `passkeys` (Llaves de acceso / Passkeys / Claus d'accés), `backToAccount` (Volver a mi cuenta / Back to my account / Tornar al meu compte). `securityDescription` is rewritten to cover password, two-factor authentication and passkeys. `securityLink` is removed from the three locales. "Edit profile" reuses `editProfileHeading`.

### D6. Split

`AccountClient` keeps the gate and picks the view; one component per mode (`AccountReadView`, `AccountEditView`) shares `ContactSection` and a `SecuritySection`; the loading and signed-out cards move to one `AccountGateCards` module used by both client regions. Each component stays within 80 lines.

## Risks / Trade-offs

- The identity check runs on every "Edit profile" and "Change password" click, even when the token already holds `profile:write` (no scope tracking, by Product owner's decision).
- In popup mode the page enters edit mode (or the password view) when the check starts, not when it completes, because `requestProfileWrite` reports no completion; a closed popup leaves the user in edit mode, covered by the reactive step-up. Product owner may ask for a completion signal, which would change `authorize.ts`.
- `PasswordForm`'s reactive step-up returns to `/{locale}/account` in the full-page fallback, as today; on the password view that lands on the account page.
