# add-app-shell — Design summary

Capabilities: `app-shell`, `theming` (logo tokens). Built in parallel with `add-auth`; the signed-in branch of the header consumes the session contract owned by `add-auth` and lights up when that change lands.

## 1. Shared contracts

- **Routes:** everything under `app/[locale]/`; locales `es` (default), `en`, `ca`; `/` redirects to `/es`. Routing through `proxy.ts` (Next 16 convention). `/callback` stays outside the prefix and is excluded from the proxy (owned by `add-auth`).
- **Routes reserved for other changes:** `/[locale]/about` (add-landing), `/[locale]/account/*` and `/[locale]/register*` (add-user-account), `/[locale]/manage/*` (management mode), `/[locale]/offerings` (listing, later change).
- **Messages:** `messages/{locale}/{area}.json`, one file per area. This change creates `shell`; every other change creates its own area file.
- **Session (consumed, owned by `add-auth`):** state (anonymous, loading, authenticated), user (ulid, name, surname, email, role), sign in, sign out. Until `add-auth` lands, the header renders as anonymous.
- **Theme:** `data-theme="dark"` on `<html>`; the preference is stored in the browser (not sensitive). `add-auth` sends it to the API as `theme`.

## 2. Layout and main area

- Root layout per locale: header on top and main area below.
- Main area: content region with `bg-surface-page`. When the management sidebar is present (section 5), the area gains a sidebar column from `md`; without it, a single column.

## 3. Header

- **Signed out:** `bg-nav-surface`, `h-16`. Logo → `/[locale]`. From `md`: "Top rated" → `/[locale]/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc` and "About us" → `/[locale]/about`. Language selector. "Sign in" button with the `nav-button-*` tokens (calls the session's sign in). On mobile: logo, language selector and "Sign in".
- **Signed in:** logo, language selector and avatar (initials, `nav-avatar*` tokens) with a dropdown menu (shadcn DropdownMenu):
  - **Profile settings:** profile, edit, password, deactivate or delete account (routes `/[locale]/account/*`), security and theme selector. Security is a web page of the API (`{NEXT_PUBLIC_API_URL}/user/security`), opened as an external link; it is not a REST endpoint, so it is intentionally absent from `openapi.yaml`.
  - **Management by role:** `coffeeshop` → "Manage offerings"; `specialist` → "Manage evaluations" (routes `/[locale]/manage/*`).
  - **Sign out** (calls the session's sign out).
- Language selector: changes the locale prefix of the current route.
- Focus with `focus-visible:focus-ring`; accessible name on the avatar, the menu trigger and the language selector.

## 4. Logo

- **Source:** the original SVG (`favicon.svg` from the previous app) in `docs/design/add-app-shell/`. Inline, without metadata, with `useId` for the leaf gradient id. Front favicon: `app/icon.svg` with the same drawing.
- **`Logo` component** in `src/shared/ui`: variants `icon`, `inline` (text on the right) and `stacked` (text below); `size` prop; wrapped in a Link to `/[locale]`. "TAZAVERA" text with `type-brand`.
- **New tokens** (both themes): `--color-logo-leaf` `#688f25` / `night-moss-300`; `--color-logo-cup` `#0c3151` / `night-sage-100`; `--color-logo-coffee` `#472e2e` / `#9b7e7d`. The three brand values and `#9b7e7d` are added as new primitives.
- **Usage:** `inline` in the header (`icon` on mobile).
- **Contrast on `nav-surface`** (traditional / black): cup 5.9:1 / 11.2:1; coffee 5.4:1 / 4.0:1; leaf 1.7:1 / 8.1:1; `type-brand` 6.1:1 / high. The traditional leaf below 3:1 is accepted: `nav-surface` is the background for every header and logotypes are exempt from WCAG contrast requirements.

## 5. Sidebar (management mode)

- Only when signed in and on `/[locale]/manage/*` routes. shadcn Sidebar from `md`, collapsible; on mobile, a full-screen Sheet.
- Existing navigation tokens: `nav-surface-dark`, `nav-current-dark`, `nav-indicator`, `nav-underline`, `nav-text-dark`, `nav-hover`.
- Role-specific entries are added by the management changes; this change provides the layout and the slot.

## 6. shadcn and next-intl

- **Approved dependencies:** next-intl (v4) and the Radix packages pulled by shadcn.
- **shadcn init (task of this change):** Radix base; aliases `ui` → `@/shared/ui`, `utils` → `@/shared/lib/utils`, `lib` → `@/shared/lib`, `hooks` → `@/shared/lib/hooks`. The variables it writes to `globals.css` are discarded; existing tokens are not touched (`theme-tokens.test.ts` green).
- **Only components we do not own:** Sidebar, Sheet and DropdownMenu. Never shadcn's Button, Input, Select, Checkbox, Radio or Textarea. When a pulled component depends on one of those (Sidebar pulls Button and Input), it is rewired to the project's controls and the duplicate is deleted.
- **shadcn components:** classes remapped to semantic tokens; icons only through `icons.ts`; exported from `src/shared/ui/index.ts`.
- **next-intl:** no literal text in components; texts arrive as props from pages and features. Read `node_modules/next/dist/docs/` before fixing the routing file.

## 7. Security

- `dangerouslySetInnerHTML` is forbidden in `src/`: guard `xss-guard.test.ts`, same pattern as the existing guards.
- Content-Security-Policy header: own scripts only; `connect-src` includes the API origin.

## 8. Out of scope

Authentication flow and API client (`add-auth`); landing, About us and cards (`add-landing`); registration and profile settings (`add-user-account`); mobile filter panel (`filtering`); management content and offerings listing (later changes); forum.