# Proposal

## Why

The "Top rated" header entry and every offering card's View link already address `/{locale}/offerings` and `/{locale}/offerings/{ulid}`, but no route serves them: both return 404 today. Visitors can see verified offerings on the entry page and cannot browse the full catalog, follow a filter query, or inspect one offering's data and consensus. This change supplies the two public screens behind those links and consumes `listOfferings` and `getAnOffering`, the two catalog reads of the contract.

## What Changes

- **Offering catalog** at `/{locale}/offerings` (public): every offering the API returns for the URL's query, as offering cards in a grid, with Previous/Next pagination and the loading, empty and error states. The URL query is the only state: only the parameter names the contract declares for `listOfferings`, plus `page`, are forwarded; every other key is dropped. Pagination replaces only `page` and keeps the rest of the query. A body toolbar slot sits between the heading and the results and renders nothing in this change; `add-offering-facets` fills it later. The grid lays out its columns by the width available to the results region, so a sidebar column added later narrows the columns instead of squeezing the cards.
- **Offering detail** at `/{locale}/offerings/{ulid}` (public): one offering from `GET /offerings/{offering_ulid}` — a back link, a header (verification badge, coffee name, coffeeshop and roaster captions, and an Evaluate link for a signed-in specialist), and two tabs whose active one is kept in the URL (`?tab=`):
  - **Inventory data**: roast lot, production date, the coffee's fields (country, region, producer, variety, process, altitude, lot, roast level) and the roastery and the location by name only, as label/value rows; a null value omits its row.
  - **Consensus**: the offering's `cuppingAvg` with the rating tier word, shown only when the offering is verified; the eight SCA attribute averages on the read-only bean scale of `add-evaluation-scales`, each with its value as text; the evaluation and defective counts; the two concordances with their named scale (below 0.50 Low, 0.50–0.75 Moderate, 0.75–0.90 High, 0.90 and above Excellent) and the value also as text; Defects and Main tastes through the evaluation's selector components in read-only mode, each card with its consensus legend beside it; and the `sensoryTaxonomy` and `cataConcordance` trees rendered by the `FlavorWheel` component of `add-flavor-wheel`, with per-segment `n/total` legends and a hover/focus description.
- **Shared content containers** (`content-structure`): the label/value row and the tabs join `src/shared/ui`; the detail renders through them.
- **Generalized offerings fetch**: the widget's offerings fetch takes a query. Landing calls it with `verified=1` and keeps its behaviour and its tests; the catalog calls it with the URL's query without forcing `verified`.
- **Single-offering fetch** in `src/entities/offering/api`, so later changes (`add-public-evaluations`, `add-specialist-evaluations`) reuse it instead of copying it.
- **Retry action moved** from the `offering-list` widget to `src/shared/ui`, so the new detail widget can use it (same behaviour: reload through `router.refresh()`).
- **Texts**: a new `catalog` message area (es / en / ca) for these two screens' own texts; card, pagination and retry labels keep coming from the `landing` area; the bean value texts join the shared `scales` area if no earlier consumer has added them.

## Capabilities

### New Capabilities

- `offering-catalog`: the public offerings listing driven by the URL query and the public offering detail page with its Inventory data and Consensus tabs. Its spec covers both screens' observable behaviour, their states and the data each shows.

### Modified Capabilities

- `content-structure`: adds two containers to its set — the label/value row (a term paired with its value in one row) and the tabs (one tab list with one panel visible at a time). No existing requirement changes.

## Out of Scope (Non-Goals)

- **Filter and sort controls** (`add-offering-facets` and `add-evaluation-facets`): the body toolbar slot renders empty here; the facets live in the sidebar those changes bring.
- **The list of an offering's evaluations**: no contract operation filters evaluations by offering.
- **The provisional-evaluation tab** (a later change of this capability): it needs the API to expose that evaluation.
- **Creating and deleting offerings** (`add-offering-management`).
- **`GET /coffees` and `GET /roasteries`**: consumed by `add-offering-management` and the offering-list filters (decisions log, 2026-10-06).
- **Any change to `contracts/openapi.yaml`, `src/shared/api/schema.ts`, the header's "Top rated" entry or the offering card.**

## Impact

- **Code (created):** routes `app/[locale]/offerings/page.tsx` and `app/[locale]/offerings/[ulid]/page.tsx` (layer `app`); screens `src/pages/offerings/` and `src/pages/offering-detail/` (layer `pages`); widget `src/widgets/offering-detail/` (layer `widgets`); `src/entities/offering/api/` (layer `entities`); `src/shared/ui/LabelValueRow.tsx`, `src/shared/ui/Tabs.tsx` and `src/shared/ui/RetryButton.tsx` with tests beside every file (layer `shared`); message catalogs `messages/{es,en,ca}/catalog.json` and, if absent, `messages/{es,en,ca}/scales.json`.
- **Code (modified):** `src/widgets/offering-list/` (the fetch takes a query; the list takes the pagination path, query and grid classes), `src/shared/ui/index.ts` (new exports), `src/app/styles/theme-tokens.test.ts` (the new guarded pairs).
- **Dependencies:** none added, removed or upgraded. The tabs build on `@radix-ui/react-tabs` (1.1.21), already inside the installed `radix-ui` package.
- **API:** consumes `listOfferings` (`GET /offerings`), `getAnOffering` (`GET /offerings/{offering_ulid}`) and `listOlfactoryTaxonomies` (`GET /taxonomies`); all public, fetched on the server with plain `fetch`. Every displayed value maps to a contract field (`cuppingAvg`, `evaluationCount`, `defectiveEvaluationCount`, `verificationStatus`, `concordanceAffective`, `concordanceDescriptive`, the eight `*AffectiveAvg`, `location.name`, `coffeeInventory.roastLot`, `coffeeInventory.productionDate`, `coffeeInventory.coffee.*`, `coffeeInventory.roastery.name`, `sensoryTaxonomy[]` and `cataConcordance[]` with `ref`, `level`, `count`, `children`, and `meta.current_page` / `meta.last_page`). `src/shared/api/schema.ts` is never edited: derived types are added to `src/shared/api/index.ts`.
- **Existing behavior:** landing keeps its verified-only list and its tests; the offering card is reused unchanged (its action slot is filled by `replace-offering-card-session`); `PageSection`, `Pagination`, `Card`, `Badge`, `Link`, `Button` and `entities/taxonomy` are reused unchanged.
- **Apply dependencies (merged into `develop` first, then `develop` into this branch):** `add-evaluation-scales` (read-only bean scale and descriptor chip group), `replace-offering-card-session` (card action slot), `add-flavor-wheel` (`FlavorWheel`). `add-offering-facets` fills the body toolbar slot later and is not needed to apply.
