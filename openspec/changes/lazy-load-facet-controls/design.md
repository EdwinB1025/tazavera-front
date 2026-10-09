# Design

## Context

Product owner's decision of 2026-10-09 (decisions log, "carga diferida de las facetas"): the facet comboboxes, and the libraries only they use (cmdk and the Radix parts behind them), load with a dynamic import the first time the filters panel opens, as the map loads Leaflet (`src/shared/ui/LocationsMapLoader.tsx`, add-coffeeshop-directory design.md D14). The technical review of 2026-10-09 (§1.4, top risk 3) measured 207–249 KB gz of JavaScript per route; the cmdk chunks load on the offerings list and on the coffee shop detail, whose sidebar holds the offering facets.

Only the offering facets render comboboxes (`src/features/offering-facets/ui/OfferingFacets.tsx`: Coffee, Producer, Roastery). The evaluation and coffee shop facet panels render none. The new-offering form's combobox (`InventoryField`) is not a facet and keeps its static import. The facets always render inside the sidebar sub-section (`SidebarMenuSub`, app-shell "Sidebar entry sub-section"), which is closed on arrival, keeps its content mounted while closed and is reset when the route changes. On viewports below `md` the same sidebar is the full-screen overlay, so the mobile and desktop panels share one mechanism.

Next.js guide read: `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` (`next/dynamic` in a Client Component; a component that is not rendered is not loaded; `ssr: false` only in Client Components; named exports through `.then`).

## Decisions

### D1. Import boundary: a shared combobox loader

A new Client Component `ComboboxLoader` in `src/shared/ui/ComboboxLoader.tsx`, exported from the `src/shared/ui` entry point, takes the combobox's props, with `texts` extended by `loading`. It holds the only dynamic import of the combobox: `next/dynamic` of `./Combobox` (named export through `.then`), with `ssr: false` and a `loading` placeholder, as `LocationsMapLoader` does. Everything `Combobox.tsx` imports (cmdk, the Radix Popover, the search hook) therefore leaves the route's first load. `Combobox` stays exported for `InventoryField`. `OfferingFacets` renders `ComboboxLoader` instead of `Combobox` in its three combobox places, with the same props; nothing else in the panel changes.

The placeholder is the existing `LoadingStatus` (feedback "Request status messages") with the `loading` text. `next/dynamic`'s `loading` receives no props, so the text reaches it through a context, the pattern of `LocationsMapLoader`. The placeholder sits in the facet's existing `px-3` slot; the panel's gap between facets is unchanged.

### D2. When the load starts: the sub-section's first opening

`SidebarMenuSub` tells its content whether it has been opened since it mounted, through a new context exported beside `SubsectionToggleContext` (`SubsectionOpenedContext`). It becomes true the first time `subsectionOpen` is true (by the toggle or by the toolbar's "Filters" trigger) and stays true while the sub-section is mounted; leaving the route unmounts the sub-section and starts it again at false. The context's default, outside any sub-section, is `true`, so a combobox loader outside a sub-section loads at once.

`ComboboxLoader` renders the placeholder while the context is false, and the dynamic component once it is true; the dynamic import starts only when that component first renders. The sub-section is closed on arrival, so the server render and the first client render hold only the placeholder and the route preloads no combobox chunk. After the first load the module stays in the browser's module cache, so later openings on other routes render the comboboxes without a visible loading state.

### D3. The loading text

No `filters` key holds a loading text. The existing `loading` key of the `account` catalog ("Loading…", es "Cargando…", ca "Carregant…") is the text. `OfferingFilterTexts` gains a `loading` key (`offeringFacetsTexts` reads it from the catalog it receives, empty when missing), and the two screens that render the offering facets (`OfferingsSidebarScreen`, `CoffeeshopDetailSidebarScreen`) pass the `filters` catalog together with the `account` catalog's `loading`. No catalog file changes.

## Measurement plan

Two methods, before (on `origin/develop`) and after (on the last commit of the change), each from a fresh `npm run build` with `NEXT_PUBLIC_API_URL=http://localhost:8000`:

1. **The review's method** (technical review 2026-10-09 §1.4): `next start` against a local mock of the read endpoints that answers with the examples of `contracts/openapi.yaml`; Chromium (Playwright, pre-installed), a fresh browser context per route, traditional theme, 1280 px wide; the scripts loaded until network idle are summed, raw and gzipped with Node `zlib` at level 6. Routes: `/en/offerings`, `/en/evaluations`, `/en/coffeeshops`, `/en/coffeeshops/{ulid}` (Offerings tab, its default). For the two offering-facet routes, the same sum is also taken after opening the "Filters" sub-section, to show what the first opening loads.
2. **The build-manifest method** (reduce-shared-client-bundle design.md): per route, the union of `build-manifest.json` `rootMainFiles` and the `entryJSFiles` of its page's and its `@sidebar` slot page's client reference manifests, each gzipped. It also tells which routes still list a cmdk chunk.

Target: every list route at or under 170 KB gz with method 1. The review measured a floor of 206.8 KB gz on About, which renders no facet, so the target is expected to stay out of reach of this change; the numbers are reported either way.

## Risks

- A route that renders the offering facets outside a sidebar sub-section would load the comboboxes at once (the context's default). None does today.
- The first opening on a slow network shows the loading status for the time of one chunk request.
