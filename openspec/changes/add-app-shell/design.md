# Design

## Context

See `proposal.md` — Why. The constraints that shape the approach:

- The design summary (`docs/design/add-app-shell/design-summary.md`) settles the product decisions. This document works out the implementation and records what that left open.
- `add-auth` is built in parallel and **owns** `src/features/auth`, `/callback` and the API client. This change must compile and render without them.
- `add-landing`, `add-user-account` and the management changes build on the shell and must not have to change it.
- `contracts/openapi.yaml` is not touched. `theme`, `lang`, `prompt` and `/user/security` are web routes and parameters of the API (Fortify/Passport pages and an API web middleware) and are intentionally absent from it — they will never appear there (product-owner decision). The OAuth endpoints `/oauth/authorize` and `/oauth/token` are described only in the contract's `bearerAuth` security scheme and are documented in `add-auth`'s design, not here.
- Next 16 facts taken from `node_modules/next/dist/docs/`: the `middleware` file convention is deprecated and renamed `proxy` (`03-api-reference/03-file-conventions/proxy.md`); `proxy.ts` goes at the project root, beside `app/`, because `app/` is not inside `src/`; the root layout may be nested under the locale folder, but a route outside it then has no root layout.

## Goals / Non-Goals

**Goals:**

- One shell that later changes fill rather than rebuild, with the region boundaries frozen now.
- The signed-in shell is complete and verified against the session contract even though nothing can drive it yet.
- The front end ships a real security posture from the first deployable commit.

**Non-Goals:**

- Any request to the API. This change issues none.
- A live signed-in state. Until `add-auth` lands, the session source is the anonymous constant.
- Static rendering. The CSP decision (D9) makes every page dynamic; optimising for static output is a later concern and is not settled here.

## Decisions

### D1 — Root layout at the project root, shell wiring under `src/app`

`app/layout.tsx` stays the root layout and keeps rendering `<html>` and `<body>`; `app/[locale]/layout.tsx` renders the shell. The alternative — making `app/[locale]/layout.tsx` the root layout, as the i18n guide allows — was rejected because `/callback` sits outside the locale prefix and is owned by `add-auth`: that change would then have to add `app/layout.tsx` and demote this change's file to a nested layout, restructuring `add-app-shell` after it lands.

The root `app/` folder stays Next.js routing only. The shell's composition has session and message resolution in it, so it lives in `src/app/shell/` — FSD's "layout wiring" — which may import from `widgets` and `shared` below it. `src/widgets/*` cannot compose each other (a layer may not import between slices of its own layer), which is why the composition is not a widget.

### D2 — Locale routing and security headers in `proxy.ts`

`proxy.ts` at the project root does three things: prefix a bare path with the default locale, redirect `/` to `/es`, and set the Content-Security-Policy (D9). It runs before filesystem routes, so the redirect wins over any page at `/` and `app/page.tsx` is deleted. `/callback` is excluded by the matcher so `add-auth` owns its request entirely.

The locale list and the default live in `src/shared/config/locales.ts` and are imported by `proxy.ts` and by the shell. That module is pure constants with no runtime state, which is what the proxy isolation guidance in `03-api-reference/03-file-conventions/proxy.md` actually warns about.

A path whose first segment is not a supported locale is redirected to the same path under the default locale (`/fr/about` → `/es/fr/about`), which resolves to not-found: no screen renders in an unsupported locale.

### D3 — The shell takes the session as input; `add-auth` owns the session module

Because `add-auth` owns `src/features/auth` and both changes run in parallel, this change neither creates nor imports it. The header and the sidebar receive the session as input, and `src/app/shell/AppShell.tsx` supplies it.

Until `add-auth` lands, the shell supplies an anonymous session — exactly the agreed end state. When `add-auth` lands it supplies the real session and the signed-in branch lights up without touching the header.

Rejected alternative: creating `src/features/auth` here with an anonymous-only implementation for `add-auth` to replace. It contradicts the settled ownership and makes both changes collide on one file, which defeats building them in parallel.

The seam is the derived `SessionState` type (D4). The one file both changes still touch is `AppShell.tsx`, and only at the single expression that supplies the session.

### D4 — Derived types, defined before any component

`src/shared/api/schema.ts` declares no named schemas (`components.schemas` is `never`), so every derived type is built from `operations`. Defined in `src/shared/api/index.ts`, before any component:

