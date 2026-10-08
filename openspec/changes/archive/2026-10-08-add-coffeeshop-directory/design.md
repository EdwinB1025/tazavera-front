# Design — add-coffeeshop-directory

## Context

See proposal.md, "Why". What shapes the approach:

- Source of truth: `docs/design/add-coffeeshop-directory/design-summary.md` (`Status: approved`; §0 settled inputs, closed Opens 2, 4, 5, 7; non-blocking Opens take their recommendation) and the decisions log of `docs/general-context.md` (2026-10-06 "directorio de cafeterías", "directorio por negocio, pestañas y barra lateral de la cafetería"; 2026-10-07 "catálogo en una columna", "superficies de página", "superficies de página: respuestas a Open 1–3 y refactors previos"). This document does not re-decide them; it settles the single-component details they leave free.
- Contract (`contracts/openapi.yaml` on `develop`): `listCoffeeShops` (`GET /coffeeshops`, line 429), `getACoffeeShop` (`GET /coffeeshops/{user_ulid}`, line 837), `listOfferings`' `coffeeshopUlid` (line 6799). Product owner decided on 2026-10-07 that the API accepts `page` and `perPage` even though `perPage` is not in the contract; this change sends `page` only (the API's default page size; no design decision asks for another).
- Merged on `develop` (`d264dd2`) and merged into this branch before the apply: `add-offering-catalog`, `add-offering-facets`, `add-user-contact`, and the refactors of backlog **R9** (`ClearFiltersButton` in `@/shared/ui`) and **R12** (`extract-filtered-offerings`: `FilteredOfferingsToolbar`, `FilteredOfferingsResults`, `FilteredOfferingsFacets` in `@/widgets/offering-list`). Their pieces are reused by name: `Tabs`, `RetryButton`, `LabelValueRow`, the detail skeleton (catalog); `FacetPanel` composition, `filter-query` (`buildFilterHref`, `clearFiltersHref`, `useFilterNavigation`), `FiltersTrigger`, the `resultCount` announcement (facets); `ContactDetails` (contact); the three filtered-offerings compositions (R12) and `ClearFiltersButton` (R9). D3 states each interface as merged.
- Not merged: `add-coffeeshop-location` (`origin/feature/add-coffeeshop-location`, in verify). Its `LocationCard` is taken as that branch defines it (D11).
- Backlog (`docs/backlog.md`): R9 and R12 are resolved by their own changes (decisions log 2026-10-07, "R9 resuelto y piezas compartidas"); this change adopts them and folds no backlog entry.
- Orchestrator decision 2026-10-07, "paginación con `?tab=` en el directorio": `FilteredOfferingsResults` gains one optional prop that adds keys to the pagination links' query only (D17).
- Merged on `develop` and reused: `PageSection`, `Pagination`, `Card`, `Badge`, `Link`, `Button`, `Sheet`, `ToggleGroup` (segment-internal today), `FacetPanel`, `FacetTextField`, `FacetRadioList`, `Select`, `Field`, `AppSidebar`, the `@sidebar` slot (`app/[locale]/@sidebar/`, a slot screen rendering `AppSidebar` shows the sidebar; rendering nothing shows none), `useIsMobile` (`src/shared/lib/hooks`), `publicRequest` (`src/shared/api`).
- Next.js APIs involved (local docs read): `next/dynamic` with `ssr: false` only inside a Client Component (`01-app/02-guides/lazy-loading.md`, "Skipping SSR": "`ssr: false` is not allowed with `next/dynamic` in Server Components"); external package stylesheets "can be imported anywhere in the `app` directory, including colocated components" (`01-app/01-getting-started/11-css.md`, "External stylesheets") — this closes the summary's **unverified** note on importing Leaflet's stylesheet; `useRouter().push(href, { scroll: false })` (`04-functions/use-router.md`, as facets D4); `generateMetadata` (catalog D17 pattern).

## Goals / Non-Goals

**Goals:** one thin async fetch component and one sync presentation per screen (every branch unit-testable); no new token; the map is one business-agnostic shared component used by both pages; every map datum also reachable as text.

**Non-Goals:** no client-side data fetching (the map receives its points as props); no Leaflet popup, zoom or attribution control (project components replace them, so no third-party styling is overridden); no change to the catalog's or the facets' behaviour.

## Decisions

### D1. API consumed

