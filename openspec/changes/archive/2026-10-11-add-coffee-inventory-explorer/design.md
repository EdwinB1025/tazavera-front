## Context

Backlog entry R68 settles the product decisions (entry point, list, filters, card, detail page, "Create offering" preselection). The coffee inventory is read today only by the New offering combobox, through `searchCoffeeInventory` in `src/features/offering-management/api/management.ts` (`coffeeName` only, token client). The list follows the existing lists: the coffee shop directory for the heading block, toolbar and text facets in the sidebar sub-section of the list's entry, and My offerings for the client-side read, its gate and its card grid. The header and button rules are base-controls "Navigation controls by position", "Action variants by kind" and "Back link to the previous page".

## Goals / Non-Goals

**Goals:** the coffee shop explores and filters the inventory, opens one item and starts an offering from it, with one shared inventory request.

**Non-Goals:** sort, pagination, selection, other filters, API or contract changes, a new entry in the existing management sidebars.

## API endpoint consumed

`GET /coffeeInventory` (`listCoffeeInventory`): auth `auth:api`, role `coffeeshop`, scope `profile:read` or `profile:write`, sent through the token client (`request` from `@/shared/api`). Request: the optional query parameters `coffeeName`, `originCountry`, `originRegion`, `process`, `producer`, `city`. Response `200`: `{ data: CoffeeInventoryItem[] }`, no pagination. The contract documents no error response: any non-2xx status and any transport failure map to one error result (`{ ok: false, kind: "error" }`), shown as the list's or the detail's error message with a retry action, or, for the New offering preselection, as no preselection. The API's `message` is never shown.

## Derived types

In `src/shared/api/index.ts` (built on the generated `schema.ts`, which is not edited):

```ts
export type CoffeeInventoryQuery = NonNullable<
  operations["listCoffeeInventory"]["parameters"]["query"]
>;
/** The six filter keys of `listCoffeeInventory`. */
export type CoffeeInventoryFilterKey = keyof CoffeeInventoryQuery;
```

`CoffeeInventoryItem` and `CoffeeInventoryPayload` already exist.

## Decisions

### D1 — One inventory request

`management.ts` gains `listCoffeeInventory(query: CoffeeInventoryQuery, signal?: AbortSignal): Promise<ApiResult<CoffeeInventoryItem[]>>`: it sends `GET /coffeeInventory` with each non-empty key of `query`, in the contract's order (`coffeeName`, `originCountry`, `originRegion`, `process`, `producer`, `city`), each value encoded with `encodeURIComponent`, and no `?` when no key is set. `searchCoffeeInventory(coffeeName, signal)` stays as the combobox's entry and calls `listCoffeeInventory({ coffeeName }, signal)`, so its URL is unchanged. No second inventory request exists in the codebase.

### D2 — The inventory read hook

`src/features/offering-management/model/inventory.ts` exports `useCoffeeInventory(query: CoffeeInventoryQuery, enabled: boolean)`, returning `{ inventory: InventoryState; retry: () => void }` with `InventoryState = { state: "loading" } | { state: "error" } | { state: "success"; items: CoffeeInventoryItem[] }`. It reads only while `enabled` (the session is a signed-in coffeeshop), keys each read by the serialized query and a retry counter (a result of another key reads as loading, as `useLocationsRead` does), and ignores a superseded answer. The slice's public index exports `useCoffeeInventory`, `listCoffeeInventory` is not exported (pages use the hook; the create flow imports its sibling segment).

### D3 — The inventory entity

New slice `src/entities/coffee-inventory` (business concept: how an inventory item looks), public index exporting `InventoryCard`, `InventoryFields` and their texts types.

- `model/rows.ts`: `inventoryRows(item, texts)` returns the labelled rows of the card, in this order, skipping the producer row when `coffee.producer` is null and the certifications row when `coffee.certifications` is empty: Process, Variety, Roast level, Altitude (`{altitude} m`, the unit a fixed constant, not a catalog text), Producer, Certifications (the codes joined with ", "), Roastery, Roast lot, Production date. A missing value renders as an empty string.
- `ui/InventoryCard.tsx`: the shared `Card` in the stacked layout (as `CoffeeshopCard`). Content: the coffee name as `h2.type-card-heading`, the origin line (`coffee.country · coffee.region`, empty parts skipped) as `p.type-meta`, then one `<dl>` of `LabelValueRow`s, 0.5rem apart, the content column 0.5rem apart. Footer: one `ActionGroup align="end"` that fills the row below `md` and sits at the end from `md` (`max-md:w-full md:ml-auto`, as the other cards), holding the `actions` the consumer passes.
- `ui/InventoryFields.tsx`: the detail's `<dl>` of `LabelValueRow`s, 0.75rem apart: the card's rows, then Coffee lot (`coffee.lot`), then one row per certification (label: its `code`; value: its `description`), then the roastery's description (when present).

### D4 — The card actions

