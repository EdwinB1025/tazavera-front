Status: draft — pending Product owner review

# Design summary — add-user-account

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Product owner's draft, reviewed by the design lead on 2026-10-06 (see "Review log"). Anything not settled by a source is listed under "Open".

- Change-id: `add-user-account`
- Capability: `user-account`
- Depends on:
  - `add-auth` (Apply): session, request client, `signIn`, `signOut`, `requestProfileWrite`.
  - `add-evaluation-scales` (Summary — draft): `ConfirmDialog` (its §5).
  - Merged on `develop`: `add-form-fields` (Field, Input, PasswordInput), `add-base-control` (Button, Link), `add-landing` (Card, the registration links, decision D14), `add-app-shell` (the user menu routes, the message catalog).
- Backlog: no entry in `docs/backlog.md` names this change. The pending candidate "shared section primitive" (general context, "Al retomar" item 8) does: see Open 8.
- Decisions log: "2026-10-06 — add-landing (D14)" names this change (page layout, §7). No other entry does.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| Product owner, general context "add-user-account" | 9.1: `POST /register` takes camelCase fields, and `role` is optional. 9.6: contacts are out of scope. |
| `contracts/openapi.yaml` (develop) | The six operations and their fields (§3). |
| `add-auth` spec "Step-up to the write scope" and design D1, D10 (`feature/add-auth`) | `requestProfileWrite(returnRoute): void` opens a popup inside the click, keeps the route and its typed input, and returns no completion signal. A declined or failed step-up makes the session `anonymous` (confirmed correct by Product owner, `add-auth` design summary line 59). |
| `add-auth` spec "Session states and profile" | The session is `loading`, `anonymous` or `authenticated`, and carries `data.ulid`, `name`, `surname`, `email`, `role` from `GET /user`. |
| `add-auth` design D2 and `src/shared/api/client.ts` (`feature/add-auth`) | A `401` runs refresh, then silent re-authentication, then `anonymous`. Any other status reaches the caller. |
| `tazavera-api` `RequireLoginForWriteScope.php` | The API always forces a fresh login for `profile:write`, whatever `prompt` the client sends. The front sends no `prompt=login`. |
| `src/widgets/app-header/ui/UserMenu.tsx:82-86` (develop) | The five account routes (§4). |
| `src/pages/home/ui/HomeHero.tsx:79-83`, `src/pages/about/ui/AboutContent.tsx:119-123` (develop) | The two registration routes (§4). |
| Decisions log D14 (add-landing) | Page layout: full-width sections, a centred container of at most 72rem, side padding 1rem/2rem, vertical padding 3rem/4rem, explicit gaps between groups. |
| `.claude/CLAUDE.md` §2 | Semantic tokens only; `focus-visible:focus-ring`; accessible names; errors never by colour alone; mobile-first; disabled at 50%; texts from the catalog as props; icons only through `icons.ts`. |
| General context, "Forma de trabajar" | API values are shown as they come (the `role` value on the profile). |

## 1. Scope

- Registration as a specialist or as a coffeeshop.
- Account pages: view the profile, edit it, change the password, deactivate the account, delete it permanently.

## 2. Out of scope

- Sign in, sign out, token refresh and the step-up mechanism (`add-auth`).
- The theme selector (user menu, `app-shell`) and the language selector (header).
- Security (2FA, passkeys): the API web page `/user/security`, already an external entry in the user menu.
- Password reset: stays in the API's web flow.
- The management entries of the user menu (`add-offering-management`, `add-specialist-evaluations`).
- Contacts (9.6, closed).
- Restoring a deactivated account: no contract operation.

## 3. Contract operations

All paths are from `contracts/openapi.yaml` on `develop` (verified 2026-10-06). The four writes use `/users/{user_ulid}`. `{user_ulid}` is the session's `data.ulid`; the API binds it by ULID (`tazavera-api` `HasPublicUlid::getRouteKeyName`).

| `operationId` | Method and path | Auth | Request body | 200/201 body |
|---|---|---|---|---|
| `registerAUser` | `POST /register` | Public (`security: []`) | `name`, `surname`, `email`, `password`, `passwordConfirmation` (all required), `role` (optional, `coffeeshop` \| `specialist` \| `user`) | `201` `{ data: { ulid, name, surname, email, role }, message }` |
| `getTheAuthenticatedUser` | `GET /user` | `profile:read` or `profile:write` | — | `{ data: { ulid, name, surname, email, role } }` |
| `updateAUser` | `PUT /users/{user_ulid}` | `profile:write` + owner | `name`, `surname`, `email` (all optional) | `{ data: {…}, message }` |
| `updateUserPassword` | `PUT /users/{user_ulid}/password` | `profile:write` + owner | `currentPassword`, `password`, `passwordConfirmation` (all required) | `{ message }` |
| `deactivateAUser` | `DELETE /users/{user_ulid}` | `profile:write` + owner | — | `{ message }`. Also revokes the user's tokens |
| `permanentlyDeleteAUser` | `DELETE /users/{user_ulid}/force` | `profile:write` + owner | — | `{ message }`. Also revokes the user's tokens |

What the contract documents beyond `200`/`201`: only `403 { message }` on the four writes. It documents no `422` and no `401` for any of the six (Open 1).

Checked read-only in `tazavera-api` (contract unclear; mismatches reported, never adapted to):
- **422 keys** (FormRequests):
  - `StoreUserRequest`: `name`, `surname`, `email` (required, valid, unique), `password` (required, strength, and `same:passwordConfirmation`), `passwordConfirmation` (required), `role`.
  - `UpdatePasswordRequest`: `currentPassword` (required, must match), `password`, `passwordConfirmation`.
  - `UpdateUserRequest`: `name`, `surname`, `email` (`sometimes`).
  - **A password mismatch is reported under `password`, not under `passwordConfirmation`.** This is the key that needed verifying.