| Operation | Method and path | Auth | Request | Response used | Errors and how they show |
|---|---|---|---|---|---|
| `listCoffeeShops` | `GET /coffeeshops` | none (`security: []`) | `name` (≤150), `city` (≤90), `postalCode` (≤12), `verified` (`1`), `orderBy` (`name`), `orderDirection` (`asc`/`desc`), `page` | `data[]`: `ulid`, `name`, `locationsCount`, `offeringsCount`, `verifiedOfferingsCount`, `locations[]` (`ulid`, `name`, `description`, `latitud`, `longitud`, `address`, `city`, `postalCode`, `country`, `phone`, `web`, `social`); `meta.current_page`, `meta.last_page`, `meta.total` | `422` (documented: invalid `orderBy`), any other non-2xx or transport failure → the list's one error state: `listError` + `RetryButton` (spec "Error and retry"). No API message is shown |
| `getACoffeeShop` | `GET /coffeeshops/{user_ulid}` | none | path `user_ulid` = the route's `ulid` | `data`: the same fields as one list item | `404` (documented: unknown, or not a coffee shop with a location) and any other failure → the detail's error state: back link, `detailError`, `RetryButton` (catalog D3/D9 pattern) |
| `listOfferings` | `GET /offerings` | none | the URL's offering keys through the R12 widget (catalog D1 pass-through, facets D4 sanitize), with `coffeeshopUlid` forced to the route's `ulid` | catalog D2 | the catalog's states (owned by the R12 widget) |
| `listCoffees`, `listOlfactoryTaxonomies`, `listRoasteries` | as facets D1 | none | — | facet options | as facets D1 ("Options unavailable") |
| OSM tiles (external) | `GET https://tile.openstreetmap.org/{z}/{x}/{y}.png` | none | — | images | a failed tile leaves the map background; markers, controls and page stay usable |

All API reads are fetched on the server with plain `fetch` through `publicRequest` (the settled data-loading rule). Only the tiles load in the browser.

### D2. Derived types (declared before any component)

In `src/shared/api/index.ts`, from `operations` (`schema.ts` is never edited):

- `CoffeeshopSummary` = `NonNullable<ListCoffeeShopsResponse["data"]>[number]`; `CoffeeshopsPageMeta` = `NonNullable<ListCoffeeShopsResponse["meta"]>`; `CoffeeshopDetail` = `NonNullable<GetACoffeeShopResponse["data"]>`.
- `CoffeeshopLocation` = the location item of `CoffeeshopSummary["locations"]`, with `description`, `latitud`, `longitud`, `address`, `city`, `postalCode`, `country`, `phone`, `web` and `social` widened to `string | null`. The schema types them as `string`, but the contract's own examples carry `null` (`phone: null`, `web: null`) and the API migration made `latitud`/`longitud`/`description` optional (decisions log, "contactos y locales"). The widening is the single read point, as the 2026-10-07 `offeringId` precedent.

UI-specific types, in the module that uses them:

