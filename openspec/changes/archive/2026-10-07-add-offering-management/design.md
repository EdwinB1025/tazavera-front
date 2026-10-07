# Design

## Context

See proposal.md — Why. The approved design summary `docs/design/add-offering-management/design-summary.md` (2026-10-06) is the design source of truth for the two screens: its §4 (parts and states), §5 (token pairs), §6 (layout and spacing), §8 (texts) and §11 (expected coverage) are normative here, and this document is the implementation contract that records the decisions the explore answers settle. The current state it builds on:

- `develop` already holds the token and component layers (`Button`, `Link`, `Field`, `Input`, `Checkbox`, `Card`, `Badge`, `PageSection`, `Pagination`, the `Sidebar` parts in `src/shared/ui`), `OfferingCard` (`src/entities/offering`), `fetchTaxonomies` / `buildTaxonomyLookup` (`src/entities/taxonomy`), `OfferingSkeletonCard` and `OFFERING_GRID_CLASSES` (`src/widgets/offering-list`), and the auth seam: `useSession()`, `signIn(returnRoute?)`, `requestProfileWrite(returnRoute)` (`@/features/auth`), `request` and `publicRequest` (`@/shared/api`).
- Four shared pieces arrive with their own changes and are not merged at propose time: `ConfirmDialog` (`add-evaluation-scales`, `feedback`), the `OfferingCard` `actions` slot that replaces its `session` prop (`replace-offering-card-session`, `landing`), the `@sidebar` parallel-route slot and the `SidebarMenuButton` link form with the sidebar's hover and focus fixes (`add-sidebar-slot`, `app-shell`), and the search-as-you-type combobox with its search hook and `Input` variant pass-through (`add-facet-controls`, `filtering`).
- Route files follow the App Router pattern already in the repo (`app/[locale]/page.tsx`): typed `PageProps<"/…">` props, awaited `params` / `searchParams`, and no logic. The build reads the installed Next.js guides under `node_modules/next/dist/docs/` before writing them.
- Tokens live only in the browser (in-memory tokens, no auth cookie), so the session's `ulid` — the own list's filter — is available to client code only.

### API endpoints consumed