- **Password strength** (`AppServiceProvider.php:84-90`): at least 8 characters, letters, mixed case, numbers; `uncompromised()` in production only.
- **403 without the write scope:** Passport's `CheckTokenForAnyScope` throws `MissingScopeException`, an `AuthorizationException`, so a read-only token gets `403 { message: "Invalid scope(s) provided." }` on the four writes (`routes/api.php:58`, `vendor/laravel/passport/src/Exceptions/MissingScopeException.php`). The contract's `403` example shows only the policy message. The front never reads the message text.
- **Token lifetimes** (`AppServiceProvider.php:55-56`): access token 30 minutes, refresh token 1 hour. Whether the refresh grant keeps the `profile:write` scope is **unverified** (expected: league/oauth2-server keeps the original scopes when none are requested).
- **Finding F1 (API mismatch, report only):** `UserController::store` reads `$data['role']` unconditionally. With no `role` in the body it raises an error inside the transaction and returns 500, although the contract and `StoreUserRequest` make `role` optional. The front always sends `role` (§5.1), so it is not affected.
- **API message language:** `SetLocale` picks `en` or `es` from `Accept-Language`, so Catalan gets English messages. The front shows catalog texts, never the API's `message` (§8).

## 4. Routes

Settled by merged code (criterion B, see Review log R1). Changing any of them would change visible links in `develop`.

| Route | Screen | Source |
|---|---|---|
| `/[locale]/register` | Registration as a specialist (`role: "specialist"`) | `HomeHero.tsx:82`, `AboutContent.tsx:122` |
| `/[locale]/register/coffeeshop` | Registration as a coffeeshop (`role: "coffeeshop"`) | `HomeHero.tsx:79`, `AboutContent.tsx:119` |
| `/[locale]/account/profile` | Profile view | `UserMenu.tsx:82` |
| `/[locale]/account/edit` | Edit profile | `UserMenu.tsx:83` |
| `/[locale]/account/password` | Change password | `UserMenu.tsx:84` |
| `/[locale]/account/deactivate` | Deactivate account | `UserMenu.tsx:85` |
| `/[locale]/account/delete` | Delete account permanently | `UserMenu.tsx:86` |

`/[locale]/account` without a sub-path is not created; nothing links to it. One page per route is the recommendation of Open 6.

## 5. Behaviour

### 5.1 Registration

- The form sends `name`, `surname`, `email`, `password`, `passwordConfirmation` and the route's `role` through the public request (no credentials; `add-auth` spec "Public endpoints need no session").
- **Pending:** the submit `Button` shows `loading`. The fields stay editable.
- **201:** next step, Open 3 (recommended: an "account created" panel with a sign-in button).
- **422:** a message under each field named in the response (Open 1). The form keeps every value except the two password fields, which are cleared.
- **Network error or 5xx:** a form-level error above the submit button; values kept.
- **Signed-in visitor:** Open 4.

### 5.2 Account pages, common

- **Session `loading`:** a loading status inside the card (§6.5).
- **Session `anonymous`:** Open 5 (recommended: a short text and a "Sign in" button calling `signIn()`).
- **Session `authenticated`:** each page loads its data with `getTheAuthenticatedUser` through the authenticated request (Open 7 explains why not only the session copy).
  - Loading: the loading status.
  - 200: the page content.
  - 401: handled by the client's recovery chain; if it ends `anonymous`, the page shows the anonymous state.
  - Network error or other status: a page error with a "Try again" button that repeats the request.

### 5.3 Writes and the step-up

The four writes need `profile:write`. When the step-up runs and what a `403` shows are Open 2. The recommended option, used in the rest of this summary:
1. The write is sent with the current token.
2. A `403` shows the **step-up notice** (§6.4): a text saying the action needs the user to confirm their identity, and a "Confirm identity" button whose click calls `requestProfileWrite(<current route>)` (inside the click, `add-auth` D10).
3. The popup keeps the page and its typed input (`add-auth` D10). After signing in again, the user activates the action again; the new token carries `profile:write`.
4. A declined step-up makes the session `anonymous` (settled in `add-auth`); the page then shows the anonymous state.

### 5.4 Edit profile (`updateAUser`)

- Prefilled from `GET /user`. All three fields are required in the form: the API's `sometimes|string` rejects an empty value (`UpdateUserRequest.php:28-30`; Laravel turns `""` into `null`).
- Sends `name`, `surname`, `email`.
- **200:** the fields take the returned `data`; a success status "Profile updated" (catalog text) appears above the actions. The header keeps the old name until Open 7 is settled.
- **403:** step-up notice. **422:** messages under `name`, `surname`, `email`. **Network/5xx:** form-level error.

### 5.5 Change password (`updateUserPassword`)

- Three password fields: current, new, confirmation.
- **200:** the three fields are cleared and a success status "Password changed" appears.
- **403:** step-up notice. **422:** messages under `currentPassword`, `password` (strength and mismatch), `passwordConfirmation`. **Network/5xx:** form-level error.

### 5.6 Deactivate and delete (`deactivateAUser`, `permanentlyDeleteAUser`)

