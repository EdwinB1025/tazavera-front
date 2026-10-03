# add-app-shell — Design summary

Capability: `app-shell`. Foundation for `add-landing` and `add-user-account`, which rely on the contracts in section 1.

## 1. Shared contracts

- **Routes:** everything under `app/[locale]/`; locales `es` (default), `en`, `ca`; `/` redirects to `/es`. `/callback` stays outside the prefix and is excluded from the next-intl proxy (the `redirect_uri` registered in Passport is unique).
- **Routes reserved for other changes:** `/[locale]/about` (add-landing), `/[locale]/account/*` (add-user-account), `/[locale]/manage/*` (management mode), `/[locale]/offerings` (listing, later change).
- **Messages:** `messages/{locale}/{area}.json`, one file per area. This change creates `shell`; `landing` and `account` are created by their own changes.
- **Session:** a module in `src/features/auth` exposes the state (anonymous, loading, authenticated), the user from `GET /user` (ulid, name, surname, email, role), sign in, sign out, and request the `profile:write` scope (step-up) returning to a given route.
- **API client** (`src/shared/api`): base `NEXT_PUBLIC_API_URL`; adds the Bearer token; on a 401 it tries to refresh and, if that fails, starts re-authentication.
- **Theme:** `data-theme="dark"` on `<html>`; the preference is stored in the browser (not sensitive) and is sent to the API as `theme`.

## 2. Authentication (Authorization Code + PKCE)

- **Start:** to `/oauth/authorize` with `client_id`, `redirect_uri`, `scope=profile:read`, `state`, `code_challenge` (S256), `theme` and `lang`. `code_verifier`, `state` and the return route are kept in `sessionStorage` only for the duration of the flow.
- **`/callback`:** checks `state`, exchanges the code at `/oauth/token` (form-urlencoded, no secret), deletes the flow data and returns to the saved route.
- **Tokens:** access and refresh tokens only in memory. Automatic refresh with `grant_type=refresh_token` before expiry or on a 401.
- **Reload:** see section 7.
- **Sign out:** `POST /logout`, memory is cleared and the user returns to `/[locale]`.

## 3. Header

- **Signed out:** `bg-nav-surface`, `h-16`. Logo → `/[locale]`. From `md`: "Top rated" → `/[locale]/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc` and "About us" → `/[locale]/about`. Language selector. "Sign in" button with the `nav-button-*` tokens. On mobile: logo, language selector and "Sign in".
- **Signed in:** logo, language selector and avatar (initials, `nav-avatar*` tokens) with a dropdown menu:
  - **Profile settings:** profile, edit, password, deactivate or delete account (routes `/[locale]/account/*`), security (the API's `/user/security`, external link) and theme selector.
  - **Management by role:** `coffeeshop` → "Manage offerings"; `specialist` → "Manage evaluations" (routes `/[locale]/manage/*`).
  - **Sign out.**
- Focus with `focus-visible:focus-ring`; accessible name on the avatar and the selector.

## 3b. Logo

- **Source:** the original SVG (`favicon.svg` from the previous app), copied to `docs/design/add-app-shell/`. Used inline, without metadata, with `useId` for the leaf gradient id. Front favicon: `app/icon.svg` with the same drawing.
- **`Logo` component** in `src/shared/ui`: variants `icon` (drawing only), `inline` (drawing + text on the right) and `stacked` (text below); `size` prop; wrapped in a Link to `/[locale]`. "TAZAVERA" text with `type-brand`.
- **New tokens** (one per part of the drawing, in both themes):
  - `--color-logo-leaf`: brand primitive `#688f25` in traditional; `night-moss-300` in black.
  - `--color-logo-cup`: `#0c3151` in traditional; `night-sage-100` in black.
  - `--color-logo-coffee`: `#472e2e` in traditional; `#9b7e7d` in black.
  - The three brand values and `#9b7e7d` are added as new primitives.
- **Usage:** signed-out and signed-in header with the `inline` variant (`icon` on mobile).
- **Contrast on `nav-surface`** (traditional `sage-400` / black `night-sage-900`): cup 5.9:1 / 11.2:1; coffee 5.4:1 / 4.0:1; leaf 1.7:1 / 8.1:1; `type-brand` text 6.1:1 / high. The leaf in traditional falls below 3:1; accepted, because `nav-surface` is the background for every header and logotypes are exempt from WCAG contrast requirements.

## 4. Sidebar (management mode)

- Only when signed in and on `/[locale]/manage/*` routes. shadcn Sidebar from `md`, collapsible; on mobile, a full-screen Sheet.
- Existing navigation tokens: `nav-surface-dark`, `nav-current-dark`, `nav-indicator`, `nav-underline`, `nav-text-dark`, `nav-hover`.
- Role-specific entries are added by the management changes; this change only provides the layout and the slot.

## 5. shadcn and i18n

- **shadcn init (task of this change):** Radix base; aliases `ui` → `@/shared/ui`, `utils` → `@/shared/lib/utils`, `lib` → `@/shared/lib`, `hooks` → `@/shared/lib/hooks`. The variables it writes to `globals.css` are discarded; existing tokens are not touched (`theme-tokens.test.ts` green).
- **shadcn components:** classes remapped to semantic tokens; icons only through `icons.ts`; exported from `src/shared/ui/index.ts`.
- **next-intl** (v4, App Router): no literal text in components; texts arrive as props from pages and features.

## 6. Security

- `dangerouslySetInnerHTML` is forbidden in `src/`: guard `xss-guard.test.ts`, same pattern as the existing guards.
- Content-Security-Policy header: own scripts only; `connect-src` includes the API origin.

## 7. Re-authentication on reload

- On sign in, a non-sensitive "had a session" flag (no token) is stored in the browser; it is removed on sign out.
- When the app loads with no tokens in memory: without the flag, the user stays anonymous with no redirect. With the flag, the app calls `/oauth/authorize` with `prompt=none` and `scope=profile:read` (never `profile:write`: the API forces a login for that scope).
- `/callback` handles both returns: with `code`, the normal exchange; with `error` (`login_required` or any other), it removes the flag and returns to the saved route as anonymous, without showing the login.

## 8. Out of scope

Landing page, About us and cards (add-landing); registration and profile settings (add-user-account); management mode content and offerings listing (later changes); forum.