| # | Operation | Method and path | Auth (contract) | Request | Response | Errors |
|---|---|---|---|---|---|---|
| 1 | `listOfferings` (own list) | `GET /offerings?coffeeshopUlid={session user ulid}&page={n}` | public (no security scheme) | query `coffeeshopUlid` (the session user's `ulid`, must match an existing stored value), `page` | 200 `{ data: OfferingSummary[], meta: { current_page, last_page, per_page } }` | transport or non-2xx → the list's error state with retry; a 422 is treated like any error (summary Open 7) |
| 2 | `deleteAnOffering` | `DELETE /offerings/{offering_ulid}` | `coffeeshop` role, `profile:write`, owns the offering | path `offering_ulid` | 200 `{ message }` (the `message` is never shown) | 403 → step-up in the dialog's error area; transport, non-2xx or 422 → the dialog's error text, retry allowed |
| 3 | `deleteMultipleOfferings` | `DELETE /offerings` | `coffeeshop` role, `profile:write`, owns all | body `{ offerings: string[] }` (required; maximum 50 by description only — M5) | 200 `{ message }` | as #2 |
| 4 | `listMyLocations` | `GET /locations` | `coffeeshop` role, `profile:read` or `profile:write` | none | 200 `{ data: [{ ulid, name, description, latitud, longitud, contacts[] }] }` | transport or non-2xx → the locations group's error line with retry |
| 5 | `listCoffeeInventory` | `GET /coffeeInventory?coffeeName={typed text}` | `coffeeshop` role, `profile:read` or `profile:write` | query `coffeeName` (max 150 chars) | 200 `{ data: [{ ulid, roastLot, productionDate, coffee: { ulid, name, roastLevel, process, variety, producer, country, region, altitude, lot, certifications[] }, roastery: { ulid, name, description } }] }` | transport or non-2xx → the results list's failure row; 422 the same (summary Open 7) |
| 6 | `createOfferings` | `POST /offerings` | `coffeeshop` role, `profile:write`, owns every location | body `{ coffeeInventoryId: string (required), locations: string[] }` — `locations` is not required in the contract (M2) | 201 `{ data: [Offering…], message }` | 403 → step-up in the form's error area; transport, non-2xx or 422 → the generic form error, values kept |
| 7 | `listOlfactoryTaxonomies` | `GET /taxonomies` | public | none | 200 `{ data: [taxonomy nodes] }` | resolved on the server through `fetchTaxonomies`; a failure puts the list in its error state (as landing) |

Operation #5 is fetched through `request` while the user types (the combobox search hook of `add-facet-controls`: two typed characters, a 300 ms pause, an older request aborted). Operations #2, #3, #4 and #6 are fetched through `request` (the token client). Operation #1 is fetched through `publicRequest` with no credential (decision D1). Operation #7 runs on the server with plain `fetch` inside `fetchTaxonomies`.

### How API errors are presented

Every API `message` string is discarded and every text comes from the catalog (spec "Localized management texts"). Presentation per state:

| Operation | Loading | Empty | Error (transport, non-2xx, 422) | 403 |
|---|---|---|---|---|
| `listOfferings` | three skeleton cards in the grid | message and the "create an offering" link | message and Retry (refetches) | n/a (public) |
| `deleteAnOffering` / `deleteMultipleOfferings` | the dialog's confirm action busy, cancel unavailable | — | the dialog stays open with its error text, retry allowed | the step-up text and its action in the dialog's error area (single alert region) |
| `listMyLocations` | a loading line in the group's place | message, submit unavailable | error line and Retry | error line and Retry |
| `listCoffeeInventory` | the results list's searching row | the no-matches row | the failure row | the failure row |
| `createOfferings` | the submit action busy | — | the generic form error, values kept | the step-up text and its action in the form's error area (single alert region), values kept |

The step-up also appears for a 403 caused by ownership or role, because the contract documents no body that tells those apart (M4) — accepted with the summary's Open 6.

### Card sections filled from the API (shared card)

The list renders `OfferingCard` unchanged (its `actions` slot filled by this change, decision D7):

| Card section | Source |
|---|---|
| Score row — large number, `/100` scale, rating badge | `cuppingAvg` (unchanged card behaviour) |
| Verification state badge | `verificationStatus` |
| Coffee name | `coffeeInventory.coffee.name` |
| Coffeeshop caption | `location.name` |
| Roaster caption | `coffeeInventory.roastery.name` |
| Origin line | `coffeeInventory.coffee.{country,region,process,variety}` |
| Taxonomy badges | `sensoryTaxonomy` resolved against `GET /taxonomies` |
| Footer counts | `evaluationCount`, `defectiveEvaluationCount` |
| Footer links | `ulid` (View destination) |
| Footer `actions` slot (this change) | `ulid` (delete target), `coffeeInventory.coffee.name` and `location.name` (the Select and Delete accessible names) |

### Derived and UI-specific types (declared before any component)

Derived from the generated `src/shared/api/schema.ts` through `operations`, added to the named aliases of `src/shared/api/index.ts`; no generated type is edited or redefined:

- `LocationItem` — one item of `listMyLocations` `data`; `LocationsPayload` — its 200 body.
- `CoffeeInventoryItem` — one item of `listCoffeeInventory` `data`; `CoffeeInventoryPayload` — its 200 body.
- `CreateOfferingsPayload` — the 201 body of `createOfferings`.

`OfferingSummary`, `OfferingsPageMeta` and `Session` already exist and are reused. UI-specific types (the screens' texts types, the list-state and form-state unions, the selection state) are declared before their components inside `src/pages/*` and `src/features/offering-management`, never in `shared/api`.

### Files created and modified

| Path | FSD layer | Change |
|---|---|---|
| `app/[locale]/manage/offerings/page.tsx` | app (routing) | created: passes the locale and the `page` search param to `ManageOfferingsScreen`; no logic |
| `app/[locale]/manage/offerings/new/page.tsx` | app (routing) | created: passes the locale to `NewOfferingScreen` |
| `app/[locale]/@sidebar/manage/offerings/page.tsx` | app (routing) | created: the `@sidebar` slot page of the list route; renders the entries block of `src/pages/manage-offerings` |
| `app/[locale]/@sidebar/manage/offerings/new/page.tsx` | app (routing) | created: the `@sidebar` slot page of the create route; renders the entries block of `src/pages/new-offering` |
| `src/pages/manage-offerings/index.ts` | pages | created: slice public API (`ManageOfferingsScreen`, `ManageOfferingsSidebarEntries`) |
| `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx` | pages | created: server composition — loads the `offering-management` and `landing` catalogs and the taxonomies, renders the page section, the header and the client panel |
| `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` | pages | created: the client composition of the own list — grid, cards, skeletons, toolbar and pagination around the feature's state and actions (D2) |
| `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.tsx` | pages | created: the sidebar entry block for the list route |
| `src/pages/new-offering/index.ts` | pages | created: slice public API (`NewOfferingScreen`, `NewOfferingSidebarEntries`) |
| `src/pages/new-offering/ui/NewOfferingScreen.tsx` | pages | created: server composition — loads the `offering-management` catalog, renders the page section, the header and the client form |
| `src/pages/new-offering/ui/NewOfferingForm.tsx` | pages | created: the client composition of the form around the feature's state and actions, inside the shared section card (D15) |
| `src/pages/new-offering/ui/NewOfferingSidebarEntries.tsx` | pages | created: the sidebar entry block for the create route |
| `src/features/offering-management/index.ts` | features | created: slice public API |
| `src/features/offering-management/api/management.ts` | features | created: `fetchOwnOfferings` (`publicRequest`), `deleteOffering`, `deleteOfferings`, `createOfferings`, `fetchMyLocations`, `searchCoffeeInventory` (`request`) |
| `src/features/offering-management/model/own-offerings.ts` | features | created: the own-list state (states, refetch) and the selection state (D7) |
| `src/features/offering-management/model/delete-flow.ts` | features | created: the single and bulk delete flows, their pending and error states and the step-up (D5) |
| `src/features/offering-management/model/create-flow.ts` | features | created: the create form state (chosen item, locations, submit states, step-up) |
| `src/features/offering-management/ui/OfferingActions.tsx` | features | created: the `actions` slot content — Select and Delete with their accessible names |
| `src/features/offering-management/ui/SelectionToolbar.tsx` | features | created: select-all, selected count and the bulk delete action |
| `src/features/offering-management/ui/DeleteOfferingsDialog.tsx` | features | created: the `ConfirmDialog` composition of both delete flows |
| `src/features/offering-management/ui/InventoryField.tsx` | features | created: the inventory field — the shared combobox with its search function and result rows, and the help line of D4 |
| `src/features/offering-management/ui/LocationsFieldset.tsx` | features | created: the locations group with its loading, empty and error states |
| `src/features/offering-management/ui/ManagementGate.tsx` | features | created: the session gate of D6 |
| `src/features/offering-management/ui/ManagementSidebarEntries.tsx` | features | created: the "Manage offerings" entry (icon + label + current state) |
| `src/shared/api/index.ts` | shared (api) | modified: the three derived aliases above |
| `src/shared/ui/icons.ts` | shared (ui) | modified: `Trash2` and `List` join the single icon entry point (`lucide-react` is installed; no new dependency) |
| `src/shared/ui/Combobox.tsx` | shared (ui) | modified (filtering capability): inside a `Field` it renders no label or help of its own and its input takes the Field's control id (D14); unchanged outside a `Field` |
| `messages/es/offering-management.json`, `messages/en/offering-management.json`, `messages/ca/offering-management.json` | message catalog (offering-management area) | created: the area's texts (D11) |

Each of the `src/**` pieces lands with the tests its group owes (`*.test.tsx` beside the file). `src/widgets/offering-list` changes nothing: `OfferingSkeletonCard` and the card are consumed through its public API (D2).

## Goals / Non-Goals

**Goals:**

- Both screens composed from existing pieces only: no new shared component and no new token (summary §4 "New components in `src/shared/ui`: none from this change").
- One source per mechanism: one grid constant of this change, one alert region per error surface, one selection model, one gate.
- Every text through the catalogs and every API value as returned.

**Non-Goals:**

- No change to `OfferingCard`, `Pagination`, `PageSection`, the form fields, the `Sidebar` parts or the message mechanism.
- No new dependency and no change to the generated API types.
- No change to any token's value; the six guard pairs of summary §5 are registered in the contrast matrices only.

## Decisions

### D1. The own list is fetched on the client through `publicRequest` (explore B7)

`GET /offerings?coffeeshopUlid=…` is public, but its filter value is the session user's `ulid`, which lives only in the browser (in-memory tokens, no auth cookie), so the server cannot build the request. The list state runs in the client panel and calls the operation through `publicRequest` with no credential. This is the second accepted exception to server-loading public endpoints (the first is the search-as-you-type combobox, decisions log "add-filter-controls: resto de puntos"). No visible change, no security or contract change.

Alternative considered: rendering the list on the server with a hard-coded or cookie-stored `ulid` — rejected: the session is browser state by design (`add-auth`) and a cookie would change the auth design.

### D2. The list composition lives in `src/pages/manage-offerings` (explore Q3)

The own list — grid, cards, skeletons, toolbar and pagination — is composed in `src/pages/manage-offerings` together with the state and actions of `src/features/offering-management`; nothing moves out of `src/widgets/offering-list`, whose `OfferingSkeletonCard` is consumed through its public API (`@/widgets/offering-list`). `ManageOfferingsScreen` stays a server component that resolves catalogs and taxonomies and passes them down as props; `ManageOfferingsPanel` is the `"use client"` composition. The create form follows the same split (`NewOfferingScreen` / `NewOfferingForm`).

Alternative: a `widgets/manage-offerings` block — rejected by the answer: the composition belongs to the screens and no other consumer exists.

### D3. Grid beside the sidebar: 1 / 2 from `lg` / 3 from `2xl` (explore Q2)

This change defines its own grid constant next to its composition (one column below `lg` 1024px, two from `lg`, three from `2xl` 1536px, 1.5rem gap, grid items stretching so a row shares its height) — a second constant beside `OFFERING_GRID_CLASSES` of `src/widgets/offering-list` (`grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3`). The narrower columns keep the cards readable beside the 16rem sidebar.

### D4. The chosen item's lot and production date in the field's help (explore Q1, summary Open 23 c)

Before a choice, the inventory field's help shows the typing hint (`inventoryHelp`). Once a row is chosen, the help shows that item's `roastLot` and `productionDate` as labelled API values joined by " · " — `inventoryLotCaption` + `roastLot` and `inventoryProducedCaption` + `productionDate`, the card-caption concatenation pattern — so the user can confirm which roast lot will be offered when two inventory items share one coffee. The two keys are new in the `offering-management` area (es `Lote:` / `Producido el:`, en `Lot:` / `Produced on:`, ca `Lot:` / `Produït el:` — proposals like the rest of §8, summary Open 20). Clearing the input returns the typing hint. The settled result row keeps its two lines unchanged (coffee name; `roastery · country · process`, empty parts skipped).

### D5. One alert region per error surface (explore Q5)

The step-up text and its "Confirm your identity" action never carry a `role` of their own: they render inside the error slot the surface already announces — `ConfirmDialog`'s `error` slot on deletes, the form's error area on creates — which is the surface's single `role="alert"` region. Exactly one alert region exists per surface at a time (the generic error and the step-up never render together: one response produces one of them).

### D6. The gate (explore Q4; decisions log "rutas protegidas sin sesión: mensaje con botón")

`ManagementGate` wraps each screen's content and branches on `useSession()`: `loading` shows the route's loading presentation (skeleton cards on the list, the form panel with its controls unavailable on the create route); `anonymous` renders `signedOutMessage` and a "Sign in" button **in place of the form** on the create route and **in place of the list** on the list route (the page heading still renders on the list route), and the "New offering" link of the list header does not render for an anonymous visitor; `authenticated` with a role other than `coffeeshop` calls `notFound()` (the installed Next.js routing API), so the application's 404 page renders. The "Sign in" button calls `signIn(currentRoute)` synchronously inside the click (popup; the user stays on the route). No automatic redirect.

### D7. Selection, delete flows and the card `actions` slot (explore Q6; summary Open 17 a, Open 18 a)

Selection is a set of offering `ulid`s of the current page only; it clears on a page change and after a successful delete. The card `actions` content is this feature's wrapper (flex row, centred, 0.5rem gap — the summary's §6.2) holding Select then Delete; its `Delete` uses `Button variant="action-2" size="sm" icon={Trash2}`, the treatment settled for Delete in `add-specialist-evaluations`, with `aria-label` starting with its visible label and naming the coffee and the location (WCAG 2.5.3). Both delete flows go through `ConfirmDialog` (`add-evaluation-scales`), binding its full interface — `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `cancelLabel`, `onConfirm`, and the optional `pending` and `error` — with the summary's §8 texts; nothing is sent before confirmation. After a successful delete the status line announces the count (1 or n), the current page refetches, and focus moves to the page heading (`tabIndex={-1}`), because the triggering control may be gone. When the refetched page is empty and not the first, the list moves to the previous page. The bulk request carries at most one page of selections (`meta.per_page`, 15 in the contract example), so it never exceeds the documented 50 (M5).

### D8. One sidebar entry through the `@sidebar` slot (summary Open 1; decisions log "entradas del sidebar de gestión"; review round 1, correction 1; decisions log 2026-10-07 "consenso, barra lateral de gestión y leyenda 1–9")

Both routes contribute one entry, "Manage offerings" (`List` icon), to the shell sidebar through the `@sidebar` parallel-route slot and the `SidebarMenuButton` link form, both owned by `add-sidebar-slot`, which also lands the sidebar's hover-text and focus-ring contrast fixes (`add-filter-controls`' F3, this summary's F2): `nav-text-hover` for the hover text and the `variant-inverse` scope for the ring. The entry addresses the list route `/{locale}/manage/offerings` and carries the current state (`aria-current="page"` and the menu button's active state) on both the list route and the create route; there is no entry for the create route, which stays reachable from the list's "New offering" link and its empty-state link. Its label is the catalog key `sidebarManageOfferings` (D11). The slot route files are app-layer routing and import only from `src/pages/`: `src/pages/manage-offerings` and `src/pages/new-offering` each export their entry block, which renders the feature's `ManagementSidebarEntries`. "Manage locations" is not part of this change: `add-coffeeshop-location` adds its entry beside this one.

### D9. Inventory search through the shared combobox (summary Open 8; Open 21 answered by `add-facet-controls`)

The inventory item is chosen in the generic combobox of `add-facet-controls`, whose search hook sends `GET /coffeeInventory?coffeeName={text}` through `request` after two typed characters and a 300 ms pause, aborting an older request; the consumer supplies the search function and the two-line row content. The combobox sits in `Field` (`required`, `maxLength` 150 per the contract's `coffeeName`) with `Input` variant `default` — the pass-through variant `add-facet-controls` now builds (Open 21). Choosing a row sets `coffeeInventoryId` to the row's `ulid`; clearing the input clears the choice. The popup keeps the header-menu treatment of `add-facet-controls` (summary §6.3). The field's states are the combobox's own (`closed`, `open`, `searching`, `results`, `no matches`, `failure`, `option active`, `selected`, `invalid`) plus `disabled`: while the session resolves (D6) the loading branch renders it disabled together with the locations group.

### D10. Create-form details (summary Open 9 a, Open 10 a, Open 19 a, Open 22 a)

After a 201 the form stays in place with its success status ("Offerings created: {n}") and the "View my offerings" link, and resets the chosen item and the location checkboxes. Exactly one location is preselected when the coffeeshop has exactly one; with no locations the submit action is disabled. The locations group is a `fieldset` + `legend` composed in this feature (`form-fields` has no checkbox group; a second copy goes to `docs/backlog.md` if one appears). An empty location set is not checked in the browser — the contract marks only `coffeeInventoryId` as required (M2) — so the request is sent and the API's rejection shows the generic error (Open 22 a).

### D11. Texts (summary §8; Open 3, Open 20)

The `offering-management` area (`messages/{locale}/offering-management.json`) holds every text of both screens: the summary's §8 keys and strings plus the two keys of D4, in es / en / ca. Review round 1 replaces the two sidebar keys `sidebarMyOfferings` and `sidebarNewOffering` with one key, `sidebarManageOfferings` (es "Administrar ofertas", en "Manage offerings", ca "Gestionar ofertes"), so the area holds 43 keys. The card texts and the pagination labels come from the existing `landing` keys (`card*`, `pagination*`), loaded by the screen and passed as props. Numbers and names are appended to a catalog word by concatenation, as `OfferingCard` composes its captions. The strings are proposals: Product owner confirms or edits them (Open 20).

### D12. Contrast guard pairs (summary §5)

This change registers six token pairs in both contrast matrices of `src/app/styles/theme-tokens.test.ts`: `text-label` / `surface-card`, `text-label` / `surface-form`, `text-secondary` / `surface-form`, `text-link` / `surface-page`, `text-link` / `surface-form`, `text-link-hover` / `surface-form`. Whichever of this change, `add-offering-catalog` and `add-user-account` lands later drops the pairs already registered. The `feedback-error` pairs — with `surface-page`, `surface-card` and `surface-form` — are already registered in the guard and are enforced by `theme-tokens.test.ts` on every run, so their gate holds by the guard and no ratio is quoted for them (summary §5). No token is added or changed.

### D13. The feature slice keeps the business-domain name `offering-management`

`src/features/offering-management` is a noun phrase, not a verb-object name. The `fsd-architecture` naming rules prefer verb-object names for features (`filter-offerings`, `create-evaluation`) while their naming section first allows slice names as the business domain in kebab-case. This slice keeps the business-domain form because it holds every action of one business area — the own list and its selection, the two delete flows and the create flow — rather than one user action, so no single verb-object name covers it without splitting the area into several slices; the name also matches the capability (`offering-management`), the message-catalog area and the commit scope. Recorded here as the settled choice so the build does not rename the slice.

### D14. The shared combobox inside a `Field` (orchestrator decision 2026-10-07, closed for Product owner's review before the archive)

Inside a `Field`, the shared `Combobox` (`src/shared/ui/Combobox.tsx`, filtering capability, from `add-facet-controls`) renders no label and no help of its own, and its input takes the Field's control id, so the Field's label, required marker, help and error are the only ones shown and the Field's label names the input. Outside a `Field` (the facet panels) it is unchanged. Why: a probe render of task 6.2's composition showed the label twice — the Combobox always renders its own visible label and help — and the Field's `<label for>` pointing at no element, because cmdk gives the input its own id; `required`, `aria-invalid` and the help and error ids already reach the input through the Field's context. The decision keeps task 6.2's wording and the summary's §6 single-label layout and changes nothing the user sees; the build chooses the mechanism. This change therefore edits a shared component of the `filtering` capability.

### D15. The create form panel is a section card (review round 2, correction 1; refine-page-surfaces §0.3, §5.3, §9.2)

The create form's panel is the shared `Card variant="section"` of `content-structure` ("Section card"), with no header band: the page header block stays above it on the backdrop and the form lives in the card's body (`CardContent`), whose padding (1rem at the sides and top and 1.25rem at the bottom below 768px, 1.5rem from 768px) equals the old panel's. The card keeps the panel's width — full column below `md`, at most 40rem from `md` — and the form keeps its children in a column 1.5rem apart. The local panel classes (a translation of the MVC `.tz-form-main`: `surface-form` fill, 2px `border-subtle` border, container radius, shadow, padding) are removed, so no local copy of the section card remains. Visible result: fill `surface-card` instead of `surface-form`, a 1px border instead of 2px; radius and shadow are the section card's. The loading branch (D6) renders the same card with its controls unavailable. Contrast: every text pair on `surface-card` the form uses (`text-primary`, `text-label`, `text-secondary`, `text-link`, `text-link-hover`, `feedback-error`) is already registered in both matrices of `theme-tokens.test.ts`; no pair is added (D12 unchanged). The form fields keep their own `surface-form` fill. The build chooses how the card and the form nest, provided the form stays one `form` element holding the fields, the alert, the status and the actions.

## Risks / Trade-offs

- [Contract/API mismatches M1–M6 (summary §12)] → The front follows the contract (`AGENTS.md`). All six are reported to Product owner in the handoff: M1 (`createOfferings` needs `profile:write` in the contract but the API route checks read-or-write), M2 (`locations` not marked required while the API requires a non-empty distinct array), M3 (no 422 documented for the three writes), M4 (no 403 documented for them), M5 (the 50-item maximum only in a description), M6 (`coffeeName` does not state partial matching — search-as-you-type assumes it).
- [The browser calls need the API's CORS for the front origin (decisions log "CORS de la API para el navegador")] → Until the API ships `config/cors.php`, real-browser verification cannot run; the verification task waits for it and the unit and component tests do not.
- [`meta.per_page` is 15 in the contract example and unverified against the API default] → The bulk limit holds for any page size up to 50; above it the selection cap would need revisiting (M5).
- [Four dependencies are unmerged at propose time] → The apply waits for `add-evaluation-scales`, `replace-offering-card-session`, `add-sidebar-slot` and `add-facet-controls` merged into `develop` (tasks.md). The sidebar hover and focus contrast fix (this summary's F2, `add-filter-controls`' F3: `nav-text-hover` and the `variant-inverse` scope) lands with `add-sidebar-slot`; without it the entries' traditional-theme hover text and focus ring fail their gates.
- [The lot help line's copy (D4) is a proposal] → Same status as every §8 string (Open 20): Product owner confirms or edits before the archive.
- [D14 edits the shared `Combobox.tsx`, which `refine-facet-controls` (built, not yet merged) also edits] → Whichever of the two changes merges second merges `develop` first and resolves the overlap there, keeping both changes' behaviour.
- [Two grid constants for offering grids (D3)] → Accepted with Q2; the catalog's grid beside the sidebar stays `add-offering-catalog`'s decision and a later refactor can converge them.

## Migration Plan

None: no data, no dependency change, no contract change and no existing route changes behaviour. Rolling back is reverting the change's commits.

## Open Questions

- Whether the API documents `locations` as required and non-empty (M2, summary Open 22 recommended (b) as an API item): when the contract changes, the client check joins as its own small change. Nothing in the specs, the approach or the tasks depends on it.
