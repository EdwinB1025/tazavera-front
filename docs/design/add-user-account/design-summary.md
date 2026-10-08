Status: approved — by the orchestrator on 2026-10-06, on Product owner's instruction to approve every summary with no decision pending from him (non-blocking Open points accepted with their recommendations)

# Design summary — add-user-account

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Product owner's draft, reviewed by the design lead on 2026-10-06 and redrafted the same day to Product owner's answers (see "Review log"). Anything not settled by a source is listed under "Open".

- Change-id: `add-user-account`
- Capabilities: `user-account` (new), plus two deltas committed per capability: `app-shell` (the user menu, §6.6) and `auth` (`refreshProfile()`, §6.7).
- Depends on:
  - Merged on `develop`: `add-auth` (session, `request`, `publicRequest`, `signIn`, `signOut`, `requestProfileWrite`), `extract-page-section` (`PageSection`), `fix-button-boundaries` (Button boundaries in both themes), `add-form-fields` (Field, Input, PasswordInput), `add-base-control` (Button, Link), `add-landing` (Card, the registration links, decision D14), `add-app-shell` and `refine-app-header` (the user menu, the message catalog).
  - `add-evaluation-scales` (Apply, `feature/add-evaluation-scales`): `ConfirmDialog` (its §5; base settled at propose: shadcn AlertDialog on the installed `radix-ui`, its design.md D8). This change's apply waits for its merge (Open 11).
- Backlog: no entry in `docs/backlog.md` names this change. R8 (field mapping of the 422) is named by the decisions log but is not in the file yet (Finding F5).
- Decisions log entries that name this change: D14 (page layout), "escrituras, rutas protegidas y 422", "primitivo compartido de sección", "refresco del perfil en la sesión", "rutas protegidas sin sesión: mensaje con botón", "página única de cuenta", "validación de formularios en el navegador", "tokens contra la API local por HTTP", "CORS de la API para el navegador". All are applied below.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| Product owner, general context "add-user-account" | 9.1: `POST /register` takes camelCase fields, and `role` is optional. 9.6: contacts are out of scope. |
| `contracts/openapi.yaml` (develop) | The six operations and their fields (§3). Re-checked 2026-10-06 after today's contract update: unchanged. |
| `openspec/specs/auth/spec.md` and `src/features/auth/index.ts` (develop) | `useSession`, `signIn`, `signOut`, `requestProfileWrite`, `completeCallback` are exported. `requestProfileWrite(returnRoute)` opens a popup inside the click, keeps the route and its typed input, and returns no completion signal. A declined or failed step-up makes the session `anonymous`. |
| `openspec/specs/auth/spec.md` "Session states and profile" | The session is `loading`, `anonymous` or `authenticated`, and carries `data.ulid`, `name`, `surname`, `email`, `role` from `GET /user`. |
| `src/shared/api/client.ts` (develop) | A `401` runs refresh, then silent re-authentication, then `anonymous`. Any other status reaches the caller. |
| `tazavera-api` `RequireLoginForWriteScope.php` | The API always forces a fresh login for `profile:write`, whatever `prompt` the client sends. The front sends no `prompt=login`. |
| Decisions log "página única de cuenta" (answer to Open 6) | One page `/[locale]/account` with sections Profile, Password, Security (external), Danger zone (Deactivate, Delete). The user menu's five account entries become one "My account" entry; the external Security entry stays. What lives in the API (security, password reset) stays in the API. |
| Decisions log "refresco del perfil en la sesión" (answer to Open 7) | `refreshProfile()` re-runs `GET /user` and settles the session; the `PUT` body is never written into the session; one retry after a short pause on network or 5xx; on a second failure the session keeps the previous user, silently. |
| Decisions log "escrituras, rutas protegidas y 422" (answers to Open 1 and 2) | Reactive step-up after a `403`; any `422` shows the generic form error. |
| Decisions log "rutas protegidas sin sesión: mensaje con botón" (answers to Open 4 and 5) | Protected route: `loading` waits; `anonymous` shows a message and a "Sign in" button calling `signIn(currentRoute)` inside the click. `/[locale]/register*` with an `authenticated` session navigates to `/[locale]` client-side. |
| Decisions log "validación de formularios en el navegador" (answer to Open 9) | Forms are `noValidate`; the client checks only what the operation's `requestBody` documents. |
| Decisions log "primitivo compartido de sección" and `src/shared/ui/PageSection.tsx` | Every page section is `PageSection` (`surface="page"` or `"section"`); it owns the D14 section and container values. |
| `src/pages/home/ui/HomeHero.tsx:79-83`, `src/pages/about/ui/AboutContent.tsx:119-123` (develop) | The two registration routes (§4). |
| `.claude/CLAUDE.md` §2 | Semantic tokens only; `focus-visible:focus-ring`; accessible names; errors never by colour alone; mobile-first; disabled at 50%; texts from the catalog as props; icons only through `icons.ts`. |
| General context, "Forma de trabajar" | API values are shown as they come (the `role` value). |

## 1. Scope

- Registration as a specialist or as a coffeeshop.
- One account page with four sections: Profile (view and edit in one block), Password (change, plus an external link to the API's password reset), Security (external link to the API's security page), Danger zone (Deactivate, Delete, each behind its confirmation dialog).
- `app-shell` delta: the user menu offers one "My account" entry instead of five.
- `auth` delta: `refreshProfile()`.

## 2. Out of scope

- Sign in, sign out, token refresh and the step-up mechanism itself (`add-auth`).
- The theme selector (user menu) and the language selector (header).
- Security (2FA, passkeys) and password reset: pages of the API, reached by external links.
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

`getTheAuthenticatedUser` is consumed through the session (`add-auth` loads it) and through `refreshProfile()` (§6.7). The account page reads the user from the session; it sends no `GET /user` of its own (Review log R7).

What the contract documents beyond `200`/`201`: only `403 { message }` on the four writes. No `422` and no `401` (Finding F4).

