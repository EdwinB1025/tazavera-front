# Proposal

## Why

The application has no shell. `app/page.tsx` is still the create-next-app boilerplate, the app has a single route, no header, no navigation, no locale, no message structure and no front-wide security posture. Every change planned next — `add-landing`, `add-user-account` and the management screens — needs the same header, the same locale routing and the same message and security structure, and without this change each would re-invent them and drift. This change provides the shared shell once so those changes only fill its regions.

## What Changes

- **Locale routing.** All application routes move under `app/[locale]/` for the locales `es` (default), `en` and `ca`; `/` redirects to `/es`. Routing runs through `proxy.ts`, the Next 16 convention (the `middleware` convention is deprecated).
- **Root layout and main area.** Header on top and a main content region below it, using `bg-surface-page`. The main area gains a sidebar column from `md` when the management sidebar is present, and stays a single column without it.
- **Header.** A signed-out and a signed-in variant: brand logo, "Top rated" and "About us" navigation from `md`, a language selector, a "Sign in" action, and in the signed-in state an avatar menu holding profile settings, a theme selector, the management entry for the user's role and sign out.
- **Theme mechanism.** The read, write and application of the theme preference to `data-theme="dark"` on the document root, kept in the browser so it needs no sign in and survives a reload. It is one of the shared contracts later changes rely on, so it is built once here and reused rather than written again by the profile settings.
- **Brand logo.** The original logotype drawing becomes a logo element with `icon`, `inline` and `stacked` forms and a size, wrapped in a link to the locale root, plus the front favicon. Three new brand logotype color tokens render its parts in both themes.
- **Management sidebar.** The layout and a slot on `/[locale]/manage/*`: collapsible from `md`, a full-screen sheet on mobile. The entries themselves come from the management changes.
- **Message structure.** next-intl setup with one message file per area and locale at `messages/{locale}/{area}.json`; this change creates the `shell` area. Components carry no literal text; texts arrive as props.
- **Front-wide security.** Automated verification that `dangerouslySetInnerHTML` never appears in `src/`, and a Content-Security-Policy header that allows own scripts and `connect-src` to the API origin.
- **Shared overlay and navigation infrastructure.** The shadcn base (Radix) with only the components this project does not already own — sidebar, sheet and dropdown menu — restyled with the project's semantic tokens, using the project's icon entry point, and rewired to the project's own controls wherever a pulled component would otherwise introduce a duplicate.

**BREAKING:** `app/layout.tsx` and `app/page.tsx` (create-next-app boilerplate) are replaced by the locale-scoped layout. `/` no longer renders a page; it redirects to `/es`.

## Capabilities

### New Capabilities

- `app-shell`: the application shell — locale routing and message structure, the header in both session states with its brand logo, language selector and avatar menu, the management sidebar and its slot, the main area, and the front-wide security rules.

### Modified Capabilities

- `theming`: adds the three brand logotype color tokens with a value in both themes, and exempts logotypes from the 3:1 non-text contrast rule — the leaf measures 1.7:1 on `nav-surface` in the traditional theme.

## Out of Scope (non-goals)

- **Authentication flow and API client** (`add-auth`): `/callback`, the Authorization Code + PKCE flow, in-memory tokens, refresh, silent re-authentication, sign out and the `profile:write` step-up. This change consumes the session contract `add-auth` owns and renders the header as anonymous until that change lands.
- **Landing page, About us and cards** (`add-landing`).
- **Registration and profile settings** (`add-user-account`).
- **Mobile filter panel** (`filtering`).
- **Management content and the offerings listing** (later changes); this change provides the sidebar layout and slot only.
- **Forum.**
- **Any change to `contracts/openapi.yaml`.** This change consumes no REST endpoint and the contract is not touched.

## Impact

- **Code (all under `src/` unless stated):** New — `proxy.ts` at the project root (FSD layer `app`), `app/[locale]/` routing files and `app/icon.svg` (FSD layer `app`), locale and message wiring under `src/app/`, the app shell and header blocks under `src/widgets/`, the logo and the pulled overlay and navigation components under `src/shared/ui/`, the shared helper segment `src/shared/lib/`, and the guard test beside the existing guards in `src/shared/ui/`. Modified — `app/layout.tsx`, `src/app/styles/globals.css` (FSD layer `app`; three logo tokens and their primitives), `src/shared/ui/index.ts`, and `src/app/styles/theme-tokens.test.ts`.
- **Dependencies:** Added — next-intl (v4) and the Radix packages that the shadcn sidebar, sheet and dropdown menu pull in. Both approved by the product owner. None removed or upgraded.
- **API:** No endpoint is consumed. The user data the header shows (`name`, `surname`, `role`) arrives through the session contract owned by `add-auth`, which reads `GET /user`. No generated type in `src/shared/api/schema.ts` is edited.
- **Existing behavior:** `base-controls` and `form-fields` are unchanged. Their controls are reused, not modified: the pulled shadcn components are rewired to them where they would duplicate them.
