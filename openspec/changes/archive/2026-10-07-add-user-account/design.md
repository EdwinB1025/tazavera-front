# Design

## Context

See proposal.md for the motivation. The state this design builds on (all merged on `develop`):

- Primitives: `PageSection` (D14 section and container values), `Card`/`CardContent`, `Field`, `Input`, `PasswordInput`, `Button` (with `loading` and the `action-2` treatment of `fix-button-boundaries`), `Link`, and the icon entry point `src/shared/ui/icons.ts` (`Check`, `Loader2` exist).
- `auth` (`add-auth`): `useSession`, `signIn(returnRoute?)`, `signOut`, `requestProfileWrite(returnRoute)` and `completeCallback` are exported from `@/features/auth`; the authenticated client `request` and the public `publicRequest` come from `@/shared/api`. `requestProfileWrite(returnRoute)` (`src/features/auth/api/authorize.ts:76-77`) opens the write-scope popup inside the click and keeps the route and its typed input; a declined or failed step-up leaves the session `anonymous`. `signIn()` with no argument already targets the current route (`authorize.ts:71-73`).
- The API client's `401` chain (`src/shared/api/client.ts:45-64`): one refresh, one retry, then silent re-authentication, then `anonymous`. Any other status reaches the caller.
- The user menu links to five account routes that do not exist (`src/widgets/app-header/ui/UserMenu.tsx:81-87`), the security entry is a native anchor to `{API}/user/security` (`UserMenu.tsx:114`, `:139`), and the landing pages already link to the two registration routes (`src/pages/home/ui/HomeHero.tsx:79` coffeeshop, `:82` specialist; `src/pages/about/ui/AboutContent.tsx:115` coffeeshop, `:118` specialist).
- `ConfirmDialog` belongs to `add-evaluation-scales` (its §5; base settled at its propose: shadcn AlertDialog on the installed `radix-ui`, its design.md D8) and is not merged yet (Open 11, answer a).
- The API forces a fresh login for `profile:write` whatever the client sends (`tazavera-api` `RequireLoginForWriteScope.php`), so the front sends no `prompt=login`.

### API endpoints consumed

All paths from `contracts/openapi.yaml` (verified 2026-10-06). The four writes address `/users/{user_ulid}` with `{user_ulid}` = the session user's `data.ulid`.

| `operationId` | Method and path | Auth | Request | 200/201 response | Errors |
|---|---|---|---|---|---|
| `registerAUser` | `POST /register` | none (public, `security: []`) | `name`, `surname`, `email`, `password`, `passwordConfirmation` (all required), `role` (optional enum `coffeeshop` \| `specialist` \| `user`) | `201 { data: { ulid, name, surname, email, role }, message }` | only `422` is plausible and is undocumented |
| `getTheAuthenticatedUser` | `GET /user` | `profile:read` or `profile:write` | — | `{ data: { ulid, name, surname, email, role } }` | consumed through the session and the profile refresh |
| `updateAUser` | `PUT /users/{user_ulid}` | `profile:write` + owner | `name`, `surname`, `email` — all optional (`requestBody` documents no required field) | `{ data: {…}, message }` | `403 { message }` |
| `updateUserPassword` | `PUT /users/{user_ulid}/password` | `profile:write` + owner | `currentPassword`, `password`, `passwordConfirmation` (all required) | `{ message }` | `403 { message }` |
| `deactivateAUser` | `DELETE /users/{user_ulid}` | `profile:write` + owner | — | `{ message }`; also revokes the user's tokens | `403 { message }` |
| `permanentlyDeleteAUser` | `DELETE /users/{user_ulid}/force` | `profile:write` + owner | — | `{ message }`; also revokes the user's tokens | `403 { message }` |

The contract documents no `422` and no `401` (summary F4). Read-only checks in `tazavera-api` (never adapted to): a password mismatch is reported under `password` (`StoreUserRequest`, `UpdateUserRequest`, `UpdatePasswordRequest`); password strength (`AppServiceProvider.php:84-90`) is shown as help text only; a missing write scope answers `403 { message }` (Passport `MissingScopeException`); `UserController::store` reads `$data['role']` unconditionally, so the front always sends `role` (summary F1); `{API}/user/security` (`routes/web.php:10`, `auth:web`, `password.confirm`) and `{API}/forgot-password` (Fortify `config/fortify.php:89,165`) are the API's own pages.