Checked read-only in `tazavera-api` (contract unclear; mismatches reported, never adapted to):
- **422 keys** (FormRequests): `StoreUserRequest`, `UpdatePasswordRequest`, `UpdateUserRequest`. A password mismatch is reported under `password`. Not used by the front while any 422 shows the generic error (Open 1); kept for backlog R8.
- **Password strength** (`AppServiceProvider.php:84-90`): at least 8 characters, letters, mixed case, numbers; `uncompromised()` in production only. Shown as help text only; the client does not check it (Open 9).
- **403 without the write scope:** Passport's `MissingScopeException` returns `403 { message: "Invalid scope(s) provided." }` on the four writes. The front never reads the message text.
- **Token lifetimes** (`AppServiceProvider.php:55-56`): access token 30 minutes, refresh token 1 hour. Whether the refresh grant keeps `profile:write` is **unverified**.
- **Finding F1 (API, report only):** `UserController::store` reads `$data['role']` unconditionally (500 without `role`). The front always sends `role` (§5.1).
- **API message language:** `SetLocale` has no Catalan. The front shows catalog texts, never the API's `message` (§8).
- **External API pages:** `{API}/user/security` (`routes/web.php:10`, middleware `auth:web`, `password.confirm`) and `{API}/forgot-password` (Fortify `Features::resetPasswords()`, `config/fortify.php:89,165`, default path, prefix `''`; Fortify puts it behind `guest`, so a visitor who still holds an API web session may be redirected to the API's `home` — **unverified**, Finding F6).

## 4. Routes

| Route | Screen | Source |
|---|---|---|
| `/[locale]/register` | Registration as a specialist (`role: "specialist"`) | `HomeHero.tsx:82`, `AboutContent.tsx:122` (merged links) |
| `/[locale]/register/coffeeshop` | Registration as a coffeeshop (`role: "coffeeshop"`) | `HomeHero.tsx:79`, `AboutContent.tsx:119` (merged links) |
| `/[locale]/account` | Account page, four sections | Open 6 answer |

The five routes the merged menu links today (`/[locale]/account/profile`, `/edit`, `/password`, `/deactivate`, `/delete`, `UserMenu.tsx:81-87`) are **not created**; the `app-shell` delta (§6.6) replaces those entries, so no link points at them after this change.

FSD composition:

| Layer | Piece |
|---|---|
| `app/[locale]/register/page.tsx`, `app/[locale]/register/coffeeshop/page.tsx`, `app/[locale]/account/page.tsx` | Routes only: pass the locale (and the role for the two registration routes) to the screen |
| `src/pages/register` | `RegisterScreen`: loads the `account` catalog texts (server), renders the page and the client form |
| `src/pages/account` | `AccountScreen`: loads the texts (server), renders the page and the client sections |
| `src/features/user-account` | Client pieces: `RegisterForm`, `ProfileForm`, `PasswordForm`, `DangerZone` (both destructive actions), the session gate, the step-up notice |
| `src/features/auth` | `refreshProfile()` (auth delta, §6.7) |
| `src/widgets/app-header` | `UserMenu` (app-shell delta, §6.6) |

## 5. Behaviour

### 5.1 Registration

- **Session gate:** while `loading`, the page shows its heading and the loading status in the card; when `authenticated`, it navigates to `/[locale]` with client-side navigation (the in-memory tokens survive). The form shows only when `anonymous`. This includes the moment right after signing in from the success panel (Open 4).
- **Client checks before sending** (Open 9; contract `requestBody` of `registerAUser`): every field is required; the email must be a valid address; `passwordConfirmation` must equal `password`. Each failure shows its catalog message under its `Field` (`aria-invalid`); focus moves to the first invalid field; nothing is sent.
- The form sends `name`, `surname`, `email`, `password`, `passwordConfirmation` and the route's `role` through `publicRequest` (no credentials).
- **Pending:** the submit `Button` shows `loading`. The fields stay editable.
- **201:** the success panel replaces the form (Open 3): heading, text, and a "Sign in" button that calls `signIn()` inside the click. Focus moves to the panel heading.
- **422, network error, 5xx, any other status:** the form-level error above the actions (`genericError`). The form keeps every value except the two password fields, which are cleared.

### 5.2 Account page: session gate

- **`loading`:** the heading block, and one card holding the loading status, in place of the four sections.
- **`anonymous`:** the heading block, and one card holding `signedOutText` and a "Sign in" button that calls `signIn(currentRoute)` inside the click (popup; the user stays on the route). No automatic redirect. A declined step-up (which ends `anonymous`) lands here too.
- **`authenticated`:** the four sections, filled from the session user (`data.ulid`, `name`, `surname`, `email`, `role`). Any role reaches the page.

### 5.3 Writes and the step-up (Open 2)

1. The write is sent with the current token through `request`.
2. A `403` shows the **step-up notice**: `stepUpText` and a "Confirm identity" button whose click calls `requestProfileWrite("/[locale]/account")` synchronously.
3. The popup keeps the page and its typed input. After signing in again, the user activates the action again; the new token carries `profile:write`.
4. A declined step-up makes the session `anonymous`; the page shows §5.2's anonymous state.

Where the notice appears: inside the section whose form was sent (Profile, Password), above the actions row; or in the `error` slot of the open `ConfirmDialog` (Deactivate, Delete).

### 5.4 Profile section (`updateAUser`, view and edit in one block)

- Shows the role as a read-only row (API value as returned), then a form prefilled with the session's `name`, `surname`, `email`.
- **Client checks** (contract `requestBody`): the three fields are required in the form, because the API's `sometimes|string` rejects an empty value (`UpdateUserRequest.php:28-30`); the email must be a valid address.
- Sends `name`, `surname`, `email`.
- **200:** the fields keep the submitted values; the success status "Profile updated" appears above the actions; the section calls `refreshProfile()` (§6.7), so the header name and initials follow through the session store.
- **403:** step-up notice. **422, network, 5xx:** form-level error; values kept.

### 5.5 Password section (`updateUserPassword`)

- Three password fields: current, new, confirmation. Under the current-password field, an external link "Forgot your password?" to `{API}/forgot-password`.
- **Client checks** (contract `requestBody`): the three fields are required; the confirmation must equal the new password.
- **200:** the three fields are cleared and the success status "Password changed" appears.
- **403:** step-up notice. **422, network, 5xx:** form-level error; the three fields are cleared.

### 5.6 Security section

- A short text and an external link "Manage security" to `{API}/user/security` (the same destination as the menu's Security entry, `UserMenu.tsx:114`). No request from the front.

### 5.7 Danger zone (`deactivateAUser`, `permanentlyDeleteAUser`)

- Two blocks, Deactivate then Delete, each with its explanation and one action button. The button opens `ConfirmDialog`. Nothing is sent before the user confirms.
- **Pending:** the dialog's confirm button shows `loading`, Cancel is disabled, Escape is ignored (`ConfirmDialog` `pending`).
- **200:** the API has revoked the tokens. The page calls `signOut()`: the session becomes `anonymous` and the user lands on `/[locale]`. Its `POST /logout` gets a `401` with the revoked token and is ignored by design (`add-auth` D5). No message is shown on the landing page.
- **403:** the dialog stays open; its `error` slot holds the step-up notice (`add-evaluation-scales` §8).
- **Network, 5xx:** the dialog's `error` slot shows `genericError`; retry is allowed.

## 6. Components

### 6.1 Reused, unchanged

| Component | Variant and use |
|---|---|
| `PageSection` (`@/shared/ui`) | `surface="page"` on both screens; owns the D14 section and container values (§6.3) |
| `Card`, `CardContent` (`@/shared/ui`) | `layout="default"`, content region only. One card per account section; one card for the registration form, the loading status and the signed-out state. No `CardAside`, no `CardFooter` |
| `Field` | `variant="default"`, `required` on every field. `error` carries the client-check message |
| `Input` | Default variant. `type="text"` with `autoComplete="given-name"` / `"family-name"`; `type="email"` with `autoComplete="email"` |
| `PasswordInput` | Default variant. `autoComplete="new-password"` for new and confirmation, `"current-password"` for current. `showPasswordLabel` / `hidePasswordLabel` from the catalog |
| `Button` | `variant="primary"`, `size="base"`: submit buttons, "Sign in", "Confirm identity". `variant="action-2"`, `size="base"`: the two Danger zone triggers (the removal treatment, as `add-specialist-evaluations` answer 2 uses for Delete). `loading` while pending; `type="submit"` in forms |
| `Link` | Not used on the account page (no internal link left). Registration uses none (Open 10) |
| `ConfirmDialog` (`add-evaluation-scales` §5) | Deactivate and Delete. Confirm `primary`, Cancel `action-4`, as that change settles |
| Icons (`src/shared/ui/icons.ts`) | `Check` (success status), `Loader2` (loading status). No new icon |

### 6.2 New, inside this change

None is shared outside the change. Each is a composition of the components above.

| Part | Content | Accessible name and roles |
|---|---|---|
| Registration form | Name, surname, email, password, confirmation, submit | `<form noValidate>` with `aria-labelledby` pointing at the page `h1` |
| Registration success panel | Heading, text, "Sign in" button | Heading `h2` with `tabIndex={-1}`; focus moves to it when the panel replaces the form |
| Account section | `<section>` wrapping one `Card`; `h2` heading, optional description, content | `aria-labelledby` pointing at its `h2` |
| Role row | `dl` with one row: `dt` role label, `dd` the API value | Native term/description |
| Profile form, password form | The fields of §5.4 and §5.5, Save button | `<form noValidate>` with `aria-labelledby` pointing at the section `h2` |
| External link | Security and "Forgot your password?" | Native `<a href>` with the visible text as its name; treatment per Open 13 |
| Danger block | `h3`, explanation, trigger button | The button is named by its label; the dialog by its title and description |
| Form status | Success text with `Check`, or the form-level error | Success: `role="status"`. Error: `role="alert"`. The icon is `aria-hidden` |
| Step-up notice | Text and "Confirm identity" button | `role="alert"` on the text; the button is named by its label |
| Loading status | `Loader2` and a text | `role="status"`; the icon is `aria-hidden` and spins only without `prefers-reduced-motion` |
| Signed-out state | Text and "Sign in" button | Plain text; the button named by its label |

**Focus:**
- After a failed client check, focus moves to the first invalid field.
- Success and errors are announced by their live regions; focus stays where it is.
- After a dialog closes on failure-free cancel, focus returns to its trigger (ConfirmDialog). After a successful Deactivate or Delete the page navigates away.
- `focus-visible:focus-ring` comes with every reused control; the external links carry it too (Open 13).

**Errors never by colour alone:** every error is text (Field's message, `type-error` paragraphs); Field adds the boundary change and `aria-invalid`.

### 6.3 Page layout and spacing (criterion A)

Every value is an end state; the build chooses the utilities.

**Section and container (D14, `PageSection`).**
- One `PageSection surface="page"` per screen: full width, background `surface-page`, vertical padding 3rem below `md` and 4rem from `md`; container centred, at most 72rem, side padding 1rem below `md` and 2rem from `md`. No border, radius or shadow. These values are `PageSection`'s own; the screens add none.
- The container's children (passed through `containerClassName`, layout only): a flex column.

**Column** (a child of the container; it carries the width, which `containerClassName` may not):
- Registration: full container width up to 32rem, centred (MVC `layouts/auth/simple.blade.php`: `max-w-sm sm:max-w-lg`).
- Account: full container width up to 32rem, aligned to the container's start (MVC `components/settings/layout.blade.php`).
- A vertical stack: 2rem between the heading block and the first card, and 2rem between consecutive cards (D14 explicit gaps between groups; the landing hero's `gap-8`). No padding, border or radius of its own.

**Heading block.**
- Vertical stack, 0.5rem between `h1` (`type-heading`) and the intro (`type-body`, one paragraph).
- No margin outside the stack; no border, padding or background.

**Card (every card on both screens).**
- `Card` as built: `bg-surface-card`, `rounded-container`, a 4px left border in `border-border-accent`, `shadow-lg`. No other border.
- `CardContent` as built: 1.5rem padding on every side.
- Width: the full column.

**Inside an account section card.**
- Vertical stack, 1.5rem between the section header and its content.
- Section header: vertical stack, 0.5rem between the `h2` (`type-subheading`) and its description (`type-body`). Sections without a description show the `h2` alone.

**Forms (registration, Profile, Password).**
- Vertical stack, 1.5rem between fields, between the last field and the form status or step-up notice, and between those and the actions row (MVC `register.blade.php` `gap-6`, `security.blade.php` `space-y-6`). An absent status takes no space.
- Field internals as built: label 0.5rem above the control; help and error 0.25rem below it.
- Name and surname stay stacked at every width.
- Password help (strength rule) is the `help` of the new-password field (registration and Password section).
- Password section: the current-password field and the "Forgot your password?" line form one group, 0.5rem apart; the group sits in the form stack like a field.

**Role row (Profile).**
- `dl` with one row; `dt` (`type-label`) above `dd` (`type-body`), 0.25rem apart. 1.5rem below it, the profile form (the section content stack).

**Actions row.**
- Flex, wraps, 0.75rem gap in both directions, no padding, border or margin of its own.
- Registration: the submit button takes the full row width (MVC `register.blade.php:65` `w-full`).
- Account sections: buttons at their own width, aligned to the start (MVC `security.blade.php:32`).

**Security section.**
- Header (`h2` + description), then the external link as the content, 1.5rem below. The link is a `type-body` line; no box.

**Danger zone.**
- Header: the `h2` alone.
- Content: two blocks stacked, 1.5rem apart. The second block carries a 1px top border in `border-subtle` with 1.5rem padding above its content (decorative, not gated; the separator treatment of the card regions).
- Each block: vertical stack; `h3` (`type-card-heading`), the explanation (`type-body`) 0.5rem below, the actions row (account values) 1rem below.

**Form status, step-up notice.**
- Form status: flex row, items aligned to the start, 0.5rem between the `Check` icon (1rem) and the text. No background, border, padding or radius.
- Step-up notice: vertical stack, 0.75rem between the text and its button; the button keeps its own width. No background, border, padding or radius.

**Registration success panel.**
- Replaces the form inside the same `CardContent`.
- Vertical stack, 1rem between the heading (`type-card-heading`), the text (`type-body`) and the actions row.

**Loading status and signed-out state** (account page, and registration while `loading`).
- Loading: inside `CardContent`, flex row, items centred, 0.5rem between `Loader2` (1rem) and the text (`type-meta`).
- Signed-out: inside `CardContent`, vertical stack, 1rem between the text (`type-body`) and the actions row holding "Sign in".

**Width check at 375px** (computed by the design lead): 375 − 2 × 16 container padding = 343px column; minus 2 × 24 card padding and the 4px left border = 291px for the fields. No horizontal scroll expected.

### 6.4 Tokens and contrast

Pairs measured by the design lead with an executed script in the review of 2026-10-06 (`scratchpad/contrast-account.mjs`, WCAG 2.2 relative luminance, values from `globals.css` on `develop`). Not re-run in this redraft (no shell in this session): every new element below uses a pair already measured there or already registered in `theme-tokens.test.ts`, which measures it on every run.

| Gated pair | Kind | Traditional | Dark | Gate | Guard today |
|---|---|---|---|---|---|
| `text-primary` / `surface-page` (h1, intro) | text | 6.41 | 14.28 | 4.5 ✔ | registered |
| `text-primary` / `surface-card` (values, `h3`, success text, body) | text | 6.41 | 13.22 | 4.5 ✔ | registered |
| `text-accent` / `surface-card` (section `h2`, `type-subheading`) | text | 6.85 | 6.82 *(add-offering-catalog's measure)* | 4.5 ✔ | registered |
| `text-label` / `surface-card` (field labels, `dt`) | text | 5.97 | 9.51 | 4.5 ✔ | **not registered** |
| `text-secondary` / `surface-card` (help, loading text) | text | 6.05 | 7.93 | 4.5 ✔ | **not registered** |
| `feedback-error` / `surface-card` (field and form errors) | text | 6.75 | 5.67 | 4.5 ✔ | registered |
| `text-link` / `surface-card`, `text-link-hover` / `surface-card` (external links) | text | 6.41 / 11.53 | 13.22 / 14.75 | 4.5 ✔ | registered |
| `action-primary-text` / `action-primary` and `-hover` | text | 6.85 / 11.67 | 5.38 / 6.64 | 4.5 ✔ | registered |
| `action-primary-border` / `surface-card` (boundary) | bound | exempt (transparent; fill passes) | registered | 3 | registered (`fix-button-boundaries`) |
| `action-2-text` / `action-2-bg`, `-hover` (Danger triggers) | text | — | — | 4.5 | registered (measured by the guard) |
| `action-2-border` / `surface-card` (Danger trigger boundary) | bound | — | — | 3 | registered (`fix-button-boundaries`) |
| `focus-ring` / `surface-card` | bound | 11.53 | 13.22 | 3 ✔ | registered |

Not gated: the `Check` icon beside its text (decorative), the Danger zone separator (decorative). Inputs keep the treatment `form-fields` already gates. No new token. No colour is taken from the MVC.

**Pairs the guard tests (`theme-tokens.test.ts`, both theme matrices) must register:**
1. text `text-label` / `surface-card`
2. text `text-secondary` / `surface-card`

`add-offering-catalog` and `add-offering-management` name the same two pairs: whichever change lands second drops the pairs already registered.

### 6.5 Responsive behaviour

| Element | Below `md` (768px) | From `md` |
|---|---|---|
| Section (`PageSection`) | 3rem vertical, 1rem side padding | 4rem vertical, 2rem side padding |
| Column | Full container width | Up to 32rem; centred (registration) or at the start (account) |
| Cards, fields | Stacked, full column width | Same |
| Registration submit | Full width | Full width of the 32rem column |
| Account actions | Own width, wrapping | Same |
| ConfirmDialog | Its own rules (`add-evaluation-scales` §6) | Same |

Breakpoints are Tailwind's defaults (`md` 768px). No horizontal scroll at 375px.

### 6.6 `app-shell` delta: the user menu

- **End state** (`src/widgets/app-header/ui/UserMenu.tsx`): the five account entries (`ITEM_HREFS`, lines 81-87) are replaced by one entry "My account", an internal `Link` to `/[locale]/account`, in the same position (first). The rest of the menu is unchanged: separator, the external Security entry (native anchor), the theme selector, separator, the management entry for the role, Sign out.
- **Texts:** `UserMenuTexts` loses `profile`, `editProfile`, `changePassword`, `deactivateAccount`, `deleteAccount` and gains `myAccount`. The same keys change in `AppHeader.tsx` (texts type, lines 29-33) and in the mapping of `src/app/shell/AppShell.tsx` (lines 68-72). The `shell` catalog (`messages/{es,en,ca}/shell.json`) gains `myAccount` and drops the five keys (unused after the change).
- **Spec** (`openspec/specs/app-shell/spec.md`, "Signed-in header and user menu"): "the profile settings entries" becomes "the account entry" in the requirement and in the scenarios "Menu content" and "No management entry for the role"; a new scenario states that the account entry points at `/{locale}/account`.
- **Tests to update:** `AppHeader.test.tsx` fixture (lines 43-46) and the two entry tables (lines 641-644 and 658-661) now expect one entry, "My account" → `/es/account`.
- No token, colour or menu presentation changes.

### 6.7 `auth` delta: `refreshProfile()`

- **Finding F3 stands:** `add-auth` merged without `refreshProfile()` (`src/features/auth/index.ts` exports `completeCallback`, `requestProfileWrite`, `signIn`, `signOut`, `useSession` only). This change adds it, under its own scope, in the `auth` capability (Open 7 answer a).
- **End state** (decisions log "refresco del perfil en la sesión"): exported from `@/features/auth`; re-runs `GET /user` through the authenticated client and settles the session with its `data`; a network failure or 5xx retries once after a short pause; a second failure keeps the previous user, with no message; a `401` is recovered by the client as today. The `PUT` response body is never written into the session.
- **Spec** (`openspec/specs/auth/spec.md`, "Session states and profile"): one requirement or scenario per outcome above.
- Consumers here: the Profile section after a `200`. The header updates through the session store.

## 7. Texts (catalog)

New area `account`: `messages/{es,en,ca}/account.json`, loaded by each screen and passed as props. Spanish follows the MVC where one exists (cited). Catalan is a **draft translation, unverified**; English follows the shell catalog's wording. Final copy is Product owner's.

**Registration**

| Key | es | en | ca |
|---|---|---|---|
| `registerSpecialistTitle` | Crea tu cuenta de especialista | Create your specialist account | Crea el teu compte d'especialista |
| `registerCoffeeshopTitle` | Registra tu cafetería | Register your coffeeshop | Registra la teva cafeteria |
| `registerIntro` | Ingresa tus datos a continuación para crear tu cuenta (MVC `register.blade.php:3`) | Enter your details below to create your account | Introdueix les teves dades per crear el teu compte |
| `registerSubmit` | Crear cuenta (MVC) | Create account | Crea el compte |
| `registerSuccessTitle` | Cuenta creada | Account created | Compte creat |
| `registerSuccessText` | Ya puedes iniciar sesión con tu email y tu contraseña. | You can now sign in with your email and password. | Ja pots iniciar sessió amb el teu correu i la contrasenya. |

**Fields (shared by the forms)**

| Key | es | en | ca |
|---|---|---|---|
| `nameLabel` | Nombre (MVC) | Name | Nom |
| `surnameLabel` | Apellido (MVC) | Surname | Cognom |
| `emailLabel` | Email (MVC) | Email | Correu electrònic |
| `passwordLabel` | Contraseña (MVC) | Password | Contrasenya |
| `newPasswordLabel` | Nueva contraseña | New password | Nova contrasenya |
| `currentPasswordLabel` | Contraseña actual | Current password | Contrasenya actual |
| `passwordConfirmationLabel` | Confirmar contraseña (MVC) | Confirm password | Confirma la contrasenya |
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
| `profileDescription` | Actualiza tu información personal (MVC `profile.blade.php:5`) | Update your personal information | Actualitza la teva informació personal |
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
| `deleteText` | Se eliminarán tu cuenta y todos sus datos de forma permanente. (MVC `delete-user-form.blade.php:19`) | Your account and all of its data will be permanently deleted. | El teu compte i totes les seves dades s'eliminaran de manera permanent. |
| `deactivateConfirmTitle` / `deleteConfirmTitle` | ¿Desactivar tu cuenta? / ¿Seguro que quieres eliminar tu cuenta? (MVC) | Deactivate your account? / Are you sure you want to delete your account? | Desactivar el compte? / Segur que vols eliminar el compte? |
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

**`shell` area (app-shell delta, §6.6)**

| Key | es | en | ca |
|---|---|---|---|
| `myAccount` (new) | Mi cuenta | My account | El meu compte |
| `profile`, `editProfile`, `changePassword`, `deactivateAccount`, `deleteAccount` | removed | removed | removed |

The `role` value is shown as the API returns it (`specialist`, `coffeeshop`, `user`).

## 8. Error presentation summary

| Response | Where it shows | Text source |
|---|---|---|
| Client check fails | Under each failing `Field`; nothing sent | `requiredError`, `emailFormatError`, `passwordMismatchError` |
| 422 | Form-level error (forms) or the dialog `error` (destructive actions) | `genericError` (Open 1) |
| 403 on a write | Step-up notice (in the section) or the dialog's `error` slot | `stepUpText`, `stepUpButton` |
| 401 | Never shown: the client's recovery chain; an `anonymous` end shows the signed-out state | `signedOutText` |
| Network error, 5xx, any other status | Form-level error (forms), dialog `error` (destructive actions) | `genericError` |
| `refreshProfile()` fails twice | Nothing (the session keeps the previous user) | — |

The API's `message` is never rendered.

## 9. Findings on existing code and contract

- **F1 — API: `role` optional in the contract, required in practice.** Report to Product owner for the API. The front always sends `role`.
- **F2 — closed.** The dark-theme primary boundary is fixed on `develop` by `fix-button-boundaries` (`Button.tsx:47-80`, guard pairs `action-*-border`).
- **F3 — `add-auth` merged without `refreshProfile()`.** The decisions log says add-auth exposes it; the merged code does not. This change adds it (§6.7, Open 7 a). Semantic note for the orchestrator: the log entry reads as already done.
- **F4 — Contract: no 422 documented** on any operation. Settled by Open 1 (generic error) and backlog R8.
- **F5 — Backlog R8 missing.** The decisions log ("escrituras, rutas protegidas y 422", "validación de formularios en el navegador") and Open 1 refer to `docs/backlog.md` R8 (422 field mapping), but `docs/backlog.md` on `develop` holds only R1, R3, R4, R5. Path: backlog (the orchestrator integrates refactor candidates, `.claude/CLAUDE.md` §3).
- **F6 — `{API}/forgot-password` behind Fortify's `guest` middleware.** A visitor who still holds an API web session (opened by the OAuth login, `SESSION_LIFETIME=2`) may be redirected to the API `home` instead of the reset form. **Unverified**; checked in the verification task. Not front code.

## 10. Tests (expected, for the architect's tasks)

**Registration:**
- the specialist route sends `role: "specialist"`, the coffeeshop route `role: "coffeeshop"`, with camelCase `passwordConfirmation`;
- the request is public (no `Authorization` header);
- client checks: an empty required field, an invalid email and a mismatched confirmation each show their catalog message under the field, set `aria-invalid`, focus the first invalid field and send nothing;
- the submit button is `loading` while pending;
- 201 shows the success panel and moves focus to its heading; its "Sign in" calls `signIn()` synchronously in the click;
- a 422 and a network error show `genericError`, keep the values and clear both password fields;
- `authenticated` navigates to `/[locale]` with the client router; `loading` shows the loading status and no form.

**Account page:**
- `loading` shows the loading status; `anonymous` shows `signedOutText` and a "Sign in" button that calls `signIn` with the current route synchronously in the click;
- `authenticated` shows the four sections in order (Profile, Password, Security, Danger zone), each a `section` labelled by its `h2`;
- Profile: the role row shows the session role as returned; the form is prefilled from the session; client checks as above; it sends `PUT /users/{ulid}` with the session ulid through `request`; 200 shows "Profile updated" and calls `refreshProfile()`;
- Password: client checks; 200 clears the three fields and shows "Password changed"; the "Forgot your password?" link points at `{API}/forgot-password`;
- Security: the link points at `{API}/user/security`;
- 403 on either form shows the step-up notice, and its button calls `requestProfileWrite` with the account route synchronously in the click;
- Danger zone: nothing is sent before the dialog's confirm; confirm sends the right `DELETE`; 200 calls `signOut()`; 403 shows the step-up notice in the dialog and keeps it open; a network error shows `genericError` in the dialog;
- every text comes from props (no literal copy in components).

**`auth` delta (`refreshProfile`):**
- a 200 settles the session with the new `data`;
- a network error or 5xx retries once; a second failure keeps the previous user and shows nothing;
- the `PUT` body is never written into the session.

**`app-shell` delta (user menu):**
- the menu offers one "My account" entry → `/es/account`, before the Security entry; the five old entries are gone (update `AppHeader.test.tsx` lines 43-46, 641-644, 658-661).

**Guards:**
- register the two pairs of §6.4 in both theme matrices;
- the catalog guard: the new `account` area and the changed `shell` keys have the same keys in es, en and ca.

**Verification task:** captures at 375px and 1280px of `/es/register`, `/es/register/coffeeshop` and `/es/account` (each state: loading, signed out, signed in with the dialog open), in both themes, with the API or a local mock of `GET /user` and the writes. Check F6 in the browser.

## 11. Visual reference

No MVC capture is in this folder (Open 12). Sources for Product owner's captures: `livewire/auth/register.blade.php` in `layouts/auth/simple.blade.php`; `livewire/settings/profile.blade.php`, `security.blade.php` and `delete-user-form.blade.php` in `components/settings/layout.blade.php`.

Wireframe of the target layout (design lead; spacing from §6.3):

```
375px, /es/account                       1280px, /es/account
┌───────────────────────────┐            ┌──────────── PageSection (surface-page), py 4rem ───────────┐
│ py 3rem, px 1rem           │            │ px 2rem                                                    │
│ Mi cuenta (h1)             │            │ Mi cuenta (h1)                                              │
│ intro          0.5rem      │            │ intro                                                       │
│ 2rem                       │            │ 2rem                                                        │
│┃┌ card: Perfil ─────────┐  │            │┃┌ card, max 32rem: Perfil ─┐                               │
│┃│ 1.5rem padding         │ │            │┃│ Rol  specialist          │                               │
│┃│ Rol  specialist        │ │            │┃│ Nombre * [____________]  │                               │
│┃│ Nombre *  [________]   │ │            │┃│ Apellido * …  Email * …  │                               │
│┃│ Apellido * [_______]   │ │            │┃│ ✓ Perfil actualizado     │                               │
│┃│ Email *  [_________]   │ │            │┃│ (Guardar)                │                               │
│┃│ (Guardar)              │ │            │┃└──────────────────────────┘                               │
│┃└────────────────────────┘ │            │ 2rem                                                        │
│ 2rem                       │            │┃┌ card: Contraseña ───────┐                                │
│┃┌ card: Contraseña ──────┐ │            │┃│ Contraseña actual *      │                               │
│┃│ … ¿Olvidaste…? (ext.)  │ │            │┃│ ¿Olvidaste tu contraseña?│                               │
│┃└────────────────────────┘ │            │┃│ Nueva … Confirmar …      │                               │
│┃┌ card: Seguridad ───────┐ │            │┃└──────────────────────────┘                               │
│┃│ text · Gestionar (ext.)│ │            │┃┌ card: Seguridad ────────┐                                │
│┃└────────────────────────┘ │            │┃│ text · Gestionar (ext.)  │                               │
│┃┌ card: Zona peligrosa ──┐ │            │┃└──────────────────────────┘                               │
│┃│ Desactivar · Eliminar  │ │            │┃┌ card: Zona peligrosa ───┐                                │
│┃└────────────────────────┘ │            │┃│ Desactivar (h3) · text   │                               │
│                            │            │┃│ [Desactivar] (action-2)  │                               │
│                            │            │┃│ ── 1px border-subtle ──  │                               │
│                            │            │┃│ Eliminar (h3) · text     │                               │
│                            │            │┃│ [Eliminar] (action-2)    │                               │
│                            │            │┃└──────────────────────────┘                               │
└───────────────────────────┘            └─────────────────────────────────────────────────────────────┘
```

## Open

1. **422 format and field messages.**
   - Question: the contract documents no `422`; which source and which texts?
   - Options: a) Product owner documents the 422 and the front maps keys to fields; b) as a) with the API's first message; c) no field mapping, generic form-level error.
   - **Answered 2026-10-06 (Product owner): c).** Any 422 shows the generic form-level error; field mapping goes to backlog R8 (see F5).
   - Blocks propose: no.

2. **Step-up timing and 403 handling (was 9.3 and 9.7).**
   - Options: a) step-up on every submit; b) reactive after a `403`; c) `requestProfileWrite` returns a promise; d) step-up on page open.
   - **Answered 2026-10-06 (Product owner): b).** Reactive step-up after a `403`; the user activates the action again (§5.3).
   - Blocks propose: no.