```ts
import type { operations } from "./schema";

type UserResponse =
  operations["getTheAuthenticatedUser"]["responses"][200]["content"]["application/json"];

/** `data` of `GET /user`. All fields are optional in the contract. */
export type SessionUser = NonNullable<UserResponse["data"]>;

/** Role values the shell branches on. */
export type UserRole = SessionUser["role"];

/** What the shell receives from the session owner. */
export type Session =
  | { state: "loading" }
  | { state: "anonymous" }
  | { state: "authenticated"; user: SessionUser };
```

`Session` is UI-specific: it names the three states the shell renders. `SessionUser` and `UserRole` are derived from the generated types and are not redefined by `add-auth`, which imports them from `src/shared/api`. Note that the generated `data` fields are all optional, so consumers must handle `undefined` rather than assuming a complete user.

### D5 — API endpoints consumed, and how errors reach the user

This change issues **no** request. The only API data it displays arrives through the session contract owned by `add-auth`. Documented in full for the design rule:

**`GET /user`** — issued by `add-auth`; this change reads three fields of its payload.

| | |
|---|---|
| Method and path | `GET /user` |
| Auth | `Authorization: Bearer <access token>`; scope `profile:read` or `profile:write` |
| Request | No parameters, no body |
| Response `200` | `{ "data": { "ulid": string, "name": string, "surname": string, "email": string, "role": string } }` |
| Errors | `401` when the token is missing, expired past refresh, or lacks the scope |

Field mapping (design rule: every piece of data shown maps to a real API field):

| UI element | API field |
|---|---|
| User control initials | `data.name`, `data.surname` |
| User control accessible name | `data.name`, `data.surname` |
| Choice of management entry | `data.role` (`coffeeshop`, `specialist`) |

No other API field is displayed. `data.ulid` and `data.email` are part of the session contract but are not rendered by the shell.

**`{NEXT_PUBLIC_API_URL}/user/security`** — a web page of the API (Fortify), opened as a link from the user menu. It is not a REST endpoint, the front end makes no request to it, and it is intentionally absent from `contracts/openapi.yaml`. It is an external destination, so it is rendered natively and not through the internal link treatment, as `base-controls` already specifies. The menu's internal destinations do use the internal link treatment — the five profile settings entries (profile, edit, password, deactivate account, delete account) at `/[locale]/account/*` and the management entry at `/[locale]/manage/*` — so choosing one does not reload the page and wipe the in-memory tokens.

**Error presentation.** This change shows no API error. When the session cannot be resolved — including a `GET /user` failure — the shell renders the anonymous header: "Sign in", no user menu. There is no error message, no error page and no retry affordance, because the signed-out shell is always usable and a session failure is not the user's problem to fix. The unresolvable session reaches the shell as `{ state: "anonymous" }`; the `Session` union of D4 is unchanged. This is the "Session unresolvable" scenario in `specs/app-shell/spec.md`.

The shared card is not used by this change, so the card field-mapping rule does not apply.

### D6 — shadcn pulls only what we do not own

shadcn init runs once with Radix as the base and the aliases `ui` → `@/shared/ui`, `utils` → `@/shared/lib/utils`, `lib` → `@/shared/lib`, `hooks` → `@/shared/lib/hooks`. Whatever variables it writes into `globals.css` are discarded on the spot; no existing token is touched and `theme-tokens.test.ts` stays green.

Only three components are pulled: **Sidebar**, **Sheet** and **DropdownMenu** — the accessibility surface this project has no equivalent for (focus trapping, roving focus, portal, dismissable layer). Never pulled: Button, Input, Select, Checkbox, Radio, Textarea. Where a pulled component imports one of those (the Sidebar template pulls Button and Input), it is rewired to the project's control and the generated duplicate is deleted rather than shipped alongside `base-controls` and `form-fields`.

Every pulled component gets its classes remapped to semantic tokens, takes its icons only through `src/shared/ui/icons.ts`, and is re-exported from `src/shared/ui/index.ts`. This is what keeps `color-guard.test.ts`, `radius-guard.test.ts` and `icons.test.ts` passing on the new files.

The alternative — building a focus-trapped overlay and a roving-focus menu by hand — was rejected: those three are the parts where hand-rolled accessibility fails most often and hardest.

