## Context

Sources: `docs/design/add-filter-controls/design-summary.md` (§5.4, §6.1, §6.3, §9.1, Open 4b, Open 5, findings F1, F2, F5), `docs/design/add-offering-management/design-summary.md` (Open 1 and its sub-point, findings F2 and F5), the decisions log in `docs/general-context.md` on `origin/develop` ("add-filter-controls: resto de puntos", "entradas del sidebar de gestión", "catálogo: detalle y consenso; filtros: cascada y división", "add-offering-management: puntos del explore", "filtros: preguntas de los explore en la nube"), `add-specialist-evaluations` design D5 and tasks 9.3–9.4 on `origin/feature/add-specialist-evaluations`, and the `add-offering-facets` propose on `origin/claude/add-offering-facets-propose` (its D2 interface list). Motivation: see proposal.md.

Current state (read in code):
- `app/[locale]/layout.tsx` renders `AppShell` with `children` only; there is no slot and no `default.tsx`.
- `AppShell` (Server Component) resolves the `shell` catalog and renders `SessionShell` (`"use client"`), which resolves the session (`session ?? useSession()`), renders `ShellChrome` (the header) and a `<main>`; it takes a `sidebar?` region or, for an authenticated session, mounts `AppSidebar`. `<main>` gets `md:flex` and an `<aside class="hidden md:block shrink-0">` column only when a region exists.
- `AppSidebar` (`src/widgets/app-sidebar`) shows itself only for an authenticated session on `/[locale]/manage/*`, and owns its own `SidebarProvider`.
- `Sidebar.tsx` (`src/shared/ui`): one `open` state starting `true`; below `md` the `Sheet` takes `open`, so it covers the screen on arrival (F1); from `md` `Sidebar` returns `null` when collapsed, and the only `SidebarTrigger` is inside it (F2). `SidebarMenuButton` is a `<button>` with `hover:bg-nav-hover` and no hover text colour (management F2: `nav-text-dark` on `nav-hover` is 2.49 in the traditional theme). `useSidebar` is not exported from `@/shared/ui`.
- The header's "Sign in" button is already a `nav-button` on the header surface; its pairs (`nav-button-*` against `nav-header`, `focus-ring`/`nav-header`) are registered in `src/app/styles/theme-tokens.test.ts`. `nav-text-hover`/`nav-hover` and `focus-ring-inverse`/`nav-surface-dark` are registered in both themes.