3. **After registration (was 9.2).**
   - **Answered 2026-10-06 (Product owner): a).** Success panel with a "Sign in" button that calls `signIn()` inside the click (§5.1).
   - Blocks propose: no.

4. **Registration route for a signed-in visitor.**
   - **Answered 2026-10-06 (Product owner): b).** When the session is `authenticated`, `/[locale]/register*` navigates to `/[locale]` client-side; while `loading`, the page waits. No new texts (§5.1).
   - Blocks propose: no.

5. **Account page without a session.**
   - **Answered 2026-10-06 (Product owner): a), with a button.** `loading`: the loading status. `anonymous`: `signedOutText` and a "Sign in" button that calls `signIn(currentRoute)` inside the click. No automatic redirect (§5.2).
   - Blocks propose: no.

6. **Layout: one page per action, or one page with sections (was 9.8).**
   - Options: a) one page per route with back links; b) a) without in-page links; c) one page with sections, with an `app-shell` change to the user menu.
   - **Answered 2026-10-06 (Product owner): c).** One page `/[locale]/account` with sections, in order: Profile (view and edit in one block) → Password → Security (external link to `{API}/user/security`) → Danger zone (Deactivate, Delete, each behind its confirmation dialog). Password reset stays in the API, reached by an external link. The five sub-routes are not created. User menu: one entry "My account" → `/[locale]/account` replaces the five account entries; the external Security entry stays. The change carries an `app-shell` delta.
   - Redrafted 2026-10-06 by the design lead: §1, §3, §4, §5.2–§5.7, §6.1–§6.6, §7, §8, §10, §11.
   - Blocks propose: no.