### How API errors are presented

| Response | Where it shows | Text source |
|---|---|---|
| Client check fails | under each failing field; nothing is sent | `requiredError`, `emailFormatError`, `passwordMismatchError` |
| `422` | generic form-level error above the actions (forms) or the dialog's error area (destructive actions) | `genericError` |
| `403` on a write | the step-up notice in the section, or the dialog's error area | `stepUpText`, `stepUpButton` |
| `401` | never shown: the client's recovery chain runs; an `anonymous` end shows the signed-out state | `signedOutText` |
| network failure, `5xx`, any other status | generic form-level error (forms) or the dialog's error area (destructive actions) | `genericError` |
| a profile refresh fails twice | nothing; the session keeps the previous user | — |

The API's `message` is never rendered (summary §8). Field mapping of the `422` is backlog R8 and out of scope.

### Card sections filled from the API (shared card)

| Card / section | Source |
|---|---|
| Profile card — role row | `data.role` of the session user, shown as the API returns it |
| Profile card — name field | `data.name` |
| Profile card — surname field | `data.surname` |
| Profile card — email field | `data.email` |
| Password card, Security card, Danger zone card, registration card | no API data shown; they send or navigate only |

## Derived and UI-specific types

Defined before any component, built from `operations` of `src/shared/api/schema.ts` and exported from `src/shared/api/index.ts` beside the existing session aliases (`Session`, `SessionUser` are imported from there and never redeclared — `src/shared/api/session-types-guard.test.ts` enforces it):

```ts
export type RegisterPayload =
  operations["registerAUser"]["requestBody"]["content"]["application/json"];
export type ProfileUpdatePayload =
  NonNullable<operations["updateAUser"]["requestBody"]>["content"]["application/json"];
export type PasswordUpdatePayload =
  operations["updateUserPassword"]["requestBody"]["content"]["application/json"];
```

No generated type is edited or redefined (`src/shared/api/schema.ts` stays byte-for-byte). The responses need no derived type: no response body is rendered and none is written into the session (D5). Every other new type is UI-specific — each component's texts type (`RegisterFormTexts`, `ProfileFormTexts`, …), declared in its own file before the component, exactly as `UserMenuTexts` precedes `UserMenu`.

## Goals / Non-Goals

**Goals:**

- One vertical slice per screen interaction, each ending at real rendered text with every state covered (loading, empty, success, error).
- The `src/features/user-account` slice stays self-contained: it receives the session and the auth actions as input and imports nothing from another feature.
- All copy comes from the `account` catalog area through props; no literal interface text (app-shell "Localized interface texts").

**Non-Goals:**

- No new token, primitive or shared component beyond the classes export of D4; `base-controls`, `form-fields`, `content-structure` and `feedback` specs are untouched.
- No change to the sign-in, sign-out, token or step-up mechanisms of `auth` beyond the profile refresh (D5).
- No field mapping of `422` responses (backlog R8) and no change to `contracts/openapi.yaml` or `src/shared/api/schema.ts`.

## Decisions

### D1. The page slices inject the session and the auth actions (settled by Product owner, B1)

The screens in `src/pages/register` and `src/pages/account` inject the session and the auth actions (`signIn`, `signOut`, `requestProfileWrite`, `refreshProfile`) as props into the `src/features/user-account` components, as `SessionShell` does for `AppHeader`; no feature imports another feature, and `features/user-account` stays one slice. Each screen keeps the settled split: a server component loads the `account` catalog (`getMessages`, `src/shared/lib/i18n`) and renders the page and the client region, and a `"use client"` component of the same page slice (`RegisterClient`, `AccountClient`) runs the injection — the session comes from `useSession()` and the actions from `@/features/auth`; functions cannot cross the server boundary, so the seam is where the hook runs. Alternative considered: having the user-account components call `useSession` themselves — rejected by B1 (it would make a feature import another feature).

