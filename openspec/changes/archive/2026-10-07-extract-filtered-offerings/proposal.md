# Proposal

## Why

The catalog's filtered offerings — the filter toolbar, the query-driven results with their loading, empty, filtered-empty and error states, and the sidebar facets — are composed in the page slices `src/pages/offerings` and `src/pages/offerings-sidebar`. `add-coffeeshop-directory`'s "Ofertas" tab needs the same composition scoped to one coffee shop, and a page slice cannot import another page slice, so it would copy it (backlog R12). This change moves the composition into the `offering-list` widget, with an optional fixed query that a host forces on the request, so the directory reuses it. Nothing the user sees or hears changes on `/{locale}/offerings`.

## What Changes

- `src/widgets/offering-list` gains three server compositions, exported from its `index.ts` with their prop types (design.md D2–D5):
  - `FilteredOfferingsToolbar` — the taxonomy read and applied-value count of today's `OfferingsToolbarScreen`, rendering `OfferingsToolbar`.
  - `FilteredOfferingsResults` — today's results body of `OfferingsScreen` (sanitized query, `Suspense` with the three skeleton cards, `Offerings` in the catalog column, the filtered empty message and "Clear all"), plus an optional `fixedQuery` whose keys override the same keys of the address after sanitizing.
  - `FilteredOfferingsFacets` — the coffees and taxonomy reads and option building of today's `OfferingsSidebarScreen`, rendering `OfferingFacets`.
- The page slices become thin callers that load the texts and frame the compositions: `OfferingsScreen` keeps the heading block and both page sections; `OfferingsToolbarScreen` renders `FilteredOfferingsToolbar`; `OfferingsSidebarScreen` renders `AppSidebar` with `FilteredOfferingsFacets` inside. `OfferingsSidebar` is removed (its frame is now the screen's).
- The results cases of `OfferingsScreen.test.tsx` move to the widget, restated against its props; new cases cover `fixedQuery`. The sidebar test retargets `OfferingsSidebarScreen` (design.md D7).
- `offering-catalog` gains one ADDED requirement, "Filtered offerings scoped by a host".

## Out of scope (non-goals)

- The heading block (`listEyebrow`, `h1`), both `PageSection`s and the `AppSidebar` frame stay in the page layer.
- No consumer of `fixedQuery` in this change: the directory's "Ofertas" tab, its sidebar and its route are `add-coffeeshop-directory`'s.
- The shared "Clear all" button (backlog R9, `extract-clear-filters-button`): this change moves the existing wiring as it stands (design.md D6).
- No change to classes, spacing, texts, query handling, pagination addresses, states, route files, tokens, contract operations or dependencies.
- No new widget slice: a `src/widgets/filtered-offerings` slice would import two other widgets (design-summary §2).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: one ADDED requirement, "Filtered offerings scoped by a host" — a fixed query key overrides the same key of the address and is never removed by the facets, "Clear all" or paging; with no fixed key the request is the catalog's. No existing requirement is modified.

## Impact

- **Code** (FSD layers): `src/widgets/offering-list/ui/FilteredOfferings{Toolbar,Results,Facets}.tsx` (new) and `index.ts` (exports appended); `src/pages/offerings/ui/{OfferingsScreen,OfferingsToolbarScreen}.tsx`; `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.tsx` and `index.ts`; `src/pages/offerings-sidebar/ui/OfferingsSidebar.tsx` removed. Route files under `app/` unchanged.
- **Tests**: `src/widgets/offering-list/ui/FilteredOfferingsResults.test.tsx` (new, moved and new cases); `src/pages/offerings/ui/OfferingsScreen.test.tsx` (page cases kept, results cases moved); `src/pages/offerings-sidebar/ui/OfferingsSidebar.test.tsx` replaced by `OfferingsSidebarScreen.test.tsx`. No case is removed without moving or weakened.
- **Dependencies, contract, texts, tokens**: none added or changed. `GET /offerings`, `GET /coffees` and `GET /taxonomies` are consumed exactly as today; `coffeeshopUlid` is already a `listOfferings` parameter.
- **Backlog**: resolves R12.
- **Consumers unblocked**: `add-coffeeshop-directory` (apply).