7. **Header name after a profile update.**
   - **Answered 2026-10-06 (Product owner): a).** `refreshProfile()` after a successful `updateAUser` (§6.7). `add-auth` merged without it, so this change adds it in the `auth` capability (F3).
   - Blocks propose: no.

8. **Section and container classes (D14) duplication.**
   - **Answered 2026-10-06 (Product owner): a).** The shared primitive comes first. Done: `PageSection` is on `develop` (`extract-page-section`, merged `fdff5e4`); this change uses it (§6.3).
   - Blocks propose: no.

9. **Client-side checks and native validation.**
   - **Answered 2026-10-06 (Product owner): a), limited to the rules the contract states.** Forms are `noValidate`; the client checks required fields, email format and the confirmation match, with catalog messages under each `Field`. Strength, uniqueness and the current password are the API's, shown as the generic error (§5.1, §5.4, §5.5).
   - Blocks propose: no.

10. **"Already have an account? Sign in" under the registration form.**
    - Question: the MVC shows it (`register.blade.php:71-74`). Keep it?
    - Options: a) omit it, since the header carries "Sign in" on every page; b) keep it, as a text and a `primary` `size="sm"` button calling `signIn()`, 1.5rem below the form, centred.
    - Recommendation: a). It avoids a second primary action on the page. The body follows a).
    - Blocks propose: no.