### D2. Client checks per operation (settled by Product owner, B2; the "validación de formularios en el navegador" decision)

The forms are `noValidate` and check only what the operation's `requestBody` documents in the contract:

- Registration (`registerAUser`): the five fields are required, the email must be a valid address, and `passwordConfirmation` must equal `password`; each failure shows its catalog message under the field (`aria-invalid`), focus moves to the first failing field, and nothing is sent.
- Profile (`updateAUser`): the operation documents **no required field**, so the form validates only the email format. No field is required and none carries the `required` marker. An emptied field is sent as-is and its `422` shows the generic form-level error (B2). The email-format check runs on the value the field holds; an empty email is not a format failure and is sent like any other emptied field.
- Password (`updateUserPassword`): the three fields are required and the confirmation must equal the new password.

Strength, uniqueness and the current password belong to the API and surface as the generic error.

### D3. Texts: the `account` catalog area and the `shell` keys

New area `account` — `messages/{es,en,ca}/account.json`, loaded by each screen and passed as props. Spanish follows the MVC where one exists (cited in the summary §7); Catalan is a draft translation, unverified; English follows the `shell` catalog's wording. Final copy is Product owner's. The dialog descriptions reuse `deactivateText` and `deleteText`; no description key is added.

**Registration**

| Key | es | en | ca |
|---|---|---|---|
| `registerSpecialistTitle` | Crea tu cuenta de especialista | Create your specialist account | Crea el teu compte d'especialista |
| `registerCoffeeshopTitle` | Registra tu cafetería | Register your coffeeshop | Registra la teva cafeteria |
| `registerIntro` | Ingresa tus datos a continuación para crear tu cuenta | Enter your details below to create your account | Introdueix les teves dades per crear el teu compte |
| `registerSubmit` | Crear cuenta | Create account | Crea el compte |
| `registerSuccessTitle` | Cuenta creada | Account created | Compte creat |
| `registerSuccessText` | Ya puedes iniciar sesión con tu email y tu contraseña. | You can now sign in with your email and your password. | Ja pots iniciar sessió amb el teu correu i la contrasenya. |

**Fields (shared by the forms)**

| Key | es | en | ca |
|---|---|---|---|
| `nameLabel` | Nombre | Name | Nom |
| `surnameLabel` | Apellido | Surname | Cognom |
| `emailLabel` | Email | Email | Correu electrònic |
| `passwordLabel` | Contraseña | Password | Contrasenya |
| `newPasswordLabel` | Nueva contraseña | New password | Nova contrasenya |
| `currentPasswordLabel` | Contraseña actual | Current password | Contrasenya actual |
| `passwordConfirmationLabel` | Confirmar contraseña | Confirm password | Confirma la contrasenya |
| `passwordHelp` | Al menos 8 caracteres, con mayúsculas, minúsculas y números | At least 8 characters, with upper and lower case letters and numbers | Almenys 8 caràcters, amb majúscules, minúscules i números |
| `showPassword` / `hidePassword` | Mostrar contraseña / Ocultar contraseña | Show password / Hide password | Mostra la contrasenya / Amaga la contrasenya |
| `requiredError` | Este campo es obligatorio. | This field is required. | Aquest camp és obligatori. |
| `emailFormatError` | Introduce un email válido. | Enter a valid email address. | Introdueix un correu vàlid. |
| `passwordMismatchError` | Las contraseñas no coinciden. | The passwords do not match. | Les contrasenyes no coincideixen. |

**Account page**