- Each page explains the consequence and shows one action button. The button opens `ConfirmDialog` (`add-evaluation-scales` §5). Nothing is sent before the user confirms.
- **Pending:** the dialog's confirm button shows `loading`, Cancel is disabled, Escape is ignored (ConfirmDialog `pending`).
- **200:** the API has revoked the tokens. The page calls `signOut()`: the session becomes `anonymous` and the user lands on `/[locale]` (`add-auth` spec "Sign out"). Its `POST /logout` gets a `401` with the revoked token and is ignored by design (`add-auth` D5). No message is shown on the landing page.
- **403:** the dialog stays open and its `error` slot holds the step-up notice. This matches `add-evaluation-scales` §8 ("A 403 or a network error shows `error` and keeps it open").
- **Network/5xx:** the dialog's `error` slot shows the generic error; retry is allowed.

## 6. Components

### 6.1 Reused, unchanged

| Component | Variant and use |
|---|---|
| `Card`, `CardContent` (`src/shared/ui/Card.tsx`) | `layout="default"`, content region only. Holds every form and the profile view. No `CardAside`, no `CardFooter` |
| `Field` (`src/shared/ui/Field.tsx`) | `variant="default"`, `required` on every field of these forms. `error` carries the 422 message |
| `Input` (`src/shared/ui/Input.tsx`) | Default variant. `type="text"` with `autoComplete="given-name"` / `"family-name"`; `type="email"` with `autoComplete="email"` |
| `PasswordInput` (`src/shared/ui/PasswordInput.tsx`) | Default variant. `autoComplete="new-password"` for new and confirmation, `"current-password"` for current. `showPasswordLabel` / `hidePasswordLabel` from the catalog |
| `Button` (`src/shared/ui/Button.tsx`) | `variant="primary"`, `size="base"` for submit and page actions; `loading` while pending; `type="submit"` in forms. No other variant is used on these pages (see §9, F2) |
| `Link` (`src/shared/ui/Link.tsx`) | `variant="back"` to return to the profile from the four sub-pages (Open 6); `variant="default"` for the links listed below |
| `ConfirmDialog` (`add-evaluation-scales` §5) | Deactivate and delete. Not built yet (dependency) |
| Icons (`src/shared/ui/icons.ts`) | `Check` (success status), `Loader2` (loading status). No new icon |

### 6.2 New, inside this change

None is shared outside the change. Each is a composition of the components above.