11. **ConfirmDialog availability.**
    - Question: the dialog belongs to `add-evaluation-scales`, now in Apply (base settled at its propose: shadcn AlertDialog, design.md D8).
    - Options: a) this change waits for `add-evaluation-scales` to merge; b) the dialog moves to its own small change in `feedback`.
    - Recommendation: a). It keeps one owner; it orders the apply, not the spec.
    - Blocks propose: no.

12. **Visual reference captures.**
    - Options: a) Product owner adds the MVC captures listed in §11; b) the wireframe of §11 stands as the mock-up.
    - Recommendation: a).
    - Blocks propose: no.

13. **Treatment of the external links on the account page** (Security, "Forgot your password?").
    - Question: `Link` refuses external destinations by type (`Link.tsx:22-27`, base-controls "External destination refused"), so these two are native `<a>` elements. They need the link look and the focus ring without copying `Link`'s class list (criterion C).
    - Options:
      - a) A small `base-controls` delta in this change: `Link.tsx` exports its treatment classes (for example `LINK_CLASSES`) from `@/shared/ui`, as `BADGE_GEOMETRY_CLASSES` is exported for chips; the two anchors use them. Same tab, as the menu's Security entry.
      - b) A new `ExternalLink` component in `base-controls`.
      - c) Copy the classes into the feature and add a backlog entry.
    - Recommendation: a). It reuses the settled treatment, adds no component and follows the `BADGE_GEOMETRY_CLASSES` precedent (decisions log "geometría de chip compartida"). Same tab keeps the behaviour of the menu entry; the session returns through silent re-authentication. Source: `Link.tsx`, `UserMenu.tsx:139`.
    - Blocks propose: no (the body uses a); b) or c) change one file of the plan).