- `src/widgets/coffeeshop-list/lib/query.ts`: `CoffeeshopsQuery = Record<string, string | string[] | undefined>`.
- `src/widgets/coffeeshop-list/api/coffeeshops.ts`: `CoffeeshopsPayload = { data: CoffeeshopSummary[]; meta: CoffeeshopsPageMeta }`.
- `src/entities/coffeeshop/api/coffeeshop.ts`: `CoffeeshopResult = { status: "found"; coffeeshop: CoffeeshopDetail } | { status: "not-found" } | { status: "failed" }`.
- `src/entities/coffeeshop/model/locations.ts`: `MapPoint = { id: string; groupId: string; lat: number; lng: number; label: string; title: string; subtitle: string; addressLine: string }`.
- `src/features/coffeeshop-facets/model/query.ts`: `CoffeeshopFilterValues = { name?: string; postalCode?: string; city?: string; verified?: "1"; sort: CoffeeshopSortId }`, `CoffeeshopSortId = "name-asc" | "name-desc"`.
- `src/widgets/coffeeshop-detail/ui/*`: `CoffeeshopTab = "offerings" | "locations"`, `CoffeeshopDetailTexts`.
- `src/widgets/coffeeshop-detail/lib/location-card-data.ts`: `LocationCardData = { name: string; description: string | null; contact: Contact | null; located: boolean }` (D11).
- `src/shared/ui/LocationsMap.tsx`: `LocationsMapPoint` (= `MapPoint`'s shape, declared in shared because shared cannot import entities), `LocationsMapTexts`, `LocationsMapProps` (D14).

### D3. Interfaces taken from merged changes (checked by task 1.1)

| From | Interface (as merged) | Used by |
|---|---|---|
| `add-offering-catalog` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (controlled, `activationMode="manual"`), `RetryButton`, `LabelValueRow`, `Pagination` from `@/shared/ui`; the detail skeleton classes; `catalog` and `landing` areas | D7, D8 |
| `add-offering-facets` | `buildFilterHref`, `clearFiltersHref`, `useFilterNavigation` from `@/shared/lib/filter-query`; `FiltersTrigger`, `FacetPanel`, `FacetTextField`, `FacetRadioList`, `Select`, `Field` from `@/shared/ui`; `offeringFacetsTexts`, `OFFERING_SORT_KEYS` from `@/features/offering-facets`; `filters` area keys (`title`, `trigger`, `triggerWithCount`, `clearAll`, `removeFilter`, `any`, `sortBy`, `noMatches`); `catalog.resultCount` | D5, D6, D9 |
| R9 (`extract-clear-filters-button`) | `ClearFiltersButton` from `@/shared/ui`, props `label` (the visible text) and `keep` (the query keys that survive); it navigates to `clearFiltersHref(pathname, current, keep)` | D5, D6 |
| R12 (`extract-filtered-offerings`) | From `@/widgets/offering-list`: `FilteredOfferingsToolbar` (`locale`, `searchParams`, `texts`; async), `FilteredOfferingsResults` (`locale`, `searchParams`, `path`, `fixedQuery?`, `texts: FilteredOfferingsResultsTexts`; the fixed keys override the address's on the request), `FilteredOfferingsFacets` (`locale`, `searchParams`, `texts`; async) | D9, D10, D17 |
| `add-user-contact` | `ContactDetails` from `@/entities/contact`, props `contact: Contact` (`@/shared/api`) and `texts: ContactTexts` (the `contact` area's eight labels); one `LabelValueRow` per non-null value; Web a native link only for `http://`/`https://` | D11 |
| `add-coffeeshop-location` (not merged) | `LocationCard` from `@/entities/location`, props `name`, `description?: string \| null`, `details?: ReactNode`, `noMapText?: string` (`origin/feature/add-coffeeshop-location`, `src/entities/location/ui/LocationCard.tsx`) | D11 |

When an interface differs, the build stops at task 1.1 and reports it; the architect updates these artifacts before the apply continues.

### D4. Query pass-through and sanitize

- `buildCoffeeshopsQuery(searchParams)` (`src/widgets/coffeeshop-list/lib/query.ts`) keeps only `name`, `city`, `postalCode`, `verified`, `orderBy`, `orderDirection`, `page` (first value of a repeated key), dropping everything else, `view` and `focus` included (spec "Directory query pass-through").
- `sanitizeCoffeeshopQuery(query)` (`src/features/coffeeshop-facets/model/query.ts`) replaces the facet and sort keys by their parsed values: `name`, `city`, `postalCode` trimmed, non-empty and within the contract limits (else dropped); `verified` only `"1"`; the sort pair only `orderBy=name` with `orderDirection` `asc` or `desc` (else both dropped; `name-asc` is written as no keys). `parseCoffeeshopFilters(params)` returns `CoffeeshopFilterValues` with the same rules.
- `CoffeeshopsScreen` requests with `sanitizeCoffeeshopQuery(buildCoffeeshopsQuery(searchParams))`. `Pagination` receives that query without `page`, plus `view=map` when the address carries it; `focus` is never kept by pagination (a focused coffee shop is on one page only).

### D5. Facets, chips and sort (feature `coffeeshop-facets`)

- `CoffeeshopFacets` (`"use client"`) renders the shared `FacetPanel` titled `filtersTitle` with, in order: `FacetTextField` search `name` (`nameFacet`), `FacetTextField` text `postalCode` (`postalCodeFacet`, help `postalCodeHelp`), `FacetTextField` text `city` (`cityFacet`), `FacetRadioList` `verified` (`verifiedFacet`; "Any" from `filters.any`, `verifiedOption` → `"1"`). Each commit calls `navigate({ key: value })` (`useFilterNavigation`, which drops `page`).
- `appliedCoffeeshopFilters(values, texts)` (`model/applied.ts`) returns the chips in facet order — Name, Postal code, City, "With verified offerings" — each removing only its key. The trigger count uses the same list.
- "Clear all" keeps `["orderBy", "orderDirection", "view"]`: the panel's `onClearAll` navigates to `clearFiltersHref(pathname, current, keep)` (the offering facets' pattern), and the filtered-empty state renders the shared `ClearFiltersButton` with `label` `filters.clearAll` and that `keep` (D6).
- Sort options: `name-asc` (`sortNameAsc`, no keys) and `name-desc` (`sortNameDesc`, `orderBy=name&orderDirection=desc`); the select writes `navigate({ orderBy, orderDirection })`.

### D6. Toolbar and filtered results

- `CoffeeshopsToolbar` (`"use client"`, feature) fills the body toolbar: a flex row that wraps, `items-end`, `gap-x-4 gap-y-3`, `justify-between`; a start group (`flex gap-4 items-end`) with `FiltersTrigger` (`filters.trigger` / `triggerWithCount`) and the `viewSlot` it receives (the view toggle, D13; empty until the map slice); at the end the sort `Field` + `Select` (`filters.sortBy`), growing between 12rem and 16rem, full width below `md` (summary §8).
- Filtered empty: with at least one applied chip and an empty page, `CoffeeshopList` shows `filters.noMatches` and `ClearFiltersButton` (`label` `filters.clearAll`, `keep` `["orderBy", "orderDirection", "view"]`) as `emptyAction`; otherwise `listEmpty`. The `resultCount` status (`role="status"`, visually hidden, `meta.total`) renders in success and empty states; it is placed outside the list's `Suspense` boundary if the boundary re-mounts on navigation (facets Risk 2).

### D7. Directory list and card

- `CoffeeshopsScreen` (pages): `PageSection surface="page"`; heading block (`listEyebrow` `type-eyebrow`, `h1` `listHeading`, `listIntro` `type-body`, a column 0.5rem apart), 2rem to the toolbar, 1.5rem to the results; the results in `Suspense` with three skeleton cards in a `grid grid-cols-1 gap-6` column (the catalog's one-column classes; never `CATALOG_GRID_CLASSES` with columns, never `OFFERING_GRID_CLASSES`).
- `Coffeeshops` (async widget) calls `fetchCoffeeshops(query)` (throws on non-2xx, as `fetchOfferings`) and renders `CoffeeshopList` with `ok` or `error`; `CoffeeshopList` (sync) renders the `<ul>` one column 1.5rem apart, `Pagination` 2rem below (`path` `/{locale}/coffeeshops`, `query` of D4), or the empty / filtered-empty / error branches (catalog `OfferingList` presentation: centred message, error with `RetryButton` 1rem below).
- `CoffeeshopCard` (`src/entities/coffeeshop/ui`, `Card layout="stacked"`), field mapping:

| Region | Content | API field |
|---|---|---|
| `CardContent` (stack 0.5rem apart) | `Badge variant="verified"` `verifiedBadge`, when `verifiedOfferingsCount > 0` | `verifiedOfferingsCount` |
| | `h3` name, `type-card-heading` | `name` |
| | `type-label` `locationsCount` with `{count}` | `locationsCount` |
| | `type-meta` unique cities joined " · ", API order; omitted when none | `locations[].city` |
| `CardFooter` | `type-meta` `offeringsCount` and `verifiedCount`, 1rem apart | `offeringsCount`, `verifiedOfferingsCount` |
| | links group at the end (1rem apart, wraps): `Link` `viewLabel` → `/{locale}/coffeeshops/{ulid}`; the `mapAction` slot (D13) | `ulid` |

The card takes `actions?: ReactNode` for the map button so the entity holds no navigation logic; the widget fills it.

### D8. Detail page

- `CoffeeshopDetailScreen` (pages) loads the texts and renders `PageSection surface="page"` with `CoffeeshopDetail` in `Suspense` (fallback: back link, the catalog D9 three placeholder bars, two skeleton cards).
- `CoffeeshopDetail` (async widget) calls `fetchCoffeeshop(ulid)` (entity; `publicRequest`; `found` / `not-found` on `404` / `failed`; never throws). `not-found` and `failed` → back link `backToDirectory`, 1.5rem, `detailError` + `RetryButton` in a column 1rem apart.
- `CoffeeshopDetailContent` (sync): back link (`Link variant="back"`, `backToDirectory`, → `/{locale}/coffeeshops`), 1.5rem, `CoffeeshopHeader` (stack 0.5rem: verified badge when `verifiedOfferingsCount > 0`, `h1` name, `type-label` `locationsCount`, `type-label` "`offeringsCount` · `verifiedCount`"), 2rem, `CoffeeshopTabs`, panels 1.5rem below the tab list. No `PageSection surface="section"` band and no section card (summary §5.7, refine-page-surfaces §5.2).
- `CoffeeshopTabs` (`"use client"`, widget) composes the shared `Tabs`: `active: CoffeeshopTab`, labels `tabOfferings` / `tabLocations`, two slots; `onValueChange` pushes `/{locale}/coffeeshops/{ulid}?tab={value}` (`useRouter`), the other keys dropped (the catalog D7 pattern: a tab switch starts the tab clean). The route passes the raw `tab`; `offerings` for absent or unknown values.

### D9. Routes and sidebar slot

- `app/[locale]/coffeeshops/page.tsx`: awaits `params` and `searchParams`, renders `CoffeeshopsScreen`; exports `generateMetadata` returning `coffeeshops.metaDescription` (catalog D17). Same for `app/[locale]/coffeeshops/[ulid]/page.tsx` → `CoffeeshopDetailScreen` (locale, `ulid`, raw `searchParams`).
- `app/[locale]/@sidebar/coffeeshops/page.tsx` → `CoffeeshopsSidebarScreen` (pages/coffeeshops): `AppSidebar` holding `CoffeeshopFacets` with the parsed values and texts.
- `app/[locale]/@sidebar/coffeeshops/[ulid]/page.tsx` → `CoffeeshopDetailSidebarScreen` (pages/coffeeshop-detail): when the tab is `offerings` (absent or unknown included), `AppSidebar` holding `FilteredOfferingsFacets` with the route's locale, its search params and `offeringFacetsTexts(filters)` — the catalog's `OfferingsSidebarScreen` composition; with `tab=locations`, `null` (no sidebar; spec "No sidebar on Locations"). The facets send no offerings request, so they take no fixed query. The decision is the screen's, so the route holds no logic.

### D10. Offerings tab

The panel reuses R12's compositions; nothing of the catalog is copied:

- `FilteredOfferingsToolbar` with the route's locale, its search params and `offeringFacetsTexts(filters)` (Filters trigger and sort), then, 1.5rem below, `FilteredOfferingsResults` with `locale`, `searchParams`, `path={`/${locale}/coffeeshops/${ulid}`}`, `fixedQuery={{ coffeeshopUlid: ulid }}`, `paginationQuery={{ tab: "offerings" }}` (D17) and the texts the catalog's `OfferingsScreen` builds (`catalog`, `landing`, `filters` areas).
- The fixed key overrides any `coffeeshopUlid` of the address (spec "Coffee shop filter cannot be replaced"); every other offering key passes through as in the catalog. Facet commits keep `tab` because `buildFilterHref` keeps keys it does not own; "Clear all" drops it, which shows Offerings, the default tab. One centred column (the widget's `CATALOG_GRID_CLASSES`, one column). The eleven offering facets show in the sidebar (D9), City included.

### D11. Locations tab and `LocationCard` (summary Open 13, option a)

- `LocationCard` is `add-coffeeshop-location`'s (D3): `Card layout="stacked"`, `h2` name (`type-card-heading`), description (`type-body`) when present, the `details` node, and the `noMapText` line (`type-meta`, `MapPinOff` icon `aria-hidden`) only when given. That change is not merged, so this change creates `src/entities/location/ui/LocationCard.tsx` and `src/entities/location/index.ts` with exactly that branch's content (so the later merge meets identical files) and no `LocationCard.test.tsx` (that branch owns it; this change covers the card through the Locations panel's tests).
- `toLocationCardData(location: CoffeeshopLocation)` (`src/widgets/coffeeshop-detail/lib/location-card-data.ts`) returns `{ name, description, contact, located }`: `contact` = a `Contact` with the flat location's `address`, `postalCode`, `city`, `country`, `phone`, `web`, `social` (no `email`; `null` values kept, `ContactDetails` skips them), or `null` when all seven are null; `located` = `isLocated(location)` (D12).
- `LocationsPanel` (sync) renders, per location, `LocationCard` with `name`, `description`, `details` = `ContactDetails` (`contact` area texts) when `contact` is not null, and `noMapText` = `coffeeshops.locationNoMap` (es "Sin posición en el mapa", en "Not on the map", ca "Sense posició al mapa") when `located` is false. The map block of D14 (help line, map 20rem high, unlocated line; panel without "View coffee shop") comes first once the map slice lands, then 2rem, the cards in a `<ul>` one column 1.5rem apart.

### D12. Map points (pure, `src/entities/coffeeshop/model/locations.ts`)

- `toMapPoints(coffeeshops)`: for each coffee shop in API order, each location whose `latitud` and `longitud` both parse (`Number`) to finite numbers → `{ id: location.ulid, groupId: coffeeshop.ulid, lat, lng, label: "{coffeeshop.name} — {location.name}", title: coffeeshop.name, subtitle: location.name, addressLine }`, `addressLine` = "{address}, {postalCode} {city}" with null parts and their separators omitted.
- `isLocated(location)`: both `latitud` and `longitud` parse to finite numbers (`null`, `""` and non-numeric text do not). `countUnlocated(coffeeshops)`: locations without both coordinates. `hasLocatedLocation(coffeeshop)`: at least one point.
- `uniqueCities(locations)`: non-null `city` values, first occurrence order.

### D13. View toggle, focus and full-screen sheet (map slice)

- `ViewToggle` (`src/shared/ui`, `"use client"`): the segment's `ToggleGroup` `type="single"`, `aria-label` from its `label` prop, items given as `{ value, label, icon }`; each item `inline-flex items-center gap-2 min-h-10 px-3 py-2 border border-action-3-border rounded-field type-label focus-visible:focus-ring`, rest `bg-action-3-bg text-action-3-text`, pressed (`data-[state=on]:`) `bg-action-3-bg-hover text-action-3-text-hover`; the group `inline-flex gap-2`. An empty value from Radix (re-clicking the pressed item) is ignored, so one item is always pressed. `ToggleGroup` stays segment-internal; `ViewToggle` is exported.
- `CoffeeshopsViewToggle` (widget, client): `List` / `MapIcon` with `viewList` / `viewMap`; choosing writes `view=map` or removes `view` (and `focus`) through `router.push(href, { scroll: false })`, keeping the other keys and `page`.
- Card map action: `Button variant="action-3" size="sm" icon={MapPin}`, `aria-label` `showOnMapLabel` with `{name}`, rendered only when `hasLocatedLocation`; it pushes `view=map&focus={ulid}` with the current filters, sort and page.
- `CoffeeshopsMapView` (widget, client): reads `useIsMobile()`. From `md`: the map block inline (help line, 0.5rem, map `h-[min(32rem,70vh)]` full width, `border border-border-subtle rounded-container overflow-hidden`, 0.5rem, `unlocatedCount` `type-meta` when > 0), then `Pagination`. Below `md`: the shared `Sheet` open as a full-screen overlay (`SheetContent` filling the viewport, no radius or border): a header row (`SheetTitle` `mapLabel` `type-subheading`, close `Button variant="primary" size="sm" icon={List}` `backToList`, padding 0.75rem 1rem, gap 0.75rem, bottom `border-border-subtle`), the map filling the rest, the help line `sr-only` (still the map's description); no pagination inside. Closing (button, Escape) pushes the address without `view` and `focus`; focus returns to the opener — the toggle's Map item or the card's map button — through the module-level request in `src/widgets/coffeeshop-list/lib/map-focus.ts`: the opener is recorded when the sheet opens and takes the request once the list renders again (the Map item when none was recorded); the sheet's `onCloseAutoFocus` is prevented.
- A `focus` naming no coffee shop of the page is ignored: the map fits all points and no marker is selected.
- Empty, filtered-empty and error states in the map view are the list's (`CoffeeshopList` branches); the map renders only for a non-empty page.

### D14. `LocationsMap` (`src/shared/ui`, client-only; map slice)

- Files: `LocationsMap.tsx` (`"use client"`, the Leaflet map, imported only by the loader) and `LocationsMapLoader.tsx` (`"use client"`, `dynamic(() => import("./LocationsMap"), { ssr: false, loading })`, the `loading` placeholder of the map's size: `bg-surface-section` with the spinner and the `mapLoading` text, the `LoadingStatus` pattern). Only the loader is exported from `@/shared/ui`.
- Props: `points: LocationsMapPoint[]`, `focusGroupId?: string`, `renderPanelLink?: (point) => ReactNode` (the directory passes a `next/link` "View coffee shop"; the detail omits it), `texts: LocationsMapTexts` (`mapLabel`, `mapHelp`, `zoomIn`, `zoomOut`, `closePanel`, `osmAttribution`, `osmContributors`), `helpId` (the id of the visible help line, for `aria-describedby`), `className` (the height).
- Map options: `zoomControl: false`, `attributionControl: false`, `keyboard: true`, `maxZoom: 19`; under `matchMedia("(prefers-reduced-motion: reduce)")` `zoomAnimation`, `fadeAnimation`, `markerZoomAnimation` and `inertia` false, and the map's `panBy` is wrapped with `animate: false` so the pans of `panTo` and `setView` never animate. Tile layer `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, the same in both themes (summary Open 9 (a)). Created in `useEffect`, removed on unmount (`map.remove()`).
- Container: `role="region"`, `aria-label` `mapLabel`, `aria-describedby` `helpId`, `tabIndex=0`, `focus-visible:focus-ring`.
- Bounds: fit all points with 2rem (32px) padding, plus the space of the top-right zoom controls (orchestrator decision W2); with `focusGroupId` naming a group, fit that group's points (one point → `setView(point, 16)`), mark them selected and open the first one's panel. No points → the component is not rendered; the caller shows `mapEmpty`.
- Markers: `L.marker(..., { keyboard: true, icon: L.divIcon({ html: element, className: "", iconSize: [32, 32] }) })` where `element` is a DOM element built with `document.createElement` (Leaflet 1.9.4 `DivIcon.html` accepts `string | Element`, `@types/leaflet@1.9.22` line 3026; a string is never used — app-shell "No injected raw HTML"). Element classes: `size-8 rounded-pill border-2 border-surface-card bg-action-primary text-action-primary-text flex items-center justify-center hover:bg-action-primary-hover focus-visible:focus-ring`, `data-[selected=true]:bg-action-primary-hover`; the `MapPin` icon (1rem, `aria-hidden`) rendered into it with `createRoot` from `react-dom/client`. Leaflet sets `tabindex="0"` and `role="button"` on keyboard markers (verified in `leaflet@1.9.4` `src/layer/marker/Marker.js` lines 236–238); the component sets `aria-label` = `label`. Enter and Space are both handled by the component's own `keydown` listener on the element (Leaflet 1.9.4 maps Enter only to a bound popup, and the panel is not one).
- Selected panel (React, absolutely positioned over the map, not a Leaflet popup): `Card` with `CardContent` at 1rem padding, `max-w-96`, 0.75rem from left/right, 2rem from the bottom; `role="region"` `aria-labelledby` its `h3` (`title`); `type-label` `subtitle`, `type-meta` `addressLine`, the panel link 0.5rem below; close `Button variant="action-4" size="sm" icon={X}` `aria-label` `closePanel`, top-right 0.5rem. Opening does not move focus; Escape (while the panel or its marker has focus) and Close close it and focus the marker element.
- Zoom: two `Button variant="action-4" size="sm"` icon-only (`Plus` `zoomIn`, `Minus` `zoomOut`), stacked 0.5rem apart, 0.75rem from top and right; they call `map.zoomIn()` / `map.zoomOut()`.
- Attribution: bottom-right overlay, `type-meta` `text-primary` on `bg-surface-card`, padding 0.25rem 0.5rem, `rounded-field` (the radius guard forbids corner variants such as `rounded-tl-field`): `osmAttribution` with `{link}` = native anchor `osmContributors` → `https://www.openstreetmap.org/copyright`, `LINK_CLASSES`. Always visible.
- Tokens and contrast: summary §7 measurements (markers, zoom buttons, focus ring over tiles, texts); no new token, no guard pair beyond those `add-offering-catalog` D15 and `add-user-account` D11 add.

### D15. Header entry, CSP, icons, texts

- `PrimaryNav`: `PrimaryNavTexts` gains `exploreCoffeeshops`; the entry `{ path: "/{locale}/coffeeshops", query: "", label }` sits between "Top rated" and "About us", same classes and current-page rule (path equality). `shell.exploreCoffeeshops`: es "Explora coffees", en "Explore coffee shops", ca "Explora cafeteries" (summary Open 11: kept as decided).
- `proxy.ts`: `img-src 'self' blob: data: https://tile.openstreetmap.org` (map slice; approved by Product owner).
- `src/shared/ui/icons.ts`: `MapPin` in the map slice, `MapPinOff` in the detail slice (`add-coffeeshop-location` adds the same names; the later merge keeps one list); `Map` exported as `MapIcon`, `List`, `Plus`, `Minus` in the map slice; each only if absent.
- Area `coffeeshops` (`messages/{es,en,ca}/coffeeshops.json`): the keys and strings of summary §9 exactly; `backToList` is the sheet's close text and `backToDirectory` the detail's back link. The map placeholder's text is `mapLoading` (es "Cargando el mapa…", en "Loading the map…", ca "Carregant el mapa…", architect's draft), added with the map slice. Reused: `filters` (chips, "Clear all", "Any", trigger, sort label, `noMatches`), `catalog.resultCount`, `catalog`/`landing` keys for the Offerings tab, `landing` pagination and retry keys (the pagination's `navigationLabel` and `pageLabel` are `landing.paginationNavigationLabel` and `landing.paginationPageLabel`). "{count} ubicaciones" for 1 is accepted (summary Open 11; the flat catalogs have no plural forms).

### D16. Map library (approved by Product owner, 2026-10-07)

| Option | Version | License | Notes |
|---|---|---|---|
| **(A) `leaflet` + in-house wrapper (recommended)** | `leaflet@1.9.4` (dist-tag `latest`), `@types/leaflet@1.9.22` (dev) | BSD-2-Clause (verified in the package's `package.json`); types MIT | no React peer, so React 19 / Next 16 compatibility reduces to client-only loading (D14); `dist/leaflet.js` 42.6 kB gzipped (measured on the npm tarball, 2026-10-07); keyboard pan/zoom and focusable markers built in |
| (B) `react-leaflet@5.0.0` + `leaflet` | peers `react ^19`, `leaflet ^1.9.0` | Hippocratic-2.1 (not OSI-approved) | one more package and a license Product owner would have to accept |
| (C) `leaflet@2.0.0-alpha.1` | alpha | BSD-2-Clause | not stable |
| (D) in-house map without a library | — | — | tile math, gestures and keyboard rebuilt: not recommended |

Sources: https://registry.npmjs.org/leaflet, https://registry.npmjs.org/react-leaflet/latest, https://registry.npmjs.org/@types/leaflet/latest; the summary §6 research. `leaflet` is imported only through `src/shared/lib/leaflet/index.ts`, which also imports `leaflet/dist/leaflet.css` once (local docs, "External stylesheets"); an `icons.test.ts`-style guard fails on any other `leaflet` import in `src/`. **Status: approved** — option (A), `leaflet@1.9.4` + `@types/leaflet@1.9.22` (dev), exact versions (decisions log 2026-10-07, "mapa del directorio con Leaflet y `perPage`"; that entry is the approval AGENTS.md "Dependencies" requires). tasks.md groups 7–11 carry the map slice: the first map task installs the two versions, and the others implement D12's map functions, D13, D14, the map parts of D11 and D15, and the CSP line.

### D17. Pagination keys of the filtered offerings results (orchestrator decision 2026-10-07)

- `FilteredOfferingsResults` gains one optional prop, `paginationQuery?: OfferingsQuery`: keys added to the query of the pagination links only, never to the API request. It threads it to `Offerings` (same optional prop), whose pagination query becomes `{ ...query, ...paginationQuery }`; the request keeps `query`.
- The catalog passes nothing, so its request and its pagination links are unchanged (spec "Catalog without fixed keys unchanged"). The Offerings tab passes `{ tab: "offerings" }`, so its Next and Previous links keep the tab (spec "Pagination stays on the detail").

## Files touched (full path and FSD layer)

| File | Layer | Change | Slice |
|---|---|---|---|
| `app/[locale]/coffeeshops/page.tsx`, `app/[locale]/coffeeshops/[ulid]/page.tsx` | app (routing) | New (D9) | list / detail |
| `app/[locale]/@sidebar/coffeeshops/page.tsx`, `app/[locale]/@sidebar/coffeeshops/[ulid]/page.tsx` | app (routing) | New (D9) | facets / detail |
| `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx`, `CoffeeshopsSidebarScreen.tsx`, tests, `index.ts` | pages | New (D7, D9) | list / facets |
| `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx`, `CoffeeshopDetailSidebarScreen.tsx`, tests, `index.ts` | pages | New (D8, D9) | detail |
| `src/widgets/coffeeshop-list/api/coffeeshops.ts`, `lib/query.ts`, `ui/Coffeeshops.tsx`, `ui/CoffeeshopList.tsx`, tests, `index.ts` | widgets | New (D4, D7) | list |
| `src/widgets/coffeeshop-list/ui/CoffeeshopsViewToggle.tsx`, `ui/CoffeeshopsMapView.tsx`, `ui/ShowOnMapButton.tsx` | widgets | New (D13) | map |
| `src/widgets/coffeeshop-detail/ui/CoffeeshopDetail.tsx`, `CoffeeshopDetailContent.tsx`, `CoffeeshopHeader.tsx`, `CoffeeshopTabs.tsx`, `LocationsPanel.tsx`, `lib/location-card-data.ts`, tests, `index.ts` | widgets | New (D8, D10, D11) | detail |
| `src/features/coffeeshop-facets/model/query.ts`, `model/applied.ts`, `ui/CoffeeshopFacets.tsx`, `ui/CoffeeshopsToolbar.tsx`, tests, `index.ts` | features | New (D4–D6) | facets |
| `src/entities/coffeeshop/api/coffeeshop.ts`, `model/locations.ts`, `ui/CoffeeshopCard.tsx`, tests, `index.ts` | entities | New (D7, D8, D12) | list / detail |
| `src/entities/location/ui/LocationCard.tsx`, `index.ts` | entities | New, identical to `add-coffeeshop-location`'s (D11) | detail |
| `src/widgets/offering-list/ui/FilteredOfferingsResults.tsx`, `Offerings.tsx`, `FilteredOfferingsResults.test.tsx` | widgets | Modified: `paginationQuery` (D17) | detail |
| `src/shared/ui/ViewToggle.tsx`, `LocationsMap.tsx`, `LocationsMapLoader.tsx`, tests | shared | New (D13, D14) | map |
| `src/shared/lib/leaflet/index.ts`, its guard test | shared | New (D16) | map |
| `src/shared/ui/icons.ts`, `src/shared/ui/index.ts`, `index.test.tsx` | shared | Modified (D15) | each slice |
| `src/shared/api/index.ts` | shared | Derived types (D2) | types |
| `src/widgets/app-header/ui/PrimaryNav.tsx`, its test; the shell texts wiring | widgets | Modified (D15) | header |
| `proxy.ts`, `proxy.test.ts` | app | `img-src` (D15) | map |
| `messages/{es,en,ca}/coffeeshops.json`, `messages/{es,en,ca}/shell.json` | texts | New / modified (D15) | each slice |

Nothing in `contracts/openapi.yaml`, `src/shared/api/schema.ts`, `openspec/specs/`, `config.yaml` or `AGENTS.md` is touched.

## Risks / Trade-offs

- [`LocationCard` comes from an unmerged change] → created identical to its branch (D11); `icons.ts`, `proxy.ts` and `src/shared/ui/index.ts` will meet that branch's lines at merge time and keep both sides.
- [The map slice lands after the other slices] → tasks.md groups 1–6 ship the directory, the facets, the detail and both tabs without the map; the toggle and the card's map action are not rendered until groups 7–11 land, so no control leads nowhere in between.
- [The scope exceeds one implementation session] → tasks.md is grouped in vertical slices (list, facets, detail, header) with apply boundaries explicit; the map slice is already separate. Reported to Product owner.
- [Leaflet's `keyboard` handler listens on `document` keydown while the map has focus; Space is not a Leaflet marker key] → D14 adds a Space listener on the marker element; the map test asserts both keys.
- [The tab pairs on `surface-page` were not measured by the summary (§7)] → they are the pairs `add-offering-catalog` registers when its tab bar leaves the section band; no pair is added here.
- [`perPage` is accepted by the API but undocumented] → not sent; the API default page size applies.
- [OSM tile usage policy] → attribution always visible (D14), no bulk prefetch, default tile URL; a heavy-traffic deployment would need another tile provider (a later decision).

## Migration Plan

No migration: new public routes, one header entry and one CSP source. Rollback removes the routes and the entry. `develop` (with the D3 dependencies) merges into this branch before the apply (task 1.1); shared files (`proxy.ts`, `PrimaryNav.tsx`, `shell.json`, `icons.ts`, `src/shared/ui/index.ts`) resolve conflicts keeping both sides.

## Open Questions

None. The `config.yaml` line (summary Open 1) was applied by Product owner (`bbf5e66`), and the en/ca drafts with `mapLoading` and `locationNoMap` were accepted (decisions log 2026-10-07, "geocodificación propia y mandato de autonomía").