| Part | Content | Accessible name and roles |
|---|---|---|
| Registration form | Name, surname, email, password, confirmation, submit | `<form>` with `aria-labelledby` pointing at the page `h1`; `noValidate` (Open 9) |
| Registration success panel | Heading, text, "Sign in" button (Open 3) | Heading `h2` with `tabIndex={-1}`; focus moves to it when the panel replaces the form |
| Profile view | `dl` with four rows: name, surname, email, role | Terms are the visible labels |
| Edit form, password form | The fields of §5.4 and §5.5, Save button | As the registration form |
| Form status | Success text with `Check`, or the form-level error | Success: `role="status"`. Error: `role="alert"`. The icon is `aria-hidden` |
| Step-up notice | Text and "Confirm identity" button | `role="alert"` on the text; the button is named by its label |
| Loading status | `Loader2` and a text | `role="status"`; the icon is `aria-hidden` and spins only without `prefers-reduced-motion` (Button's `motion-reduce:animate-none`) |
| Page error | Text and "Try again" button | `role="alert"` on the text |
| Danger zone (deactivate, delete pages) | Explanation and the action button | The button opens the dialog; the dialog is named by its title |

**Focus:**
- After a 422, focus moves to the first invalid field.
- Success and errors are announced by their live regions; focus stays where it is.
- `focus-visible:focus-ring` comes with every reused control; the new parts add no interactive element of their own.

**Errors never by colour alone:** every error is text (Field's message, `type-error` paragraphs); Field adds the boundary change and `aria-invalid`.

### 6.3 Page layout and spacing (criterion A)

Every value is an end state; the build chooses the utilities.

**Section and container (D14).**
- One `<section>` per page, full width, background `surface-page`, vertical padding 3rem below `md` and 4rem from `md`.
- Content container: centred, full width up to 72rem, side padding 1rem below `md` and 2rem from `md`.
- No border, radius or shadow on the section or the container.

**Column.**
- Registration: one column, full container width up to 32rem, centred (MVC `layouts/auth/simple.blade.php`: `max-w-sm sm:max-w-lg`, centred card).
- Account pages: one column, full container width up to 32rem, aligned to the container's start (MVC `components/settings/layout.blade.php` starts at the left).
- The column is a vertical stack: 1.5rem between the heading block and the card.

**Heading block.**
- Vertical stack, 0.5rem between its children.
- Back link (account sub-pages only, Open 6): `Link variant="back"`, 0.5rem above the `h1` (the stack gap).
- `h1`: `type-heading`.
- Intro: `type-body`, one paragraph.
- No margin of its own outside the stack; no border or padding.

**Card.**
- `Card` as built: `bg-surface-card`, `rounded-container`, a 4px left border in `border-border-accent`, `shadow-lg`. No other border.
- `CardContent` as built: 1.5rem padding on every side.
- Width: the full column (32rem at most).

**Form inside the card.**
- Vertical stack, 1.5rem between fields, between the last field and the form status, and between the form status and the actions row (MVC `register.blade.php` `gap-6`, `security.blade.php` `space-y-6`). An absent status takes no space.
- Field internals as built: label 0.5rem above the control; help and error 0.25rem below it.
- Name and surname stay stacked at every width (MVC order; the column is only 32rem wide).
- Password help (strength rule) is the `help` of the new-password field, not a separate block.

**Actions row.**
- Flex, wraps, 0.75rem gap in both directions, no padding, border or margin of its own.
- Registration: the submit button takes the full row width (MVC `register.blade.php:65` `w-full`).
- Account forms: buttons at their own width, aligned to the start (MVC `security.blade.php:32`).

**Form status, step-up notice and page error.**
- Form status: flex row, items aligned to the start, 0.5rem between the `Check` icon (1rem) and the text. No background, border, padding or radius.
- Step-up notice: vertical stack, 0.75rem between the text and its button; the button keeps its own width. No background, border, padding or radius.
- Page error: the same layout as the step-up notice, with the "Try again" button.

**Profile view.**
- `dl`: vertical stack, 1rem between rows.
- Each row: `dt` (`type-label`) above `dd` (`type-body`), 0.25rem between them.
- Below the `dl`, 1.5rem above: a link group (Open 6), flex, wraps, 1.5rem between columns and 0.5rem between rows (the `AboutContent.tsx` link-group values).

**Danger zone (deactivate, delete).**
- Vertical stack inside `CardContent`, 1.5rem between the explanation (`type-body`) and the action row.
- The action row follows the account actions row above.

**Registration success panel.**
- Replaces the form inside the same `CardContent`.
- Vertical stack, 1rem between the heading (`type-card-heading`), the text (`type-body`) and the actions row (account actions row values).

**Loading status.**
- Inside `CardContent`: flex row, items centred, 0.5rem between `Loader2` (1rem) and the text (`type-meta`).

**Width check at 375px** (computed by the design lead): 375 − 2 × 16 container padding = 343px column; minus 2 × 24 card padding and the 4px left border = 291px for the fields. No horizontal scroll expected.

### 6.4 Tokens and contrast

Measured by the design lead with an executed script (`scratchpad/contrast-account.mjs`, WCAG 2.2 relative luminance, values resolved from `globals.css` on `develop`; `action-4-bg` blended over `surface-card`). Every element sits on `surface-card` (inside the card) or on `surface-page` (heading block).

| Gated pair | Kind | Traditional | Dark | Gate | Guard today |
|---|---|---|---|---|---|
| `text-primary` / `surface-page` (h1, intro) | text | 6.41 | 14.28 | 4.5 ✔ | registered |
| `text-primary` / `surface-card` (values, card heading, success text) | text | 6.41 | 13.22 | 4.5 ✔ | registered |
| `text-primary` / `surface-card` (`Check` icon) | icon | 6.41 | 13.22 | 3 ✔ | — (decorative beside its text, not gated) |
| `text-label` / `surface-card` (field labels, `dt`) | text | 5.97 | 9.51 | 4.5 ✔ | **not registered** |
| `text-secondary` / `surface-card` (help, loading text) | text | 6.05 | 7.93 | 4.5 ✔ | **not registered** |
| `feedback-error` / `surface-card` (field and form errors) | text | 6.75 | 5.67 | 4.5 ✔ | registered |
| `text-link` / `surface-card`, `text-link-hover` / `surface-card` | text | 6.41 / 11.53 | 13.22 / 14.75 | 4.5 ✔ | registered |
| `text-link` / `surface-page` (back link) | text | 6.41 | 14.28 | 4.5 ✔ | same values as `text-primary` / `surface-page` (`text-link` = sage-800 / night-sage-100) |
| `action-primary-text` / `action-primary` and `-hover` | text | 6.85 / 11.67 | 5.38 / 6.64 | 4.5 ✔ | registered |
| `action-primary` / `surface-card` (button boundary, rest) | bound | 6.85 | **2.74** | 3 ✘ dark | finding F2 |
| `action-primary-hover` / `surface-card` (boundary, hover) | bound | 11.67 | **2.22** | 3 ✘ dark | finding F2 |
| `focus-ring` / `surface-card` | bound | 11.53 | 13.22 | 3 ✔ | registered |

Inputs keep the treatment `form-fields` already gates (`border-strong` / `surface-card`, registered). No new token. No colour is taken from the MVC.

**Pairs the guard tests (`theme-tokens.test.ts`, both theme matrices) must register:**
1. text `text-label` / `surface-card`
2. text `text-secondary` / `surface-card`

The dark primary boundary (F2) is not registered here: it is a defect of merged code and goes to its own change (§9).

### 6.5 Responsive behaviour

| Element | Below `md` (768px) | From `md` |
|---|---|---|
| Section | 3rem vertical, 1rem side padding | 4rem vertical, 2rem side padding |
| Column | Full container width | Up to 32rem; centred (registration) or at the start (account) |
| Fields | Stacked, full width | Same |
| Registration submit | Full width | Full width of the 32rem column |
| Account actions | Own width, wrapping | Same |
| ConfirmDialog | Its own rules (`add-evaluation-scales` §6) | Same |

Breakpoints are Tailwind's defaults (`md` 768px), as `globals.css` uses (`@media (min-width: 48rem)`). No horizontal scroll at 375px.

## 7. Texts (catalog)

New area `account`: `messages/{es,en,ca}/account.json`, loaded by each screen through `getMessages("account", locale)` and passed as props. Registration lives in the same area. Spanish texts follow the MVC where one exists (cited). Catalan is a **draft translation, unverified**; English follows the shell catalog's wording. Final copy is Product owner's.

| Key | es | en | ca |
|---|---|---|---|
| `registerSpecialistTitle` | Crea tu cuenta de especialista | Create your specialist account | Crea el teu compte d'especialista |
| `registerCoffeeshopTitle` | Registra tu cafetería | Register your coffeeshop | Registra la teva cafeteria |
| `registerIntro` | Ingresa tus datos a continuación para crear tu cuenta (MVC `register.blade.php:3`) | Enter your details below to create your account | Introdueix les teves dades per crear el teu compte |
| `nameLabel` | Nombre (MVC) | Name | Nom |
| `surnameLabel` | Apellido (MVC) | Surname | Cognom |
| `emailLabel` | Email (MVC) | Email | Correu electrònic |
| `passwordLabel` | Contraseña (MVC) | Password | Contrasenya |
| `newPasswordLabel` | Nueva contraseña | New password | Nova contrasenya |
| `currentPasswordLabel` | Contraseña actual | Current password | Contrasenya actual |
| `passwordConfirmationLabel` | Confirmar contraseña (MVC) | Confirm password | Confirma la contrasenya |
| `passwordHelp` | Al menos 8 caracteres, con mayúsculas, minúsculas y números | At least 8 characters, with upper and lower case letters and numbers | Almenys 8 caràcters, amb majúscules, minúscules i números |
| `showPassword` / `hidePassword` | Mostrar contraseña / Ocultar contraseña | Show password / Hide password | Mostra la contrasenya / Amaga la contrasenya |
| `registerSubmit` | Crear cuenta (MVC) | Create account | Crea el compte |
| `registerSuccessTitle` | Cuenta creada | Account created | Compte creat |
| `registerSuccessText` | Ya puedes iniciar sesión con tu email y tu contraseña. | You can now sign in with your email and password. | Ja pots iniciar sessió amb el teu correu i la contrasenya. |
| `signIn` | Iniciar sesión | Sign in | Iniciar sessió |
| `profileTitle` | Perfil | Profile | Perfil |
| `profileIntro` | Actualiza tu información personal (MVC `profile.blade.php:5`) | Your personal information | La teva informació personal |
| `roleLabel` | Rol | Role | Rol |
| `editTitle` / `passwordTitle` / `deactivateTitle` / `deleteTitle` | The shell's menu labels (Editar perfil, Cambiar contraseña, Desactivar cuenta, Eliminar cuenta) | Edit profile, Change password, Deactivate account, Delete account | Editar perfil, Canviar contrasenya, Desactivar compte, Eliminar compte |
| `save` | Guardar | Save | Desa |
| `backToProfile` | Volver al perfil | Back to profile | Torna al perfil |
| `profileUpdated` | Perfil actualizado | Profile updated | Perfil actualitzat |
| `passwordUpdated` | Contraseña cambiada | Password changed | Contrasenya canviada |
| `deactivateText` | Tu cuenta quedará desactivada y se cerrará tu sesión. | Your account will be deactivated and you will be signed out. | El teu compte quedarà desactivat i es tancarà la sessió. |
| `deleteText` | Se eliminarán tu cuenta y todos sus datos de forma permanente. (MVC `delete-user-form.blade.php:19`) | Your account and all of its data will be permanently deleted. | El teu compte i totes les seves dades s'eliminaran de manera permanent. |
| `deactivateConfirmTitle` / `deleteConfirmTitle` | ¿Desactivar tu cuenta? / ¿Seguro que quieres eliminar tu cuenta? (MVC) | Deactivate your account? / Are you sure you want to delete your account? | Desactivar el compte? / Segur que vols eliminar el compte? |
| `confirmDeactivate` / `confirmDelete` | Desactivar cuenta / Eliminar cuenta | Deactivate account / Delete account | Desactiva el compte / Elimina el compte |
| `cancel` | Cancelar | Cancel | Cancel·la |
| `stepUpText` | Para continuar, confirma tu identidad iniciando sesión de nuevo. | To continue, confirm your identity by signing in again. | Per continuar, confirma la teva identitat iniciant sessió de nou. |
| `stepUpButton` | Confirmar identidad | Confirm identity | Confirma la identitat |
| `signedOutText` | Inicia sesión para gestionar tu cuenta. | Sign in to manage your account. | Inicia sessió per gestionar el teu compte. |
| `loading` | Cargando… | Loading… | Carregant… |
| `genericError` | No se pudo completar la acción. Inténtalo de nuevo. | The action could not be completed. Please try again. | No s'ha pogut completar l'acció. Torna-ho a provar. |
| `loadError` | No se pudo cargar tu perfil. | Your profile could not be loaded. | No s'ha pogut carregar el teu perfil. |
| `retry` | Intentar de nuevo | Try again | Torna-ho a provar |
| Field errors | Open 1 | | |
| Signed-in visitor on registration | Open 4 | | |

The `role` value on the profile is shown as the API returns it (`specialist`, `coffeeshop`; settled by the general context).

## 8. Error presentation summary

| Response | Where it shows | Text source |
|---|---|---|
| 422 | Under each field named in the response; keys outside the form go to the form-level error | Open 1 |
| 403 on a write | Step-up notice (page) or the dialog's `error` slot | `stepUpText`, `stepUpButton` |
| 401 | Never shown: the client's recovery chain; an `anonymous` end shows the signed-out state | `signedOutText` |
| Network error, 5xx, any other status | Form-level error (forms), page error (loads), dialog `error` (destructive actions) | `genericError`, `loadError` |

The API's `message` is never rendered (texts come from the catalog; `SetLocale` has no Catalan).

## 9. Findings on existing code and contract

- **F1 — API: `role` optional in the contract, required in practice.** `UserController::store` fails with 500 when `role` is missing (§3). Workflow §4: not front code; report to Product owner for the API. The front is unaffected because it always sends `role`.
- **F2 — `base-controls`: primary button boundary in the dark theme.** `action-primary` / `surface-card` measures 2.74 at rest and 2.22 on hover (gate 3, measured). Same defect as `add-evaluation-scales` F1. Merged code → **new change** in `base-controls`. This summary uses only `primary` buttons to avoid the worse `action-4` boundary (1.46 / 1.29, `add-evaluation-scales` F2).
- **F3 — `add-auth`: no way to refresh the session profile after an update.** `@/features/auth` exposes `useSession`, `signIn`, `signOut`, `requestProfileWrite`, `completeCallback` only (`src/features/auth/index.ts`, `feature/add-auth`). See Open 7.
- **F4 — Contract: no 422 documented** on any of the six operations, nor on any other operation of the contract (`git grep 422` on `develop` finds only a field description). See Open 1.

## 10. Tests (expected, for the architect's tasks)

**Registration:**
- the specialist route sends `role: "specialist"`, the coffeeshop route `role: "coffeeshop"`, with camelCase `passwordConfirmation`;
- the request is public (no `Authorization` header);
- the submit button is `loading` while pending;
- 201 shows the success panel and moves focus to its heading;
- 422 places each message under its field (including a mismatch under `password`), focuses the first invalid field and clears both password fields;
- a network error shows the form-level error and keeps the values.

**Account pages:**
- `loading` shows the loading status; `anonymous` shows the signed-out text and the sign-in button;
- a failed `GET /user` shows the page error, and "Try again" repeats it;
- the profile view renders the four values from `GET /user`, `role` as returned;
- edit is prefilled and sends `PUT /users/{ulid}` with the session ulid; 200 shows "Profile updated" and the returned values;
- password: 200 clears the three fields and shows "Password changed";
- 403 on either form shows the step-up notice, and its button calls `requestProfileWrite` with the current route synchronously in the click;
- nothing is sent from deactivate or delete before the dialog's confirm;
- confirm sends the right `DELETE`; 200 calls `signOut()`; 403 shows the step-up notice in the dialog and keeps it open;
- every text comes from props (no literal copy in components).

**Guards:**
- register the two pairs of §6.4 in both theme matrices;
- the catalog has the same keys in es, en and ca (if the project has such a test; otherwise unverified).

**Verification task:** captures at 375px and 1280px of each route in both themes, with the API or a local mock of `GET /user` and the writes.

## 11. Visual reference

No capture is in this folder yet. Product owner adds, from the MVC (`C:/Porjects/Full Stack/Sprint4/MVC/tazavera-app`):
1. Registration: `livewire/auth/register.blade.php` in `layouts/auth/simple.blade.php`, at 375px and 1280px.
2. Profile settings: `livewire/settings/profile.blade.php` in `components/settings/layout.blade.php`.
3. Password: `livewire/settings/security.blade.php` (the "Update password" block).
4. Delete account with the modal open: `livewire/settings/delete-user-form.blade.php`.

Wireframe of the target layout (design lead; spacing from §6.3):

```
375px                                   1280px
┌───────────────────────────┐           ┌───────────────── section (surface-page) ─────────────────┐
│ 3rem                       │           │ 4rem                                                     │
│ 1rem ← Back to profile     │           │ 2rem  ← Back to profile                                  │
│      Edit profile (h1)     │           │       Edit profile (h1)                                  │
│      intro                 │           │       intro                                              │
│      1.5rem                │           │       1.5rem                                             │
│ ┃┌───── card ──────────┐   │           │ ┃┌──── card, max 32rem ────┐                              │
│ ┃│ 1.5rem padding       │  │           │ ┃│ Name *                   │                              │
│ ┃│ Name *  [________]   │  │           │ ┃│ [______________________] │                              │
│ ┃│ 1.5rem               │  │           │ ┃│ Surname * ... Email * ...│                              │
│ ┃│ Surname * [______]   │  │           │ ┃│ ✓ Profile updated        │                              │
│ ┃│ Email * [________]   │  │           │ ┃│ (Save)                   │                              │
│ ┃│ (Save)               │  │           │ ┃└──────────────────────────┘                              │
│ ┃└──────────────────────┘  │           │                                                          │
└───────────────────────────┘           └──────────────────────────────────────────────────────────┘
```

## Open

1. **422 format and field messages.**
   - Question: the contract documents no `422` for these operations (F4), yet the forms must map errors to fields. AGENTS.md forbids error formats that do not trace to the contract. Which source and which texts?
   - Options:
     - a) Product owner documents the `422` response (Laravel's `{ message, errors: { <key>: string[] } }`) in the API's Scribe annotations, regenerates `contracts/openapi.yaml` and `schema.ts`. The front maps `errors` keys to fields and shows one catalog message per field key (for example `emailError`: "Check the email: it must be valid and not already registered"), because the API's texts have no Catalan.
     - b) As a), but the front shows the API's first message for each key, sending `Accept-Language` (Catalan falls back to English).
     - c) No field mapping: any 4xx other than 403 shows the form-level error only.
   - Recommendation: a). The field keys are verified (§3), catalog texts keep the three locales, and the form-fields spec already expects "an API validation response". The contract change is Product owner's.
   - Source: AGENTS.md "API contract"; `tazavera-api` FormRequests; `SetLocale.php`.
   - **Answered 2026-10-06 (Product owner): c).** Any 422 shows the generic form-level error; no field mapping and no contract change. Field mapping goes to `docs/backlog.md` R8.
   - Blocks propose: no.