## Review log

- **2026-10-06, design lead (review of Product owner's draft).**
  - Reflected the closed points: 9.1 (camelCase body, optional `role`) and 9.6 (contacts out). 9.2 and 9.3 kept open with Product owner's recommendations (Open 3, Open 2); 9.7 merged into Open 2.
  - **R1 — routes (criterion B, contradiction with merged code).** The registration paths follow the merged landing links; the account paths followed the merged menu. (Superseded for the account routes by Open 6's answer: see R6.)
  - **R2 — endpoint paths.** Checked against the contract on `develop`: writes on `/users/{user_ulid}`, `/password`, `/force`; read on `/user`. Added the `operationId`s.
  - **R3 — step-up wording.** The front sends no `prompt`; the API forces the login itself (`RequireLoginForWriteScope.php`).
  - **R4 — 403 premise.** A failed step-up ends `anonymous`, so a `403` means the token lacks the write scope.
  - **R5 — 422 key for passwords (verified).** A mismatch is reported under `password`.
  - Added: settled inputs, contract table, behaviour per operation, components, layout and spacing (criterion A, D14), contrast measured by script, guard pairs, responsive table, catalog texts, tests, visual reference, findings F1–F4.
- **2026-10-06, design lead (redraft to Product owner's answers).**
  - **R6 — Open 6 answered c):** routes reduced to `/[locale]/register`, `/[locale]/register/coffeeshop`, `/[locale]/account`; the page redrafted as four section cards (§5.2–§5.7, §6.2, §6.3); the external Security and password-reset links added (§5.5, §5.6; API routes verified read-only in `tazavera-api/routes/web.php` and `config/fortify.php`); the `app-shell` delta written (§6.6) with the files, keys, spec wording and tests it touches; texts redrafted (§7: page and section keys added, per-page title keys and `backToProfile`, `loadError`, `retry` removed); tests and wireframe redrafted (§10, §11). Open 6 set to "Blocks propose: no".
  - **R7 — no page load of `GET /user` (criterion B, semantic consequence of Open 7).** The earlier §5.2 loaded `GET /user` on every account page only because the session copy could go stale (old Open 7). With `refreshProfile()` keeping the session current and `GET /user` the only source of user data (add-auth D5), the page reads the session user; the page error and "Try again" state, and its texts, are removed. No scope, token or visible change beyond dropping a duplicate request. Product owner may reopen it.
  - **R8 — aligned with the other answers:** `PageSection` from `@/shared/ui` (Open 8 done, §6.3); `ConfirmDialog` from `add-evaluation-scales`, base AlertDialog (§0, Open 11); reactive step-up after `403` (§5.3); `refreshProfile()` added by this change in `auth` because the merged add-auth lacks it (§6.7, F3); client checks per the contract's `requestBody` with new catalog keys (§5, §7); any 422 generic (§8); registration redirect when `authenticated` and signed-out state with a button (§5.1, §5.2).
  - **R9 — F2 closed:** `fix-button-boundaries` is merged; the Danger zone triggers now use `action-2` (the removal treatment settled for `add-specialist-evaluations`), whose label and boundary pairs are already registered.
  - **Added:** Open 13 (external link treatment, non-blocking, body follows its recommendation); findings F5 (R8 missing from the backlog) and F6 (forgot-password behind `guest`, unverified).
  - **Not re-measured:** no shell in this session; every new element uses a pair already measured in the first review or registered in the guard.
  - No Open point blocks propose: line 1 set to "ready for approval".

## Propose status

- Change-id: `add-user-account`. Date: 2026-10-06. `openspec validate add-user-account --strict` passes ("Change 'add-user-account' is valid").
- Artifacts: `openspec/changes/add-user-account/` — proposal, spec deltas `user-account` (new, with Purpose), `app-shell` and `auth`, design.md, tasks.md. No `base-controls` delta (see N1 below).
- Resolved:
  - **B1** (decisions log entry "add-user-account: bloqueos del explore"): the screens in `src/pages/register` and `src/pages/account` inject the session and the auth actions (`signIn`, `signOut`, `requestProfileWrite`, `refreshProfile`) as props into the `src/features/user-account` components, as `SessionShell` does for `AppHeader`; no feature imports another feature; `features/user-account` stays one slice (design.md D1).
  - **B2** (same entry): the browser-validation decision governs — `updateAUser` documents no required field, so Profile validates only the email format; no Profile field is required or marked required, and an emptied field is sent and returns as the generic `422` error (design.md D2; spec "Profile settings").
  - **N1**: the `LINK_CLASSES` export changes no observable behaviour, so no `base-controls` delta is listed; the `Link.tsx` edit rides in a user-account commit (design.md D4).
  - **N2–N3**: the auth scenario "The profile cannot be resolved" is scoped to the session's first resolution, and `refreshProfile`'s outcomes are added (settle from a new `GET /user`, one retry on network/5xx, previous user kept silently on a second failure; the `401` stays under "Keeping the session alive") (specs/auth delta; design.md D5).
  - **N4**: line citations fixed in the artifacts (`AboutContent.tsx:115/:118`; `AppHeader.test.tsx:42-46`, `:636-644`, `:653-661`, `:715`; the rest verified as cited).
  - **N5**: generated utility names are used (`border-border-subtle` for the Danger zone separator) (design.md D10).
  - **N6**: a `401` on a write that no recovery resolves ends the session `anonymous`, and the account page then shows the signed-out state (spec "Account page and its session gate"; design.md D6).
  - **N7**: the confirmation dialogs' descriptions reuse `deactivateText` / `deleteText`; no description key is added (design.md D3).
  - **Tasks:** the Danger zone is scheduled early (group 4) and the apply waits for `add-evaluation-scales` (`ConfirmDialog`) merged into `develop` (design.md D7; tasks.md preamble).
- Open (non-blocking): F1 (`role` required in practice — reported to Product owner for the API), F5 (backlog R8 not yet in `docs/backlog.md`), F6 (`{API}/forgot-password` behind Fortify's `guest` — checked in task 9.2), the API's CORS fix before the real-browser verification, the Catalan drafts and the final copy (Product owner's), and the MVC captures of Open 12 (the §11 wireframe stands meanwhile).
- Reported, not edited, in this file: the `AboutContent.tsx` citations (119/122 are 115/118) and the `AppHeader.test.tsx` citations (43-46 is 42-46; 641-644 and 658-661 are 640-644 and 657-661); `border-subtle` in §6.3 is the generated `border-border-subtle`; §5.4 and §6.1's "required on every field" is superseded by B2 for the Profile fields. The decisions log entry 'add-user-account: bloqueos del explore' is not yet in `docs/general-context.md`; its two answers are recorded above as given by Product owner.