| Key | es | en | ca |
|---|---|---|---|
| `accountTitle` | Mi cuenta | My account | El meu compte |
| `accountIntro` | Gestiona tus datos, tu contraseña y la seguridad de tu cuenta. | Manage your details, your password and your account security. | Gestiona les teves dades, la contrasenya i la seguretat del compte. |
| `profileHeading` | Perfil | Profile | Perfil |
| `profileDescription` | Actualiza tu información personal | Update your personal information | Actualitza la teva informació personal |
| `roleLabel` | Rol | Role | Rol |
| `passwordHeading` | Contraseña | Password | Contrasenya |
| `forgotPasswordLink` | ¿Olvidaste tu contraseña? | Forgot your password? | Has oblidat la contrasenya? |
| `securityHeading` | Seguridad | Security | Seguretat |
| `securityDescription` | Autenticación en dos pasos y llaves de acceso. | Two-factor authentication and passkeys. | Autenticació en dos passos i claus d'accés. |
| `securityLink` | Gestionar la seguridad | Manage security | Gestiona la seguretat |
| `dangerZoneHeading` | Zona peligrosa | Danger zone | Zona perillosa |
| `deactivateHeading` | Desactivar cuenta | Deactivate account | Desactivar el compte |
| `deactivateText` | Tu cuenta quedará desactivada y se cerrará tu sesión. | Your account will be deactivated and you will be signed out. | El teu compte quedarà desactivat i es tancarà la sessió. |
| `deleteHeading` | Eliminar cuenta | Delete account | Eliminar el compte |
| `deleteText` | Se eliminarán tu cuenta y todos sus datos de forma permanente. | Your account and all of its data will be permanently deleted. | El teu compte i totes les seves dades s'eliminaran de manera permanent. |
| `deactivateConfirmTitle` / `deleteConfirmTitle` | ¿Desactivar tu cuenta? / ¿Seguro que quieres eliminar tu cuenta? | Deactivate your account? / Are you sure you want to delete your account? | Desactivar el compte? / Segur que vols eliminar el compte? |
| `confirmDeactivate` / `confirmDelete` | Desactivar cuenta / Eliminar cuenta | Deactivate account / Delete account | Desactiva el compte / Elimina el compte |
| `cancel` | Cancelar | Cancel | Cancel·la |
| `save` | Guardar | Save | Desa |
| `profileUpdated` | Perfil actualizado | Profile updated | Perfil actualitzat |
| `passwordUpdated` | Contraseña cambiada | Password changed | Contrasenya canviada |

**States**

| Key | es | en | ca |
|---|---|---|---|
| `signIn` | Iniciar sesión | Sign in | Iniciar sessió |
| `signedOutText` | Inicia sesión para gestionar tu cuenta. | Sign in to manage your account. | Inicia sessió per gestionar el teu compte. |
| `stepUpText` | Para continuar, confirma tu identidad iniciando sesión de nuevo. | To continue, confirm your identity by signing in again. | Per continuar, confirma la teva identitat iniciant sessió de nou. |
| `stepUpButton` | Confirmar identidad | Confirm identity | Confirma la identitat |
| `loading` | Cargando… | Loading… | Carregant… |
| `genericError` | No se pudo completar la acción. Inténtalo de nuevo. | The action could not be completed. Please try again. | No s'ha pogut completar l'acció. Torna-ho a provar. |

**`shell` area (app-shell delta):** `myAccount` is added (es Mi cuenta, en My account, ca El meu compte) and `profile`, `editProfile`, `changePassword`, `deactivateAccount`, `deleteAccount` are dropped (unused after the change) in `messages/{es,en,ca}/shell.json`, `UserMenuTexts` (`UserMenu.tsx:21-32`), `AppHeaderTexts` (`AppHeader.tsx:28-38`) and the shell's texts mapping (`src/app/shell/AppShell.tsx:68-72`).

### D4. External links reuse the link treatment through an export