2. **Step-up timing and 403 handling (was 9.3 and 9.7).**
   - Question: when does the step-up run, and what does a `403` show?
   - Constraint (verified in `feature/add-auth`): the popup must open synchronously inside a click, and `requestProfileWrite` returns no completion signal, so the front cannot send the write automatically after the step-up.
   - Options:
     - a) Step-up on every submit: Save opens the login popup; the user clicks Save again after signing in. Asks for a login on every write.
     - b) Send with the current token; a `403` shows the step-up notice (§5.3); after the step-up the user activates the action again. One login per write-token lifetime (access 30 min, refresh 1 h, verified; scope kept on refresh is unverified).
     - c) As a), but `add-auth` returns a promise or event from `requestProfileWrite` so the write is sent automatically. Changes a shared mechanism of a change in Build.
     - d) Step-up when the page opens (an "Unlock editing" button). Asks for a login even when the user only looks.
   - Recommendation: b). It uses `add-auth` as built, resolves 9.7 at the same time (a `403` means "needs the write scope", since the user owns the ulid), and keeps typed input. Product owner's earlier recommendation was a); b) differs only in that the first attempt may succeed without a login. If chosen, the decisions log should record it for `add-offering-management`, whose offering deletes also need `profile:write` (`routes/api.php:41-43`).
   - **Answered 2026-10-06 (Product owner): b).** Reactive step-up after a `403`; the user activates the action again after the step-up.
   - Blocks propose: no.

