# Design — add-not-found-page

## Context

See proposal.md (Why). The design source of truth is `docs/design/add-not-found-page/design-summary.md` (approved, no open points; constraint "nada nuevo en el diseño", decisions log 2026-10-07). This design restates its decisions for the build; it does not re-decide them.

Current state:

- `app/[locale]/default.tsx` calls `notFound()` for any path no route defines; `SessionGate` (`allows`), `EvaluationsAccess`, `EvaluationDetail` and `NewEvaluationScreen` call `notFound()` for a role not allowed or an unknown resource. No `not-found` file exists, so Next.js's default 404 page renders.
- `proxy.ts` forwards the route's locale as the `x-locale` request header; `app/layout.tsx` reads it with `headers()` and falls back to `DEFAULT_LOCALE`.
- `src/app/shell/AppShell.tsx` resolves an unsupported locale with `isSupportedLocale` to `DEFAULT_LOCALE` and reads the `shell` catalog with `getMessages`.
- `RegisterScreen` (`src/pages/register/ui/RegisterScreen.tsx`) holds the page wrapper, section and centred column this page reuses.

Next.js guides (local docs, Next.js 16.3.6):

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` — `not-found.js` renders when `notFound()` is thrown in its segment, inside the segment's layout; it receives no props; 404 status for non-streamed responses; `global-not-found.js` is experimental and needs its own `<html>`/`<body>`.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md` — the exception travels up to the nearest `not-found` boundary, falling back to the default 404 page.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/headers.md` — `headers()` is async in a Server Component.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md` ("Soft Navigation") — on client-side navigation a slot that matches no subpage keeps its active subpage; `default.js` renders only on hard navigation.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` ("Catch-all Segments") — `[...folderName]` matches every deeper path; more specific routes take precedence.

## Goals / Non-Goals

**Goals:** the not-found page of design summary §1, §5–§8, inside the shell, in the active locale and theme, for every way a route under a supported locale reaches "not found" today.

**Non-Goals:** see proposal.md (Out of scope). Also: no metadata change, no change to any `notFound()` call site, no new token or contrast pair.

## API

No endpoint is consumed. No generated type is used or added; no API error is presented (the page fetches nothing).

## Files (FSD layer)

| Path | Layer | Change |
|---|---|---|
| `app/[locale]/not-found.tsx` | routing (`app/`) | created |
| `app/[locale]/[...rest]/page.tsx` | routing (`app/`) | created (D7) |
| `app/[locale]/[...rest]/page.test.tsx` | routing (`app/`) | created (D7) |
| `src/pages/not-found/ui/NotFoundScreen.tsx` | pages | created |
| `src/pages/not-found/ui/NotFoundScreen.test.tsx` | pages | created |
| `src/pages/not-found/index.ts` | pages (public API) | created |
| `messages/es/shell.json`, `messages/en/shell.json`, `messages/ca/shell.json` | catalog | three keys added at the end |

No new component in `shared`, `entities`, `features` or `widgets`. The screen imports only from `@/shared` (`@/shared/ui`, `@/shared/lib/i18n`, `@/shared/config/locales`).

## Decisions

### D1 — UI type (before any component)

`src/pages/not-found/ui/NotFoundScreen.tsx` declares, before the component:

```ts
export type NotFoundScreenProps = {
  locale: string;
};
```

`src/pages/not-found/index.ts` exports `NotFoundScreen` (and its props type).

### D2 — Route file and locale

`app/[locale]/not-found.tsx` is an `async` default export that reads `x-locale` from `await headers()`, falls back to `DEFAULT_LOCALE`, and renders `<NotFoundScreen locale={locale} />` imported from `@/pages/not-found`. It holds no other logic and exports no `metadata` (design summary §3.2–§3.3). `not-found.js` receives no props, so it cannot read `params`; the header is the same one the root layout reads.

`NotFoundScreen` is a synchronous Server Component (no `"use client"`): it resolves an unsupported `locale` to `DEFAULT_LOCALE` with `isSupportedLocale`, exactly as `AppShell` does, reads the `shell` catalog with `getMessages`, and renders no literal text.

Alternatives rejected: `global-not-found.js` (experimental flag, own document) and a root `app/not-found.tsx` (no user-facing path reaches the root) — design summary §2.

### D3 — Texts (catalog area `shell`)

Added at the end of `messages/{es,en,ca}/shell.json`:

| Key | es | en | ca |
|---|---|---|---|
| `notFoundTitle` | Página no encontrada | Page not found | Pàgina no trobada |
| `notFoundText` | La página que buscas no existe o no tienes acceso a ella. | The page you are looking for does not exist or you do not have access to it. | La pàgina que cerques no existeix o no hi tens accés. |
| `notFoundHomeLink` | Volver al inicio | Back to the home page | Tornar a l'inici |

The existing catalog guard ("An area is complete in every locale") covers the three keys.

### D4 — Composition and classes

From the outside in (design summary §5; every value comes from an existing component):

- wrapper `div` with `flex-1`;
- `PageSection surface="page"` with `containerClassName="flex flex-col"`;
- column `div` with `mx-auto w-full max-w-lg`;
- `Card variant="section"`:
  - `CardAside` holding `h1.type-subheading` with `notFoundTitle`;
  - `CardContent` holding a column `flex flex-col items-start gap-4` with `p.type-body` (`notFoundText`) and `Link variant="back"` to `/{locale}` with `notFoundHomeLink` as its text.

The screen adds only the classes listed above; padding, borders, radius, shadow, surfaces, the `ArrowLeft` icon, hover and the focus ring come from `PageSection`, `Card`, `CardAside`, `CardContent` and `Link` as they are. The card sits at the top of the content area, not centred vertically.

### D5 — Tokens, states and accessibility

- Tokens: `surface-page`, `surface-card`, `surface-section`, `border-subtle`, `text-primary`, `text-link`, `text-link-hover` and the focus ring, all through the shared components. Every text pair is already registered in `src/app/styles/theme-tokens.test.ts`; no pair is added.
- One page state. The link has rest, hover, keyboard focus and active, from `Link`.
- The `h1` is the document's only level-one heading (the shell header has none). The link's accessible name is its visible text; the icon is decorative. No programmatic focus.

### D6 — Tests

`src/pages/not-found/ui/NotFoundScreen.test.tsx`, one test per scenario, rendering `NotFoundScreen` with `locale="es"` and the Spanish texts of D3:

1. Scenario "Not-found page content": a `heading` of level 1 named "Página no encontrada", and the text "La página que buscas no existe o no tienes acceso a ella." is shown.
2. Scenario "Back to the home page": the `link` named "Volver al inicio" has `href` `/es`.

3. Route test of D7 (`app/[locale]/[...rest]/page.test.tsx`, the pattern of `app/[locale]/default.test.tsx`): the default export of `app/[locale]/[...rest]/page.tsx` calls Next's `notFound()` (spy on `next/navigation`).

Not tested with Vitest: the async route file, the HTTP status and the boundary wiring (framework behaviour); they go to the visual verification task. `app/[locale]/default.test.tsx` stays as it is. No guard test is added (decisions log 2026-10-08).

### D7 — Unknown path on soft navigation (orchestrator decision, 2026-10-08)

The visual verification (handoff 2026-10-07) found that in-app navigation from `/en` to `/en/no-such-page` changes the URL but keeps the home page. The cause is a framework constraint: the path matches `app/[locale]/@sidebar/[...rest]`, so the route exists, and on soft navigation the `children` slot, which matches nothing, keeps its previous page; `app/[locale]/default.tsx` applies only on hard navigation (parallel-routes doc, "Soft Navigation", path above).

Decision: add `app/[locale]/[...rest]/page.tsx`, a synchronous default export that calls `notFound()` from `next/navigation` and holds no other logic. The `children` slot then also matches every unknown path under a locale, and its `notFound()` renders the `app/[locale]/not-found.tsx` boundary of D2 on soft and hard navigation alike. A catch-all has the lowest priority (dynamic-routes doc, "Catch-all Segments"), so every defined route (home, offerings, manage/*, account, register, about) still resolves to its own page. `app/[locale]/default.tsx` stays: it still covers slots without a match on hard navigation. No spec behaviour changes: the scenario "Unknown route stays not found" now holds on both kinds of navigation.

## Risks / Trade-offs

- `notFound()` thrown from the Client Components (`SessionGate`, `EvaluationsAccess`, `EvaluationDetail`) is expected to render this boundary (functions doc); not yet seen in this project's browser. Covered by the visual verification task.
- `x-locale` on client-side navigation to an unknown path is expected (proxy matcher covers non-`_next` paths); checked in the visual verification task by navigating in-app. The first run failed for the reason of D7, not the header; re-checked after D7.
- On role-gated management routes the `@sidebar` slot may still render that route's entries beside the page. Existing behaviour; if seen, it is reported for a new change or the backlog, not fixed here.
- `messages/*/shell.json` closing lines conflict with any in-flight branch that edits them; the orchestrator simulates the merge before the apply.