The account page's two external destinations (`{API}/user/security`, `{API}/forgot-password`) are native `<a>` elements — `Link` refuses external destinations by type (`src/shared/ui/Link.tsx:22-27`, base-controls "External destination refused") — and base-controls keeps external navigation out of the treatment's scope, so no requirement there changes. `Link.tsx` exports its treatment class list (`LINK_CLASSES`, today's `BASE_CLASSES`) from `@/shared/ui`, as `BADGE_GEOMETRY_CLASSES` is exported for chips, and the two anchors take it; they open in the same tab, as the menu's Security entry. **No `base-controls` delta is listed**: the export changes no observable behaviour, so the `Link.tsx` and `src/shared/ui/index.ts` edits ride in a user-account commit. Alternative considered and rejected by that rule: a `base-controls` spec delta for the export.

### D5. The profile refresh settles the session (auth delta)

`refreshProfile()` is exported from `@/features/auth` (summary F3: `add-auth` merged without it) and re-runs `GET /user` through the authenticated client, settling the session with its `data`. A network failure or `5xx` retries once after a short pause; a second failure keeps the previous user with no message. A `401` is recovered by the client's existing chain ("Keeping the session alive"). The `PUT` response body is never written into the session (auth "Session states and profile": no user data comes from any other source). The only consumer here is the Profile section after a `200`; the header name and initials follow through the session store.

### D6. The step-up notice and session loss on the account page

Every write is sent with the current token through `request`. A `403` shows the step-up notice (`stepUpText` + "Confirm identity") inside the section that sent the write, above its actions row, or in the open dialog's error area; the button calls `requestProfileWrite` with the account route — `requestProfileWrite(\`/${locale}/account\`)` — synchronously inside the click. After signing in again the user activates the action again. A declined step-up and any write whose `401` no recovery resolves both end the session `anonymous`, and the page then shows the signed-out state (spec "Account page and its session gate") — the account page never redirects on its own.

### D7. Danger zone behind `ConfirmDialog`, and its dependency

Deactivate and Delete render as two blocks, each with its heading (`type-card-heading`), its explanation (`deactivateText` / `deleteText`) and one `action-2` trigger. The trigger opens `ConfirmDialog` (`add-evaluation-scales` §5) with the confirm action in `primary` and the cancel action in `action-4`, as that change settles; its title is `deactivateConfirmTitle` / `deleteConfirmTitle` and its description reuses `deactivateText` / `deleteText`. Nothing is sent before the user confirms; while the confirmed request is pending the dialog's `pending` state shows the busy confirm, disables cancel and ignores Escape. A `200` calls `signOut()` (the API has revoked the tokens; its `POST /logout` gets a `401` and is ignored by design — `add-auth` D5) and the user lands on `/${locale}` with no message. **The apply of this change waits for `add-evaluation-scales` to be merged into `develop`** (Open 11, answer a): it keeps one owner and orders the apply, not the specs.

### D8. Client-side navigation on the register routes

When the session is `authenticated` on a registration route, the page opens `/${locale}` through the App Router's client-side navigation (`replace`, as the callback screen's route change — `src/pages/callback/ui/CallbackScreen.tsx:20-23`), so the in-memory tokens survive and no reload wipes them.

### D9. Accessibility end states

- Registration form and the two forms of the account page: `<form noValidate>` labelled by their heading (`aria-labelledby`); the registration success panel's heading takes `tabIndex={-1}` and receives focus when the panel replaces the form.
- After a failed client check, focus moves to the first invalid field; success and errors are announced by their live regions (success `role="status"`, errors `role="alert"`) and focus stays where it is.
- Each account section is a named region labelled by its `h2`; the role row is a `dl` (`dt` label, `dd` the API value).
- The step-up notice is `role="alert"` text with its button; the loading status is `role="status"` with an `aria-hidden` `Loader2` that spins only without `prefers-reduced-motion`; the success status pairs `Check` (`aria-hidden`) with its text.
- Errors are never colour alone: every error is text, and the field adds the boundary change and `aria-invalid`.
- The external links carry `focus-visible:focus-ring`; every reused control carries it already. Texts arrive as props; the role value is shown as the API returns it.
- Autofill names: name `given-name`, surname `family-name`, email `email`, the current password `current-password`, the new password and its confirmation `new-password`; `PasswordInput` takes `showPassword` and `hidePassword` as its toggle's names.
- Button treatments: `primary` `size="base"` for the submit actions, "Sign in" and "Confirm identity"; `action-2` `size="base"` for the two Danger zone triggers (D7); `loading` while a request is pending; `type="submit"` inside forms.

### D10. Layout and spacing (D14, criterion A — every value is an end state)