3. **After registration (was 9.2).**
   - Question: what follows a `201`?
   - Options:
     - a) The success panel (§6.3) with "Sign in" calling `signIn()`; the popup leaves the user on the registration route, signed in (`add-auth` D10: the opener never navigates).
     - b) Start sign in automatically. Not possible without a click (popup blocked; the fallback redirect would leave the page).
   - Recommendation: a), Product owner's recommendation. With a), Open 4 decides what the panel becomes once the session is `authenticated`.
   - **Answered 2026-10-06 (Product owner): a).** Success panel with a "Sign in" button that calls `signIn()` inside the click.
   - Blocks propose: no.

4. **Registration route for a signed-in visitor.**
   - Question: what does `/[locale]/register*` show when the session is `authenticated` (including right after the sign-in of Open 3)?
   - Options:
     - a) No form: the heading, a text "You are signed in" and a `Link` to `/[locale]`.
     - b) Redirect to `/[locale]`.
     - c) The form, as for anyone.
   - Recommendation: a). It mirrors the MVC's guest-only registration without a redirect, and gives the post-sign-in panel a clear next step. Texts `alreadySignedInText`, `goHome` would join the catalog.
   - **Answered 2026-10-06 (Product owner): b).** An authenticated visitor never sees the registration page: when the session is `authenticated`, `/[locale]/register*` navigates to `/[locale]` (client-side, so the in-memory tokens survive). This includes the moment right after signing in from the success panel of Open 3. While `loading`, the page waits. No new texts.
   - Blocks propose: no.