`src/pages/manage-inventory/ui/InventoryCardActions.tsx` renders the two `RouteButton`s in size `sm`: "View" in `action-3` to `/{locale}/manage/inventory/{ulid}` and "Create offering" in `action-1` to `/{locale}/manage/offerings/new?inventory={ulid}` (the ulid encoded). "Create offering" here starts something, so it takes positional treatment 1 as R68 settles. The detail header reuses the "Create offering" route with a `RouteButton` of size `sm` in `action-1`.

### D5 — The inventory facets

New feature slice `src/features/inventory-facets`, following `coffeeshop-facets`:

- `model/query.ts`: `INVENTORY_LIMITS` (`coffeeName` 150, `originCountry` 60, `originRegion` 90, `process` 60, `producer` 150, `city` 90); `parseInventoryFilters(params: URLSearchParams | QueryRecord): CoffeeInventoryQuery` keeps the first value of each of the six keys, trimmed, and drops a value that is empty or longer than its limit; any other key is ignored. The parsed record is the request query (D1), so no other key reaches the API.
- `model/applied.ts`: `appliedInventoryFilters(values, texts)` returns one chip per set key in facet order, each removing only its key.
- `ui/InventoryFacets.tsx`: the shared `FacetPanel` with six `FacetTextField`s in the spec's order (Coffee name `type="search"`), each `onCommit` navigating `{ [key]: value }` through `useFilterNavigation`; chips remove one key; "Clear all" uses `clearFiltersHref` keeping nothing.
- `ui/InventoryToolbar.tsx`: a row holding only the shared `FiltersTrigger`, labelled "Filters" or "Filters ({count})".
- `model/texts.ts`: the `InventoryFilterTexts` type and `inventoryFacetsTexts(management, filters)`, which takes the six facet labels from the `offering-management` catalog and the generic texts (`title`, `clearAll`, `removeFilter`, `trigger`, `triggerWithCount`) from `filters`.

### D6 — The list page

New page slice `src/pages/manage-inventory`:

- `ManageInventoryScreen` (server, thin): reads the `offering-management`, `filters`, `catalog` and `landing` catalogs, parses the filters from the route's `searchParams`, and renders, in a `PageSection surface="page"` whose container is a column 1.5rem apart, a header column 2rem apart (heading block — eyebrow `type-eyebrow`, `h1.type-heading`, intro `type-body`, 0.5rem apart — then the toolbar) and the client list `InventoryListClient`. The toolbar renders inside the client list's gate, so it shows only for a signed-in coffeeshop.
- `InventoryListClient` (client): `SessionGate` with `allows: role === "coffeeshop"`; loading → the skeleton grid; signed out → `SignedOutPrompt` whose action calls `signIn("/{locale}/manage/inventory")`; allowed → `InventoryResults`, which calls `useCoffeeInventory(query, true)`.
- `InventoryResults` (client): the toolbar, then the results 1.5rem below: loading → three `OfferingSkeletonCard`s in the grid; error → the centred error message and a `primary` retry `Button` (as My offerings); empty → with filters, "No results match these filters." and `ClearFiltersButton` keeping nothing, without, the empty message, centred; success → one `InventoryCard` per item in the grid of My offerings (`grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3`). In the success and empty states a `ResultStatus` announces `catalog.resultCount` with the number of items.
- `ManageInventorySidebarScreen` (server): `AppSidebar` with `entries` = `ManagementSidebarEntries` (current `false`) holding `LocationsSidebarEntry` (current `false`), and `listEntry` = "Explore coffee inventory" to `/{locale}/manage/inventory`; with `searchParams`, the `subsection` holds `InventoryFacets` titled with `filters.title`; without, no subsection (the detail).

### D7 — The detail page

New page slice `src/pages/inventory-detail`:

- `InventoryDetailScreen` (server, thin): reads the catalogs and renders, in a `PageSection surface="page"`, the client `InventoryDetailClient` with the route's `ulid`.
- `InventoryDetailClient` (client): `SessionGate` as D6 (loading → back link and `LoadingStatus`; signed out → back link and `SignedOutPrompt` with `signIn` for the detail route). Allowed: `useCoffeeInventory({}, true)`; loading → back link and `LoadingStatus`; error → back link, the error message and the retry `Button`; success with the item → `InventoryDetailView`; success without it → `InventoryNotFound`.
- `InventoryDetailView`: a column 1.5rem apart: `BackLink` (fallback `/{locale}/manage/inventory`, text "Back to the coffee inventory"); the header column 2rem apart from the body, holding the eyebrow and `h1` 0.5rem apart and the "Create offering" button 1rem below the heading; then a `Card variant="section"` with no header band whose `CardContent` holds `InventoryFields`.
- `InventoryNotFound`: the title as `h1.type-heading` and its line 0.5rem apart, the back `RouteButton` (`action-3`, `sm`, `ArrowLeft`) 1.5rem below, to `/{locale}/manage/inventory`; it repeats the evaluation form's `NotFoundNotice` markup with another destination, because a page slice cannot import another (reported as a backlog candidate).
- `app/[locale]/@sidebar/manage/inventory/[ulid]/page.tsx` renders `ManageInventorySidebarScreen` without `searchParams`.