### D7 — Brand logotype

The drawing is the original `favicon.svg` in `docs/design/add-app-shell/`, inlined as JSX with the Inkscape metadata stripped and the leaf gradient id generated per instance with `useId`, so two logotypes on one page do not collide.

`app/icon.svg` carries the same drawing as the browser icon, adapted to both themes the only way a favicon can be: an embedded `<style>` that gives the leaf, cup and coffee parts a class each and fills them with the traditional colors as literal hex values (`#688f25`, `#0c3151`, `#472e2e`), plus an `@media (prefers-color-scheme: dark)` block reassigning them to the dark ones (`#bec387`, `#c9e5e0`, `#9b7e7d` — `night-moss-300`, `night-sage-100` and the new coffee primitive). A favicon cannot read the page's `data-theme`, so it follows the operating-system appearance rather than the theme chosen in the app, and a browser with no support for a dark icon (Safari) shows the traditional colors. These hex literals are artwork definition, not interface text, and are exempt from the no-literal-text rule exactly as the wordmark is.

Three forms, settled in the design summary: `icon` (drawing alone), `inline` (wordmark to the right), `stacked` (wordmark below). Each wraps in the internal link to the locale root. The header uses `inline`, and `icon` on small viewports. In the `icon` form the drawing names no destination, so the link carries an accessible name taken from the `shell` catalog (`brandLink`) and supplied by the caller.

"TAZAVERA" is brand artwork, not interface text: it is the `WORDMARK` constant of the component and does not change with the locale, so the no-literal-text rule needs no carve-out for it. It is asserted by the "Brand wordmark is not interface text" scenario.

### D8 — Logotype tokens and the contrast exemption

Four new primitives and three new semantic tokens, in `@theme` for the traditional theme and reassigned in `[data-theme="dark"]`:

| Token | Traditional | Dark |
|---|---|---|
| `--color-logo-leaf` | new primitive `#688f25` | `night-moss-300` (existing) |
| `--color-logo-cup` | new primitive `#0c3151` | `night-sage-100` (existing) |
| `--color-logo-coffee` | new primitive `#472e2e` | new primitive `#9b7e7d` |

Only `#688f25`, `#0c3151`, `#472e2e` and `#9b7e7d` are new primitives; the two dark values already exist. `theme-tokens.test.ts` already parses both `@theme` and `[data-theme="dark"]` blocks, so the new tokens are picked up by the theme-completeness check without touching its parser.

The traditional leaf measures 1.7:1 on `nav-surface` and would fail the 3:1 non-text rule. `theming` is therefore amended to exempt logotypes and brand marks, which WCAG 2.2 SC 1.4.11 already excludes ("part of a logo or brand name"). `theme-tokens.test.ts` registers the three logotype pairs as exempt alongside the existing decorative exemptions.

### D9 — Content-Security-Policy with a per-request nonce

Next 16 has one documented strict-CSP path (`01-app/02-guides/content-security-policy.md`): generate a nonce per request in `proxy.ts`, pass it upstream on the request as `x-nonce`, and set the same policy on the response. "Own scripts only" is not achievable with `script-src 'self'` alone, because the framework emits its own inline bootstrap scripts; without a nonce they are blocked and the page does not hydrate.

The policy is the documented one with `connect-src` added for the API origin, which the design summary settles:

```
default-src 'self';
script-src 'self' 'nonce-<nonce>' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:;
font-src 'self';
connect-src 'self' <NEXT_PUBLIC_API_URL origin>;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

`style-src` keeps `'unsafe-inline'` and no nonce. A nonce in `style-src` suppresses `'unsafe-inline'` for that directive, and the Radix overlays set inline styles for positioning, so a nonce there would break the sheet and the dropdown. Style injection is a materially lower risk than script injection, and `script-src` stays strict.

In development the documented `'unsafe-eval'` is appended to `script-src`, because React uses `eval` for debugging there. It is not required in production.

### D10 — Message catalogs

One catalog per area and locale at `messages/{locale}/{area}.json`, exactly as the design summary settles. This change creates `messages/es/shell.json`, `messages/en/shell.json` and `messages/ca/shell.json`; each later change adds its own `area` file and touches no other change's catalog. They sit beside `contracts/` and `docs/` as project content rather than source.

next-intl (v4, App Router) resolves the locale and loads catalogs; the request configuration lives in `src/shared/lib/i18n/` so every layer can read an area's catalog, and `src/shared/config/locales.ts` holds the supported locales and the default. Components never call the translation API: screens load the catalog and pass the texts down as props. That is the design summary's rule, and it is what makes a component's text surface visible in its type signature.

The "literal interface text detected" verification is ESLint's `react/jsx-no-literals` (from `eslint-plugin-react`, already installed as a dependency of `eslint-config-next`), enabled in `eslint.config.mjs` and run by `npm run lint`:

```js
{
  files: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}", "*.ts"],
  ignores: ["**/*.test.ts", "**/*.test.tsx"],
  rules: {
    "react/jsx-no-literals": ["error", {
      noStrings: true,
      ignoreProps: true,
      allowedStrings: ["*"],
    }],
  },
}
```

`noStrings: true` closes the loophole the rule leaves open by default: without it a bare JSX text is reported, but `{"text"}` and a template literal are not. The brand wordmark needs no allowance: it renders from the `WORDMARK` constant of `Logo.tsx` and is never JSX text, so a literal `TAZAVERA` written as JSX text is refused everywhere, inside `Logo` included. The one allowed string is `*`, the required-field marker of `Field.tsx`, which is a glyph rather than an interface text. `elementOverrides` is not used: configuring it re-enables the attribute check and crashes the installed plugin. The `files` entry reaches only the code that renders the interface, and test files are excluded because they pass interface texts as fixtures.

**Known limitation.** Text-bearing props are outside this verification. The rule has no per-prop granularity: `ignoreProps: true` turns attribute checking off entirely, while `noStrings: true` with `ignoreProps: false` reports *every* string attribute — `className`, `href`, `id`, `type`, `viewBox`, `d`, `fill`, `xmlns`, `width`, `height`, `role`, `aria-hidden` and the rest — which would flag the whole codebase, and `elementOverrides` cannot rescue it: its keys must match `/^[A-Z][\w.]*$/` and so cannot cover native elements, and configuring it crashes the installed plugin. An `aria-label`, `placeholder`, `title` or `alt` written as a literal is therefore not caught by lint; the requirement still forbids it and it stays the reviewer's responsibility. Accepted by the product owner in artifact review round 1.

Rejected alternative: keeping the hand-written source scan alongside the rule to cover props. It would be a second, weaker mechanism for the same concern, and the review settled on one.

### D11 — Breakpoints

The spec says "small" and "medium or larger" viewport. Both mean Tailwind's default `md` breakpoint, 768px: header navigation, the logotype form, and the sidebar column all switch there. Below `md` the sidebar is a full-screen overlay.

### D12 — Theme mechanism

This change builds the theme mechanism because section 1 of the design summary lists `Theme` among the shared contracts that `add-landing` and `add-user-account` rely on. The only theme selector is the one in the user menu; `add-user-account` has no theme setting of its own.

The preference is a **cookie**, not a browser-storage item. Only cookies reach the server, so `app/layout.tsx` reads it while rendering and puts `data-theme="dark"` on `<html>` in the server-rendered markup. The page therefore arrives in the right theme with no flash and with no inline script to set it, which also keeps that script out of the CSP nonce of D9. Since D9 already makes every page dynamic, reading a request cookie in the root layout costs nothing extra.

It lives in `src/shared/lib/theme.ts` rather than inside the theme selector because two call sites already need it in this change: the root layout reads the cookie on the server, and the selector writes it on the client. The module owns reading and writing the cookie and, on a choice, applies `data-theme` to the document root immediately so the change happens without a reload. `add-auth` reads the same cookie to send `theme` to the API.

An unreadable or unknown cookie value falls back to the traditional theme, which is also what a first visit gets, since `theming` makes traditional the default.

Rejected alternative: a browser-storage item. It is never sent to the server, so the root layout could not read it and the page would either flash the wrong theme on arrival or need an inline bootstrap script, which the CSP would then have to admit through the nonce.

### D13 — Files created or modified

Next.js route files are in the root `app/` folder and import their view from `src/`; `page.tsx` files import their screen from `src/pages/`. Tests live beside the file they test.

**Created**

| Path | FSD layer | Holds |
|---|---|---|
| `proxy.ts` | `app` | Locale prefixing, `/` → `/es`, `/callback` excluded, CSP |
| `proxy.test.ts` | `app` | CSP and locale routing of `proxy.ts` |
| `app/[locale]/layout.tsx` | `app` | Route file: renders the shell |
| `app/[locale]/page.tsx` | `app` | Route file: renders the home screen |
| `app/icon.svg` | `app` | The brand drawing as the browser icon |
| `src/app/shell/index.ts` | `app` | Public entry of the shell wiring |
| `src/app/shell/AppShell.tsx` | `app` | Layout wiring: header, sidebar region, main area |
| `src/app/shell/ShellChrome.tsx` | `app` | Client boundary of the shell chrome |
| `src/app/shell/AppShell.test.tsx` | `app` | Shell states and regions |
| `src/pages/home/index.ts` | `pages` | Public API of the home screen |
| `src/pages/home/ui/HomeScreen.tsx` | `pages` | Home screen; empty main area until `add-landing` |
| `src/pages/home/ui/HomeScreen.test.tsx` | `pages` | Home screen fills the main area with no content |
| `src/widgets/app-header/index.ts` | `widgets` | Public API of the header block |
| `src/widgets/app-header/ui/AppHeader.tsx` | `widgets` | Header in both session states |
| `src/widgets/app-header/ui/AppHeader.test.tsx` | `widgets` | Header states, data mapping, a11y names |
| `src/widgets/app-header/ui/PrimaryNav.tsx` | `widgets` | "Top rated" and "About us" entries |
| `src/widgets/app-header/ui/LanguageSelect.tsx` | `widgets` | Language selector |
| `src/widgets/app-header/ui/UserMenu.tsx` | `widgets` | Avatar control and its menu |
| `src/widgets/app-header/ui/ThemeSelect.tsx` | `widgets` | Theme selector in the user menu |
| `src/widgets/app-header/ui/ThemeSelect.test.tsx` | `widgets` | The offered themes and the accessible name |
| `src/widgets/app-sidebar/index.ts` | `widgets` | Public API of the sidebar region |
| `src/widgets/app-sidebar/ui/AppSidebar.tsx` | `widgets` | Management sidebar and the entries slot; the collapse control's `toggleLabel` is required |
| `src/widgets/app-sidebar/ui/AppSidebar.test.tsx` | `widgets` | Visibility rules and the empty state |
| `src/shared/ui/Logo.tsx` | `shared` | Brand logotype, three forms |
| `src/shared/ui/Logo.test.tsx` | `shared` | Forms, link target, wordmark |
| `src/shared/ui/DropdownMenu.tsx` | `shared` | Pulled from shadcn, rewired |
| `src/shared/ui/Sheet.tsx` | `shared` | Pulled from shadcn, rewired |
| `src/shared/ui/Sidebar.tsx` | `shared` | Pulled from shadcn, rewired |
| `src/shared/ui/DropdownMenu.test.tsx` | `shared` | Menu behaviour and token remap |
| `src/shared/ui/Sheet.test.tsx` | `shared` | Overlay behaviour and token remap |
| `src/shared/ui/Sidebar.test.tsx` | `shared` | Collapsible behaviour and token remap |
| `src/shared/ui/xss-guard.test.ts` | `shared` | No injected raw HTML anywhere under `src/` |
| `src/shared/lib/utils.ts` | `shared` | `cn`, the shadcn alias target |
| `src/shared/lib/hooks/index.ts` | `shared` | Hooks the pulled components need |
| `src/shared/lib/theme.ts` | `shared` | Read and write the theme cookie, apply `data-theme` on choice |
| `src/shared/lib/theme.test.ts` | `shared` | Theme states and the fallback |
| `src/shared/lib/i18n/index.ts` | `shared` | Public entry of the message loading |
| `src/shared/lib/i18n/request.ts` | `shared` | next-intl request configuration |
| `src/shared/lib/i18n/messages.ts` | `shared` | Read one area's catalog for a locale |
| `src/shared/lib/i18n/messages.test.ts` | `shared` | One area's catalog per locale, unsupported locale rejected |
| `src/shared/lib/i18n/catalog-guard.test.ts` | `shared` | The same key set in every locale of an area |
| `src/shared/config/locales.ts` | `shared` | Supported locales and the default |
| `src/shared/api/index.ts` | `shared` | The derived types of D4 |
| `messages/es/shell.json` | `app` | Spanish texts of the shell |
| `messages/en/shell.json` | `app` | English texts of the shell |
| `messages/ca/shell.json` | `app` | Catalan texts of the shell |

**Modified**

| Path | FSD layer | Change |
|---|---|---|
| `next.config.ts` | `app` | Registers the `next-intl` plugin |
| `app/layout.tsx` | `app` | `<html lang>` from the route, `data-theme` from the theme cookie read on the server, fonts kept |
| `src/app/styles/globals.css` | `app` | Four primitives and the three logotype tokens of D8 |
| `src/app/styles/theme-tokens.test.ts` | `app` | Logotype pairs registered as exempt |
| `src/shared/ui/index.ts` | `shared` | Export `Logo` and the three pulled components |

**Deleted**

| Path | FSD layer | Why |
|---|---|---|
| `app/page.tsx` | `app` | create-next-app boilerplate; `/` now redirects in `proxy.ts` |

`src/shared/api/schema.ts` is generated and is **not** modified. `contracts/openapi.yaml` is not touched.

## Risks / Trade-offs

- **The nonce makes every page dynamic.** The documented strict-CSP path requires a fresh nonce per request, which rules out static rendering for every route including the public landing page. → Accept it now: correctness of the security posture comes first, and the shell is per-user anyway. If landing-page performance becomes a problem, the options are a hash-based CSP or relaxing `script-src`, and either is its own change with its own spec delta. Raised for the product owner in `## Propose status`.
- **The signed-in shell has no live driver.** Neither `add-auth` nor a management route exists yet, so the user menu and the sidebar are reachable only from tests. → They are built against the `Session` contract and covered by component tests that drive all three states; the integration risk is confined to the single expression in `AppShell.tsx` that supplies the session.
- **Two changes touch `AppShell.tsx`.** `add-auth` will change the session it supplies. → Confined to one expression, and D3 keeps every other file single-owner.
- **`SessionUser` may be defined twice.** `rules.tasks` has this change define its derived types, and `add-auth` needs the same `SessionUser`. Both build in parallel and both write `src/shared/api/index.ts`. → `add-auth` should import `SessionUser` and `UserRole` from `src/shared/api` rather than redefining them. If both define them, that duplication is a `docs/backlog.md` candidate for the product owner. Raised in `## Propose status`.
- **Rewiring the Sidebar away from its Button and Input is the fiddliest step.** The generated Sidebar template leans on both. → Done in the same task that pulls it, with the duplicate deleted before the task is verified, so a stray shadcn Button never reaches `src/shared/ui/index.ts`.
- **`proxy.ts` imports from `src/`.** The proxy docs warn against relying on shared modules. → The imported module is pure constants with no runtime state, which is what the warning is about. If it ever grows logic, the list moves into `proxy.ts` and becomes the single source, with `src/shared/config/locales.ts` re-exporting it.
- **The literal-text verification covers rendered text only.** Text-bearing props are not linted (the known limitation in D10), so a literal `aria-label` or `placeholder` can pass `npm run lint`. → Accepted by the product owner in artifact review round 1. Those props stay forbidden by the requirement and are caught in review and in the accessibility assertions of the component tests, which check the accessible names supplied as props.
- **The browser icon follows the operating system, not the chosen theme.** A favicon cannot read the page's `data-theme`, so the tab icon can show dark colors while the app is in the traditional theme and the reverse, and Safari shows the traditional colors always. → Accepted in the design summary §4; the icon is brand artwork and the mismatch is confined to the browser tab.

## Migration Plan

No data, no API and no deployed behaviour to migrate. The change replaces the create-next-app boilerplate in one pass:

1. Tokens and the guard land first, so every later file is written against the rules that will verify it.
2. `proxy.ts` and the layouts land together; until then `/` renders the boilerplate, and from then on it redirects to `/es`.
3. Rollback is reverting the change: no route any other system links to exists before it, so nothing external breaks.

## Open Questions

None. The one question that shaped the task breakdown — who owns the `/[locale]` root route — was answered by the product owner: this change owns it and renders an empty main area, which `add-landing` fills later.