5. **Account pages without a session.**
   - Question: what do the account routes show while `loading` and when `anonymous`?
   - Options:
     - a) `loading`: the loading status in the card. `anonymous`: `signedOutText` and a "Sign in" button calling `signIn()` (returns to the same route).
     - b) Redirect anonymous visitors to `/[locale]`.
   - Recommendation: a). No redirect logic, and a declined step-up (settled to end `anonymous`) leaves the user where they were with a way back.
   - **Answered 2026-10-06 (Product owner): a).** `loading`: the loading status in the card. `anonymous`: `signedOutText` and a "Sign in" button that calls `signIn(currentRoute)` inside the click (popup; the user stays on the route). No automatic redirect. The same rule applies to `/manage/offerings*` and `/manage/evaluations*`. (Replaces an earlier answer of the same day, automatic sign in, so the user sees what is happening.)
   - Blocks propose: no.

6. **Layout: one page per action, and in-page navigation (was 9.8).**
   - Question: one settings page with sections, or one page per action? And how does the user move between them?
   - Options:
     - a) One page per route of §4 (the routes the user menu already links). The four sub-pages carry a back link to the profile; the profile carries links to edit and to password. Deactivate and delete are reached only from the user menu.
     - b) As a), without the in-page links (the user menu only).
     - c) One page with sections, as the MVC settings (`profile.blade.php` holds the delete form). The five menu routes would then need anchors or a change to `UserMenu.tsx` (`app-shell`).
   - Recommendation: a). It matches the merged menu with no `app-shell` change; the extra links reuse `Link` and add no token.
   - **Answered 2026-10-06 (Product owner): c).** One account settings page with sections (profile, edit, password, deactivate, delete), replacing the five routes of §4. Pages that live in the API stay there and are reached as external links: security (`{API}/user/security`, 2FA and passkeys) and password reset (API web flow). This changes the user menu (`UserMenu.tsx:82-86`, `app-shell`): the change carries an `app-shell` delta. Sub-points (Product owner, 2026-10-06):
     - Route: `/[locale]/account`. The five sub-routes of §4 are not created.
     - User menu: one entry "My account" → `/[locale]/account` replaces the five account entries; the external Security entry stays.
     - Sections, in order: Profile (view and edit in the same block) → Password → Security (external link to `{API}/user/security`) → a "Danger zone" at the end with Deactivate and Delete, each behind its confirmation dialog.
   - §4, §6 and §7 still describe one page per route and must be redrafted to this answer.
   - Blocks propose: yes, until those sections are redrafted.

7. **Header name after a profile update.**
   - Question: the header shows the session's name. After `updateAUser`, the session keeps the old one until the next load (F3). Fix it?
   - Options:
     - a) This change adds a `refreshProfile()` to `@/features/auth` (re-runs `GET /user` into the session) once `add-auth` is merged, under this change's scope, as `add-auth` did with `app-shell` files.
     - b) Accept the stale header until the next page load (silent re-authentication reloads the profile).
     - c) A refactor change in `auth` first.
   - Recommendation: a). It is small and keeps one owner of user data (`add-auth` spec "Session states and profile"). It touches a shared module, so it is Product owner's call.
   - **Answered 2026-10-06 (Product owner): a).** After a successful `updateAUser`, `refreshProfile()` re-runs `GET /user` (the only source of user data, add-auth D5) and settles the session; the `PUT` response body is not written into the session. On a network or 5xx failure it retries once after a short pause; if that fails too, the session keeps the previous user, with no error shown. A `401` is already recovered by the add-auth client. The header updates through the session store.
   - Blocks propose: no.