Next.js docs read for this change: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md` (slots are layout props; soft navigation keeps an unmatched slot's previous state; hard navigation renders `default.js` for unmatched slots; `children` is an implicit slot that needs its own `default.js`), `dynamic-routes.md` (a required catch-all needs at least one segment while an optional catch-all also matches the route without the parameter), `default.md` (a `default.js` may call `notFound()`; `params` is a promise), `layout.md` ("Layout Props Helper": `LayoutProps<'/[locale]'>` types named slots after `next typegen`/`build`).

## Goals / Non-Goals

**Goals:**
- One mechanism (the `@sidebar` slot) through which a route supplies its sidebar content, compatible with the role-based entries seam of `add-specialist-evaluations` D5.
- Sidebar presence known to the shell, so the shell owns the re-open control.
- F1, F2 (filter-controls) and F2 (management) fixed; the entry link form.

**Non-Goals:**
- Facets, the body "Filters" trigger, the offerings list screen, any management entry content (see proposal Non-goals).
- The current-entry look of the brief §6 (filter-controls F3, second half).

## API

No contract operation is consumed or changed. No API error is presented by this change.

## Types

No type is derived from `src/shared/api/schema.ts` (none needed). UI-specific types, declared before their components:
- `SidebarContextValue` (`src/shared/ui/Sidebar.tsx`) gains `present: boolean` and `register: () => () => void` (D3).
- `AppSidebarContextValue` (`src/widgets/app-sidebar`): `{ session: Session; entries?: ReactNode; toggleLabel: string }` (D4); `Session` comes from `@/shared/api`.
- `AppHeaderProps` (`src/widgets/app-header`) gains `leading?: ReactNode` (D6).

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `app/[locale]/layout.tsx` | app (routing) | Modified | Receives the `sidebar` slot (`LayoutProps<"/[locale]">`) and passes it to `AppShell` |
| `app/[locale]/default.tsx` | app (routing) | New | Calls `notFound()` (D2) |
| `app/[locale]/@sidebar/default.tsx` | app (routing) | New | Renders `DefaultSidebarScreen`; no logic |
| `app/[locale]/@sidebar/page.tsx` | app (routing) | New | Renders `DefaultSidebarScreen` on the locale root; no logic |
| `app/[locale]/@sidebar/[...rest]/page.tsx` | app (routing) | New | Renders `DefaultSidebarScreen` on every deeper path; no logic |
| `app/[locale]/@sidebar/offerings/page.tsx` | app (routing) | New | Renders `OfferingsSidebarScreen`; no logic |
| `src/pages/default-sidebar/index.ts`, `ui/DefaultSidebarScreen.tsx` (+ test) | pages | New | Renders `DefaultSidebar` |
| `src/pages/offerings-sidebar/index.ts`, `ui/OfferingsSidebarScreen.tsx` (+ test) | pages | New | Renders `AppSidebar` with no children (filled by `add-offering-facets`, D9) |
| `src/widgets/app-sidebar/ui/AppSidebar.tsx` (+ test) | widgets | Modified | The sidebar frame (D4) |
| `src/widgets/app-sidebar/ui/AppSidebarContext.tsx` | widgets | New | `AppSidebarProvider` and its hook (D4) |
| `src/widgets/app-sidebar/ui/DefaultSidebar.tsx` (+ test) | widgets | New | The management rule (D4) |
| `src/widgets/app-sidebar/ui/SidebarReopenControl.tsx` (+ test) | widgets | New | The re-open control (D6) |
| `src/widgets/app-sidebar/index.ts` | widgets | Modified | Exports the above |
| `src/widgets/app-header/ui/AppHeader.tsx` (+ test) | widgets | Modified | `leading` slot first in the left group (D6) |
| `src/app/shell/SessionShell.tsx`, `ShellChrome.tsx`, `AppShell.tsx` (+ `AppShell.test.tsx`) | app | Modified | Providers move up, region, leading control, layout (D5) |
| `src/shared/ui/Sidebar.tsx` (+ `Sidebar.test.tsx`), `src/shared/ui/index.ts` | shared | Modified | D3, D7, D8 |

## Decisions

**D1 — The `@sidebar` slot is the one way a route supplies its sidebar.** (Open 4b (a), Product owner.) `app/[locale]/@sidebar/` is a named slot of the `[locale]` layout, passed to `AppShell` as `sidebar` and rendered by `SessionShell` in the sidebar column. A route that has a sidebar adds `app/[locale]/@sidebar/<route>/page.tsx`, whose screen renders the `AppSidebar` frame (D4) with the route's content as children and, for a management area, its entries as `entries` (convention required by "entradas del sidebar de gestión"). Fetches stay per route; the shell stays generic.

**D2 — Defaults keep soft navigation honest and unknown paths not found.** Per parallel-routes.md, a soft navigation keeps an unmatched slot's previous content. So the slot renders `DefaultSidebarScreen` on every path of the locale, the locale root included, on a full load and on a soft navigation: `@sidebar/page.tsx` matches the locale root and the required catch-all `@sidebar/[...rest]/page.tsx` matches every deeper path no specific slot page matches, and each only renders `DefaultSidebarScreen`; navigating from `/offerings` to `/about` then replaces the offerings sidebar instead of keeping it. `@sidebar/default.tsx` renders the same screen for the hard-navigation fallback, and `@sidebar/offerings/page.tsx` is unchanged. The single optional catch-all `@sidebar/[[...rest]]/page.tsx` of the first draft cannot be kept: it also matches the route without the parameter (dynamic-routes.md), so the build rejects it next to `app/[locale]/page.tsx` ("You cannot define a route with the same specificity as an optional catch-all route"); the root page plus the required catch-all cover exactly the same paths, and nothing the user sees changes. (Revised by the orchestrator under its authority to close this blocking point; Product owner may reopen it.) Because the two files match any path, an unknown path such as `/es/nope` now matches the slot but not `children`; `app/[locale]/default.tsx` calls `notFound()` so the implicit `children` slot keeps reporting not found (default.md), as today. Alternatives: a `@sidebar/page.tsx` per route plus `default.tsx` only (rejected: soft navigation keeps stale content); the shell matching routes itself (Open 4b (b), rejected by Product owner).

**D3 — Sidebar state and presence live in one provider at shell level** (Q1, decided by the orchestrator under Product owner's delegation, decisions log "filtros: preguntas de los explore en la nube"). `SidebarProvider` moves from `AppSidebar` to `SessionShell`, wrapping the header and the main area, so the header, the sidebar and any page-body component (`add-offering-facets` D8 uses `useSidebar()`) share it. Inside `Sidebar.tsx`:
- Two states, as shadcn's sidebar keeps them: `openDesktop` (initial `true`) and `openMobile` (initial `false`). `useSidebar()` returns `open` and `setOpen` for the active viewport (`isMobile` ? mobile : desktop), and `toggleSidebar` toggles the active one. This fixes F1 without reading the viewport during the first render (`useIsMobile` reports `false` on the server and during hydration, so a single state could not start closed on mobile only).
- Presence: `register()` increments a mounted-sidebar count and returns the function that decrements it; `present` is `count > 0`. `Sidebar` calls it in an effect on mount, whether it then renders the column, `null` (collapsed) or the `Sheet`. "The route's sidebar reports its presence through the context" is thus automatic for every sidebar built from `Sidebar`.
- `SIDEBAR_ID` (exported constant) is the `id` of the desktop column and of the sheet content (only one renders at a time), for `aria-controls` of the re-open control and of `add-offering-facets`' trigger.
- `useSidebar` and `SIDEBAR_ID` are exported from `@/shared/ui`.

**D4 — The frame, the default and the entries seam** (widgets/app-sidebar). `AppSidebarProvider` (rendered by `SessionShell`) carries `{ session, entries, toggleLabel }`: the resolved session, the role-based entries of D5 in `add-specialist-evaluations` (`undefined` until that change wires them) and the catalog's `toggleSidebar`.
- `AppSidebar({ entries?, children? })` is the frame, always rendered when mounted: `Sidebar label={toggleLabel}` > `SidebarHeader` (`SidebarTrigger aria-label={toggleLabel}`) > `SidebarContent` holding a `<nav>` and then `children`. The `<nav>` is rendered only when there are entries or the route is a management route with an authenticated session; it holds the context entries (only on a management route with an authenticated session) followed by the `entries` prop. On a management route with no entries the `<nav>` is empty (spec "No entries contributed", as today). On the offerings route there is no `<nav>`.
- `DefaultSidebar()` renders `<AppSidebar />` only for an authenticated session on `/[locale]/manage/*` (the existing `MANAGE_ROUTE` rule moves here from `AppSidebar`), else `null`.
- `AppSidebar` no longer takes `session` or `toggleLabel` props, and no longer owns a `SidebarProvider`.

**D5 — `SessionShell` composition.** `SessionShell` resolves the session as today and renders `SidebarProvider` > `AppSidebarProvider` > the chrome and the main area. The region is `sidebar ?? <DefaultSidebar />` (an `AppShell` rendered without the slot, as in the shell tests, keeps today's management behaviour). `<main>` is always `bg-surface-page flex-1 md:flex`; the region sits in a plain `<div class="shrink-0">` column before the content `<div class="min-w-0 flex-1">`. With no sidebar mounted the column is empty and zero-wide, so the main area is one column; with a sidebar the column takes the `Sidebar` root's 16rem. Always rendering `md:flex` avoids a layout jump after hydration (presence is only known after the effect), and the empty column is a `div`, so no empty landmark is exposed. The landmark moves into the frame: the desktop `Sidebar` root becomes an `<aside aria-label={label}>` (D8).

**D6 — The re-open control sits in the header** (Q1: `PanelLeft`, `nav-button`, accessible name). `SidebarReopenControl` (widgets/app-sidebar) renders `SidebarTrigger` (already `nav-button`, `size="sm"`, `PanelLeft`, `aria-expanded={open}`) with `aria-label={toggleLabel}` and `aria-controls={SIDEBAR_ID}`, only when `present` and either `isMobile` or `!open`. `SessionShell` passes it to `ShellChrome`, which passes it to `AppHeader` as `leading`, rendered first in the header's left group (before the logotype). Placement decided by the orchestrator under Product owner's delegation: the header surface is where `nav-button` is already used and registered (the "Sign in" button: `nav-button-*`/`nav-header` and `focus-ring`/`nav-header`), whereas `nav-button` on `surface-page` was measured and rejected in the filter-controls summary §8 (hover fill 2.85 / 2.40); a rail on `nav-surface-dark` would break "collapsing returns the main area to a single column". Below `md` the control is shown on every sidebar route (the sheet covers it while open, and keeping it mounted lets the dialog return focus to it on close). The name reuses `shell.toggleSidebar` (no new key: the control is the same toggle in its collapsed state). Focus: collapsing from the sidebar's control moves focus to the re-open control, and re-opening moves it to the sidebar's collapse control (both elements unmount on the switch, so focus is set explicitly; mechanism left to the build, end state in the spec). Alternative rejected: showing the shell control also while expanded from `md` (two toggles for one state).

**D7 — Entry presentation and link form** (management Open 1 and its F2 sub-point; fixes management F5). `SidebarMenuButton` adds `hover:text-nav-text-hover` to its hover (the label switches with the fill; `nav-text-hover`/`nav-hover` is 4.63 / 4.68, registered) and gains `asChild`: with `asChild` it renders `Slot.Root` from `radix-ui` (`radix-ui` exports `Slot`, already installed), merging its classes and `data-active` onto the child link, and an `icon` is rendered inside the child before its label through `Slot.Slottable`. Without `asChild` it stays a `<button>`. The current-page mark (`aria-current="page"`) is set by the contributing area on its link, as `add-offering-management` §6.4 and `add-specialist-evaluations` D5 state. The current-entry fill is unchanged.

**D8 — The sidebar is under the inverse scope.** The desktop `Sidebar` root (`<aside>`) and the sheet's inner container carry `variant-inverse`, so `focus-visible:focus-ring` resolves to `focus-ring-inverse` on `focus-offset-inverse` inside the sidebar (6.41 traditional / 12.27 dark against `nav-surface-dark`, filter-controls §8; `focus-ring-inverse`/`nav-surface-dark` is registered in both themes). Form controls placed in the sidebar later inherit the same scope. No new guard pair is needed.

**D9 — The offerings route has its own slot page now.** `app/[locale]/@sidebar/offerings/page.tsx` renders `OfferingsSidebarScreen` (`src/pages/offerings-sidebar`), which renders `<AppSidebar />` with no children, so the sidebar appears on `/{locale}/offerings` for every session state (summary §9.1) with no entries. The children route `/{locale}/offerings` belongs to `add-offering-catalog`; until it lands that URL is a not-found page (D2), so the end state is observable in the browser only after the catalog. `add-offering-facets` fills `OfferingsSidebarScreen` (its D6 plans the screen in `src/pages/offerings`; it may move it there and repoint the route file — either keeps D1). Decided by the orchestrator under Product owner's delegation (Q2 and remaining points: the architect's recommendation).

**D10 — Coexistence with `add-specialist-evaluations` D5, and who adds `asChild` first.** Both paths stay valid: the role-based entries arrive through `AppSidebarProvider`'s `entries` (D4) and render in every sidebar frame on a management route; a management area's entries arrive through its slot page's `entries` prop. Whichever change applies first adds `SidebarMenuButton`'s `asChild` form:
- If `add-sidebar-slot` applies first (expected: the decisions log orders sidebar-slot "ya" and evaluations after scales and card-session), task 3.2 here adds it, and `add-specialist-evaluations` task 9.3/9.4's `asChild` part becomes a check that the existing form passes its test; its `entries` wiring in `SessionShell` targets `AppSidebarProvider`'s `entries` prop instead of `AppSidebar`'s.
- If `add-specialist-evaluations` applies first, task 3.2 here only adds what its form lacks (`Slottable` icon, hover text) and keeps its test; task 5.2 moves its `SessionShell` entries wiring to `AppSidebarProvider`'s `entries` and keeps its `AppShell.test.tsx` cases passing.

## Risks / Trade-offs

- **Slot pages mixing static and dynamic rendering** → parallel-routes.md: slots at one level cannot mix prerendered and dynamic rendering. The default screens are static; when `add-offering-facets` makes the offerings slot page read `searchParams`, that route becomes dynamic, which the catalog route already is. Verified at build in task 6.3.
- **`@sidebar/page.tsx` and `@sidebar/[...rest]/page.tsx` make every path match the slot** → `app/[locale]/default.tsx` with `notFound()` keeps unknown paths not found; task 6.3 checks `/es/nope` answers 404 and `/es` and `/es/about` answer 200 with no sidebar.
- **Presence is known only after hydration** → the re-open control appears after the first effect; the column itself renders on the server (desktop state starts open), so there is no layout jump. Below `md` the column is `hidden` and the sheet starts closed.
- **Both an entries seam and a slot for management entries** (until one is retired) → kept explicit in D4/D10; a later change can retire the seam without touching the frame.
- **`/{locale}/offerings` not browsable until `add-offering-catalog`** → the offerings sidebar is covered by `OfferingsSidebarScreen`'s test; the browser check is in the catalog's apply.

## Migration Plan

None: front-end only, no persisted state. Rollback is reverting the change's commits.

## Decisions taken under delegation

Recorded as "decided by the orchestrator under Product owner's delegation" (decisions log "filtros: preguntas de los explore en la nube" and "add-offering-management: puntos del explore"): D3 (provider at shell level, presence through the context), D6 (control in the header, shown only on sidebar routes, `nav-button`, `PanelLeft`, reused name), D7 hover label `nav-text-hover`, D8 the sidebar under `variant-inverse`, D9 (offerings slot page now), D10 (order of `asChild`).