- One `PageSection surface="page"` per screen: the D14 section and container values are `PageSection`'s own; the screens add none. The container's children (`containerClassName`, layout only) form a flex column.
- Column: registration, full container width up to 32rem centred; account, full container width up to 32rem aligned to the container's start. Vertical stack with 2rem between the heading block and the first card and between consecutive cards.
- Heading block: vertical stack, 0.5rem between the `h1` (`type-heading`) and one intro paragraph (`type-body`); no border, padding or background.
- Cards: `Card`/`CardContent` as built (1.5rem content padding); the full column width. Inside an account section card: 1.5rem between the section header (`h2` `type-subheading` + description `type-body`, 0.5rem apart) and its content.
- Forms: vertical stack, 1.5rem between fields, between the last field and the status or step-up notice, and between those and the actions row. Name and surname stay stacked at every width. The password help is the `help` of the new-password field; the current-password field and its "Forgot your password?" line form one group 0.5rem apart.
- Role row: `dt` (`type-label`) above `dd` (`type-body`), 0.25rem apart, 1.5rem above the profile form.
- Actions row: flex, wraps, 0.75rem gap both ways. Registration's submit takes the full row width; the account buttons take their own width, aligned to the start.
- Security section: header, then the external link as a `type-body` line 1.5rem below; no box.
- Danger zone: the `h2` alone in its header; two blocks stacked 1.5rem apart, the second with a 1px top border in the `border-subtle` token (generated utility `border-border-subtle`) and 1.5rem padding above its content; each block is a vertical stack — `h3` (`type-card-heading`), explanation (`type-body`) 0.5rem below, actions row 1rem below.
- Form status and step-up notice: no background, border, padding or radius. Status is a flex row from the start, 0.5rem between the 1rem `Check` and the text; the notice is a vertical stack, 0.75rem between the text and its button.
- Registration success panel: replaces the form inside the same `CardContent`; 1rem between the heading (`type-card-heading`), the text (`type-body`) and the actions row.
- Loading status: `CardContent` flex row centred, 0.5rem between the 1rem `Loader2` and the text (`type-meta`). Signed-out state: `CardContent` vertical stack, 1rem between the text (`type-body`) and the actions row.
- Responsive: below `md` (768px) the section takes 3rem vertical and 1rem side padding and the column is full width; from `md`, 4rem/2rem and the 32rem column. Cards and fields stay stacked and full-width at every size; the registration submit is full width; the account buttons wrap at their own width. No horizontal scroll at 375px (343px column, 291px inside the cards).

### D11. Tokens and contrast

Semantic tokens only. The pairs the change's elements need are those `theme-tokens.test.ts` already registers plus two that it must add, in both theme matrices (summary §6.4, measured by script: `text-label`/`surface-card` 5.97 traditional, 9.51 dark; `text-secondary`/`surface-card` 6.05 traditional, 7.93 dark — both pass 4.5):

```ts
{ fg: "text-label", bg: "surface-card", kind: "text" },
{ fg: "text-secondary", bg: "surface-card", kind: "text" },
```

`add-offering-catalog` and `add-offering-management` name the same two pairs: whichever change lands second drops the pairs already registered. Not gated: the `Check` icon beside its text and the Danger zone separator (both decorative); inputs keep the treatment `form-fields` already gates. No new token and no colour taken from the MVC.

## Routes, components and files