8. **Section and container classes (D14) duplication.**
   - Question: `HomeScreen.tsx` and `AboutContent.tsx` already hold copies of the D14 section and container classes. This change adds seven screens.
   - Options:
     - a) Product owner adds the pending backlog candidate ("shared section primitive", general context item 8), and a refactor change in `content-structure` lands first; this change uses it.
     - b) This change keeps one copy, in a single shared place inside its own slices (for example one account layout used by all account screens, and one in registration), and the backlog entry records three copies.
   - Recommendation: a) by criterion C, if the delivery date allows it; otherwise b) with the backlog entry.
   - **Answered 2026-10-06 (Product owner): a).** A refactor change in `content-structure` adds the shared section and container primitive first; this change uses it.
   - Blocks propose: no (waits for the refactor to be merged).

9. **Client-side checks and native validation.**
   - Question: Field marks controls `required`, so browsers show their own validation bubbles in the browser's language, not the catalog's.
   - Options:
     - a) Forms are `noValidate`; before sending, the client checks only that required fields are not empty and that the new password equals its confirmation, showing catalog messages under the fields; the API validates the rest.
     - b) Forms are `noValidate`, with no client checks: the API's 422 does all validation (depends on Open 1).
     - c) Native validation as is.
   - Recommendation: a). The texts stay in the catalog and the user gets an answer without a round trip; the rules mirror only `required` and `same`, verified in the FormRequests.
   - **Answered 2026-10-06 (Product owner): a), limited to the rules the contract states.** Forms are `noValidate`. Before sending, the client checks only what each operation's `requestBody` in `contracts/openapi.yaml` documents: the `required` fields are not empty, the email is a valid address ("Must be a valid email address"), and the new password equals its confirmation ("must match"). Messages come from the catalog (es/en/ca) under each `Field`. Password strength ("default strength rules", not detailed in the contract), email uniqueness and the current password are left to the API, whose 422 shows the generic message (Open 1) until backlog R8 documents the 422.
   - Blocks propose: no.

10. **"Already have an account? Sign in" under the registration form.**
    - Question: the MVC shows it (`register.blade.php:71-74`). Keep it?
    - Options: a) omit it, since the header carries "Sign in" on every page; b) keep it, as a text and a `primary` `size="sm"` button calling `signIn()`, 1.5rem below the form, centred.
    - Recommendation: a). It avoids a second primary action on the page.
    - Blocks propose: no.

11. **ConfirmDialog availability.**
    - Question: the dialog belongs to `add-evaluation-scales`, whose base (shadcn AlertDialog or own) is still open there.
    - Options: a) this change waits for `add-evaluation-scales` to merge; b) the dialog moves to its own small change in `feedback` that both consume.
    - Recommendation: a). It keeps one owner; the order is in the dependency analysis.
    - Blocks propose: no (it orders the apply, not the spec).

12. **Visual reference captures.**
    - Question: the folder has no MVC capture (rule of 4 Oct).
    - Options: a) Product owner adds the four captures of §11; b) the wireframe of §11 stands as the mock-up.
    - Recommendation: a).
    - Blocks propose: no.

## Review log

- **2026-10-06, design lead (review of Product owner's draft).**
  - Reflected the closed points: 9.1 (camelCase body, optional `role`) and 9.6 (contacts out). 9.2 and 9.3 are kept open with Product owner's recommendations (Open 3, Open 2); 9.7 is merged into Open 2.
  - **R1 — routes (criterion B, contradiction with merged code).** The draft left the registration paths open (9.5). The merged landing already links `/[locale]/register` and `/[locale]/register/coffeeshop`, and the merged user menu links the five `/[locale]/account/*` routes. Any other path would change what `develop` shows, so §4 takes the merged paths. Product owner may reopen it through a change to landing and app-shell.
  - **R2 — endpoint paths.** The draft's paths were checked against the contract on `develop`: the writes are `/users/{user_ulid}`, `/users/{user_ulid}/password` and `/users/{user_ulid}/force`, and the read is `/user`. The orchestrator's note that the writes use `/user` does not match the contract; the draft's form was right apart from the parameter name. Added the `operationId`s.
  - **R3 — step-up wording.** The draft said the step-up uses `prompt=login`. The front sends no `prompt` for it; the API forces the login itself (`RequireLoginForWriteScope.php`). Wording fixed.
  - **R4 — 403 premise.** The draft framed 9.7 as "a token without `profile:write` after a failed step-up". The `add-auth` spec makes a failed step-up end `anonymous`, so that case cannot occur; a `403` instead means the token never had, or no longer has, the write scope. Open 2 reflects it.
  - **R5 — 422 key for passwords (verified).** A mismatch is reported under `password` (`same:passwordConfirmation` on `password`), in both registration and password change.
  - Added: settled inputs, contract table with response states, behaviour per operation, components with variants and accessible names, page layout and spacing per element (criterion A, D14), contrast measured by script in both themes, guard pairs, responsive table, catalog texts in three locales, tests, visual reference list and wireframe, findings F1–F4.
  - Not settled here (listed under Open): everything Product owner has not answered.
