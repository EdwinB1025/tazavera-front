# add-app-shell — Design summary

Capabilities: `app-shell`, `theming` (logo tokens). Built in parallel with `add-auth`; the signed-in branch of the header consumes the session contract owned by `add-auth` and lights up when that change lands.

## 1. Shared contracts

- **Routes:** everything under `app/[locale]/`; locales `es` (default), `en`, `ca`; `/` redirects to `/es`. Routing through `proxy.ts` (Next 16 convention). `/callback` stays outside the prefix and is excluded from the proxy (owned by `add-auth`).
- **Routes reserved for other changes:** `/[locale]/about` (add-landing), `/[locale]/account/*` and `/[locale]/register*` (add-user-account), `/[locale]/manage/*` (management mode), `/[locale]/offerings` (listing, later change).
- **Messages:** `messages/{locale}/{area}.json`, one file per area. This change creates `shell`; every other change creates its own area file.
- **Session (consumed, owned by `add-auth`):** state (anonymous, loading, authenticated), user (ulid, name, surname, email, role), sign in, sign out. Until `add-auth` lands, the header renders as anonymous.
- **Theme:** `data-theme="dark"` on `<html>`; the preference is stored in a cookie (not sensitive), read on the server by the root layout so the page renders in the right theme with no flash. The only theme selector is the one in the user menu. `add-auth` reads the same cookie to send `theme` to the API.

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

- **Source:** the original SVG (`favicon.svg` from the previous app) in `docs/design/add-app-shell/`. Inline, without metadata, with `useId` for the leaf gradient id. Front favicon: `app/icon.svg` with the same drawing, adapted to both themes the only way a favicon can: an embedded `<style>` with the traditional colors as literal hex values and an `@media (prefers-color-scheme: dark)` block with the dark ones. A favicon cannot read the page's `data-theme`, so it follows the operating system preference, not the theme chosen in the app; browsers without that support (Safari) show the traditional colors.
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

## Propose status

- **Change-id:** `add-app-shell`
- **Date:** 2026-10-04
- **`openspec validate add-app-shell --strict`:** `Change 'add-app-shell' is valid` (4/4 artifacts complete)

### Resolved, with its decision

1. **Session seam.** The shell receives the session as input and `add-auth` owns `src/features/auth`. Forced by "Session (consumed, owned by `add-auth`)" in section 1 together with both changes being built in parallel. Until `add-auth` lands, the shell supplies an anonymous session. The one file both changes touch is the expression that supplies it. (design.md D3)
2. **Root layout placement.** `app/layout.tsx` stays the root layout and keeps `<html>` and `<body>`; the shell wiring lives in `src/app/shell/`. Making `app/[locale]/layout.tsx` the root layout was rejected because `/callback` sits outside the prefix and belongs to `add-auth`, which would then have to restructure this change's file. (design.md D1)
3. **Ownership of `/[locale]`.** Product owner's decision: this change owns the root route and renders an empty main area, which `add-landing` fills later. (design.md D13 file list)
4. **Route files and screens.** Root `app/` route files import their view from `src/`; the shell composition sits in `src/app/shell/` because FSD forbids one widget importing another, so the composition cannot be a widget. (design.md D1)
5. **Message catalogs.** `messages/{locale}/{area}.json` at the project root, exactly as section 1 states, with the loader in `src/shared/lib/i18n/` so every layer can read an area's catalog. (design.md D10)
6. **Content-Security-Policy.** A per-request nonce generated in `proxy.ts`, the only strict-CSP path Next 16 documents. `style-src` keeps `'unsafe-inline'` and no nonce, because a nonce there suppresses `'unsafe-inline'` and the Radix overlays set inline styles for positioning. (design.md D9)
7. **Brand wordmark.** `TAZAVERA` is brand artwork, not interface text: it is a literal in the component and is invariant across locales. This is the explicit carve-out from the "no literal text" rule of section 6, with a spec scenario asserting it. (design.md D7)
8. **Logotype contrast.** The traditional leaf at 1.7:1 is admitted by adding a logotype exemption to `theming`, which WCAG 2.2 SC 1.4.11 already grants ("part of a logo or brand name"). This is why the change carries a `theming` delta. (design.md D8)
9. **Breakpoints.** "Small" and "medium and larger" mean Tailwind's `md`, 768px, throughout the spec. (design.md D11)
10. **Theme mechanism.** Built here, because section 1 lists `Theme` among the shared contracts `add-landing` and `add-user-account` rely on. One module, `src/shared/lib/theme.ts`, reads, writes and applies the preference. (design.md D12)
11. **Derived types.** `SessionUser`, `UserRole` and `Session` live in `src/shared/api/index.ts`, built from `operations` because `components.schemas` is `never`. (design.md D4)
12. **Contract gaps.** Accepted knowingly per the product owner: `/user/security`, `theme`, `lang` and `prompt` are web routes and parameters of the API and are intentionally absent from `openapi.yaml`; the OAuth endpoints are documented in `add-auth`'s design.

### Open, for the product owner

1. **The nonce forces dynamic rendering.** The documented strict-CSP path needs a fresh nonce per request, so no route — including the future public landing page — can be statically rendered. The security rule of section 6 is only achievable this way in Next 16, so the design accepts it, but it is a performance consequence the summary does not mention. If it is unacceptable, the alternatives are a hash-based CSP or relaxing `script-src`, and either would be its own change with its own spec delta. (design.md Risks)
2. **`SessionUser` and `UserRole` may be defined twice.** The task rules have this change define its derived types, and `add-auth` needs the same ones while building in parallel in `src/shared/api/index.ts`. `add-auth` should import them from `@/shared/api` rather than redefine them. If both end up defining them, that duplication is a `docs/backlog.md` candidate — that file is kept by the product owner, so this is reported rather than written.
3. **The theme mechanism is shared with `add-user-account`.** Per item 10 above, `add-app-shell` builds `src/shared/lib/theme.ts` and `add-user-account` has a theme setting of its own. That change should consume the same module. Same reporting reason as item 2.
4. **A wording check on section 3.** "Profile settings: … security and theme selector" is read here as the menu offering the profile-settings links, the external security link, and a theme selector control — while section 8 puts "profile settings" itself out of scope, meaning the theme setting *page* belongs to `add-user-account`. If the intent was instead that the menu links to a theme setting page and ships no theme control of its own, tasks 6.1 and 6.2 and design.md D12 change; say so and they will be revised.