| Path | FSD layer | Change |
|---|---|---|
| `app/[locale]/register/page.tsx` | app (route) | created: passes the locale and `role: "specialist"` to the screen |
| `app/[locale]/register/coffeeshop/page.tsx` | app (route) | created: passes the locale and `role: "coffeeshop"` to the screen |
| `app/[locale]/account/page.tsx` | app (route) | created: passes the locale to the screen |
| `src/pages/register/index.ts` | pages | created: public API of the slice (`RegisterScreen`) |
| `src/pages/register/ui/RegisterScreen.tsx` | pages | created: server screen — loads the `account` catalog and renders the page and the client form region |
| `src/pages/register/ui/RegisterClient.tsx` | pages | created: `"use client"` injection seam (D1); navigates to `/${locale}` when the session is `authenticated` (D8) |
| `src/pages/account/index.ts` | pages | created: public API of the slice (`AccountScreen`) |
| `src/pages/account/ui/AccountScreen.tsx` | pages | created: server screen — loads the `account` catalog and renders the page and the client sections region |
| `src/pages/account/ui/AccountClient.tsx` | pages | created: `"use client"` injection seam (D1) |
| `src/features/user-account/index.ts` | features | created: public API of the slice |
| `src/features/user-account/ui/RegisterForm.tsx` | features | created: registration form |
| `src/features/user-account/ui/RegisterSuccessPanel.tsx` | features | created: success panel |
| `src/features/user-account/ui/LoadingStatus.tsx` | features | created: the loading status |
| `src/features/user-account/ui/SessionGate.tsx` | features | created: loading / signed-out / content |
| `src/features/user-account/ui/FormStatus.tsx` | features | created: success status and form-level error |
| `src/features/user-account/ui/StepUpNotice.tsx` | features | created: step-up text and "Confirm identity" |
| `src/features/user-account/ui/AccountSection.tsx` | features | created: `<section>` + `Card` + header |
| `src/features/user-account/ui/RoleRow.tsx` | features | created: the role `dl` row |
| `src/features/user-account/ui/ProfileForm.tsx` | features | created: profile form |
| `src/features/user-account/ui/PasswordForm.tsx` | features | created: password form |
| `src/features/user-account/ui/ExternalLink.tsx` | features | created: native anchor with the exported treatment (D4) |
| `src/features/user-account/ui/DangerZone.tsx` | features | created: the two destructive blocks and their dialogs |
| `src/features/auth/model/session.ts` | features (`auth`) | modified: `refreshProfile` (D5) |
| `src/features/auth/index.ts` | features (`auth`) | modified: exports `refreshProfile` |
| `src/shared/api/index.ts` | shared (`api`) | modified: the three derived payload types |
| `src/shared/ui/Link.tsx` | shared (`ui`) | modified: exports the treatment classes (D4) |
| `src/shared/ui/index.ts` | shared (`ui`) | modified: re-exports them |
| `src/widgets/app-header/ui/UserMenu.tsx` | widgets | modified: one "My account" entry, `UserMenuTexts` |
| `src/widgets/app-header/ui/AppHeader.tsx` | widgets | modified: `AppHeaderTexts` |
| `src/app/shell/AppShell.tsx` | app | modified: the shell texts mapping |
| `messages/{es,en,ca}/account.json` | message catalog | created: the `account` area (D3) |
| `messages/{es,en,ca}/shell.json` | message catalog | modified: `myAccount` in, five keys out (D3) |
| `src/app/styles/theme-tokens.test.ts` | tests (theming guard) | modified: the two pairs of D11 |
| `src/widgets/app-header/ui/AppHeader.test.tsx` | tests | modified: texts fixture (`:42-46`) and the entry tables (`:636-644`, `:653-661`, `:715`) |
| tests next to every new or changed component | tests | created/modified per slice |

`contracts/openapi.yaml` and `src/shared/api/schema.ts` are never edited. Nothing outside `src/`, `app/`, `messages/` and the tests changes.

## Risks / Trade-offs

- [`ConfirmDialog` is not merged yet] → The apply waits for `add-evaluation-scales` on `develop` (D7); the Danger zone group lands early so the integration is proven before the two form groups.
- [`{API}/forgot-password` sits behind Fortify's `guest` middleware (summary F6, unverified)] → a visitor holding an API web session may be redirected to the API's `home` instead of the reset form; Product owner checks it in the real-browser verification. Front code is unaffected either way.
- [The contract documents no `422` and no `401` (summary F4)] → every `422` shows the generic error (R8 stays in the backlog) and the client's `401` chain is unchanged.
- [Whether the refresh grant keeps `profile:write` is unverified] → the reactive step-up is the designed recovery for any `403`; the real-browser verification exercises it.
- [Two upcoming changes name the same two contrast pairs] → the second one to land drops the pairs already registered (D11).
- [The API answers the browser with no CORS headers (decisions log, pending in the API)] → real-browser verification cannot run until `tazavera-api` publishes `config/cors.php`; the unit suite is unaffected.
- [The API requires `role` in practice although the contract marks it optional (summary F1)] → the front always sends the route's `role`; reported to Product owner for the API.

## Migration Plan

None: no data, no dependency and no removed route (the five old menu destinations never existed). Rolling back is reverting the change's commits.

## Open Questions

None.