### D8 — The New offering preselection

`app/[locale]/manage/offerings/new/page.tsx` reads the first `inventory` value of `searchParams` and passes it to `NewOfferingScreen` as `inventory`, which passes it to `NewOfferingForm` and to `useCreateFlow({ enabled, preselected })`. The flow, when `enabled` and `preselected` is set, sends one `listCoffeeInventory({})` and, if an item has that `ulid` and the user has made no choice yet (a ref set by `choose`), sets it as the chosen item; a failure or no match changes nothing. `InventoryField` already shows a chosen item's coffee name and its lot help from `value`, so it is unchanged.

### D9 — The user menu entry

`UserMenu` adds, for `coffeeshop` only and right after "Manage locations", a menu item over `next/link` to `/{locale}/manage/inventory` led by the decorative `Compass` icon (the icon of the other "Explore" entry, already exported). `UserMenuTexts` and `AppHeaderTexts` gain `exploreInventory?: string`; `AppShell` passes `texts.exploreInventory`; `messages/{es,en,ca}/shell.json` gain `exploreInventory`: es "Explorar inventario de café", en "Explore coffee inventory", ca "Explora l'inventari de cafè".

### D10 — Texts

New keys in `messages/{es,en,ca}/offering-management.json` (en shown): `inventoryHeading` "Coffee inventory", `inventoryIntro` "The coffees available to create your offerings.", `inventoryEmpty` "There is no coffee in the inventory.", `inventoryError` "The coffee inventory could not be loaded.", `inventorySignedOut` "Sign in to explore the coffee inventory.", `inventoryLoading` "Loading…", `inventoryView` "View", `inventoryCreateOffering` "Create offering", `inventoryBack` "Back to the coffee inventory", `inventoryNotFoundTitle` "Inventory item not found", `inventoryNotFoundLine` "It may have been removed, or the link may be wrong.", `sidebarExploreInventory` "Explore coffee inventory", the row labels `inventoryProcess` "Process", `inventoryVariety` "Variety", `inventoryRoastLevel` "Roast level", `inventoryAltitude` "Altitude", `inventoryProducer` "Producer", `inventoryCertifications` "Certifications", `inventoryRoastery` "Roastery", `inventoryRoastLot` "Roast lot", `inventoryProductionDate` "Production date", `inventoryCoffeeLot` "Coffee lot", `inventoryRoasteryDescription` "About the roastery", and the facet labels `facetCoffeeName` "Coffee name", `facetCountry` "Country", `facetRegion` "Region", `facetProcess` "Process", `facetProducer` "Producer", `facetCity` "City". The eyebrow reuses `eyebrow` ("Management") on the list and `inventoryHeading` on the detail; the retry reuses `retryLabel`, sign in `signInLabel`. The generic filter texts and `noMatches` come from `filters`, the result count from `catalog.resultCount`. es and ca carry the same keys, translated.

### Files

| Path | Layer | Change |
|---|---|---|
| `app/[locale]/manage/inventory/page.tsx` | routing | new |
| `app/[locale]/manage/inventory/[ulid]/page.tsx` | routing | new |
| `app/[locale]/@sidebar/manage/inventory/page.tsx` | routing | new |
| `app/[locale]/@sidebar/manage/inventory/[ulid]/page.tsx` | routing | new |
| `app/[locale]/manage/offerings/new/page.tsx` | routing | passes `inventory` |
| `src/shared/api/index.ts` | shared | derived types |
| `src/features/offering-management/api/management.ts`, `model/inventory.ts`, `model/create-flow.ts`, `index.ts` | features | D1, D2, D8 |
| `src/features/inventory-facets/**` | features | new (D5) |
| `src/entities/coffee-inventory/**` | entities | new (D3) |
| `src/pages/manage-inventory/**` | pages | new (D4, D6) |
| `src/pages/inventory-detail/**` | pages | new (D7) |
| `src/pages/new-offering/ui/NewOfferingScreen.tsx`, `NewOfferingForm.tsx` | pages | D8 |
| `src/widgets/app-header/ui/UserMenu.tsx`, `AppHeader.tsx`, `src/app/shell/AppShell.tsx` | widgets, app | D9 |
| `messages/{es,en,ca}/shell.json`, `offering-management.json` | — | D9, D10 |

## Risks / Trade-offs

- The detail page and the preselection read the whole inventory to find one item, because the contract has no read of one item; the inventory is a catalog of roasters' lots, small enough for one response (the list already reads it whole).
- `InventoryNotFound` repeats about 20 lines of the evaluation form's `NotFoundNotice`: backlog candidate (one shared item-not-found notice taking its destination).
