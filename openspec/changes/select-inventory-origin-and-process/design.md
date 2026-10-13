# Design

## Context

See proposal.md (Why). Today `src/features/inventory-facets/ui/InventoryFacets.tsx` renders Coffee name as `PaddedCombobox` (R88) and the five other keys of `INVENTORY_LIMITS` as `FacetTextField`. The offering facets already list the coffee catalog's values: `fetchCoffees()` and `distinctCoffeeValues(coffees, field)` in `src/shared/api/coffees.ts` (exported from `@/shared/api`), composed by `offeringFacetOptions` in `src/features/offering-facets/model/options.ts`, each list `null` when the read failed; `OfferingListFacet` in `src/features/offering-facets/ui/OfferingFacetParts.tsx` renders `FacetRadioList` from `@/shared/ui` with `asOptions(list)`, `help` "Options unavailable" and `disabled` when the list is `null`. The inventory sidebar screen `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.tsx` is synchronous and renders the facets only when it receives `searchParams` (the list, not the detail); `src/pages/evaluations-list/ui/EvaluationsSidebarScreen.tsx` is the precedent of an async sidebar screen reading the coffee catalog. A feature may not import another feature.

## Goals / Non-Goals

**Goals:**
- Country, Region and Process of the inventory panel as single-choice facets over the coffee catalog, with the same derivation (`distinctCoffeeValues`) and control (`FacetRadioList`) as the offering list facets; Region narrowed by the chosen country.
- City relabelled as the roastery's city.

**Non-Goals:**
- Moving `fetchCoffees`, `distinctCoffeeValues`, `FacetRadioList` or any offering facet part other than `asOptions`.
- Any change to the offering facets' behaviour, to `FacetRadioList`'s markup, or to the inventory URL parsing and applied chips.

## API consumed

| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/coffees` | none (server read through `publicRequest`, `REFERENCE_READ_INIT`, via `fetchCoffees()`) | none | `{ data: CoffeeSummary[] }`; the facets read `country`, `region` and `process` | any non-OK status or transport failure gives `{ ok: false }`; Country, Region and Process render disabled with "Options unavailable" (filters `optionsUnavailable`), the other facets keep working |

Same read as the offering and evaluation facets; no new endpoint or field. Types: `ApiResult` and `CoffeeSummary` from `@/shared/api`. The inventory read (`GET /coffeeInventory`) is unchanged.

## Decisions

### D1 — `asOptions` moves to `shared/ui`

`asOptions(values: string[] | null): FacetOption[]` moves unchanged from `OfferingFacetParts.tsx` to `src/shared/ui/FacetRadioList.tsx`, right after the `FacetOption` type, and `src/shared/ui/index.ts` exports it next to `FacetRadioList`. `OfferingFacetParts.tsx` and `OfferingFacets.tsx` import it from `@/shared/ui`. No test imports it.

### D2 — Inventory option model

New `src/features/inventory-facets/model/options.ts`, exported from the slice index (function and type):

```ts
/** `null` = the coffee catalog could not be read. */
export type InventoryFacetOptions = {
  countries: string[] | null;
  regions: string[] | null;
  regionsByCountry: Record<string, string[]> | null;
  processes: string[] | null;
};

export function inventoryFacetOptions(coffees: ApiResult<CoffeeSummary[]>): InventoryFacetOptions;
```

On success: `countries`, `regions` and `processes` are `distinctCoffeeValues` of `country`, `region` and `process`; `regionsByCountry` maps each listed country to `distinctCoffeeValues` of `region` over the coffees of that country. On failure all four are `null`. The function runs only on the server (D4); the client panel imports only the type.

### D3 — Inventory list facets and the Country → Region rule

New `src/features/inventory-facets/ui/InventoryFacetParts.tsx` ("use client") holds:

- `InventoryListFacet`: the slice's own small wrapper of `FacetRadioList` (legend, `options={asOptions(list)}`, `value`, `onChange` with `undefined` meaning "Any", `anyLabel={texts.any}`, `texts={{ seeMore, seeLess }}`, `help={list === null ? texts.optionsUnavailable : undefined}`, `disabled={list === null}`), the same rule as `OfferingListFacet`, without importing `offering-facets`.
- `InventoryOriginFacets`: Country (`options.countries`, writing `originCountry`), Region and Process (`options.processes`, writing `process`), in that order.
  - Region's list: `null` when `options.regions` is `null`; with `values.originCountry` set, `options.regionsByCountry[country] ?? []`; otherwise `options.regions`. It writes `originRegion`.
  - Choosing a country navigates `{ originCountry: country }` plus `originRegion: undefined` when a region is applied and is not in `regionsByCountry[country]`; choosing "Any" in Country navigates only `{ originCountry: undefined }`, keeping the region.

`InventoryFacets.tsx` gains a required prop `options: InventoryFacetOptions` and renders, in order: the Coffee name combobox (unchanged), `InventoryOriginFacets`, then `FacetTextField` for `producer` and `city` (limits from `INVENTORY_LIMITS`, unchanged commit behaviour). The applied chips, the chip removal and "Clear all" are unchanged.

### D4 — Async sidebar composition

`ManageInventorySidebarScreen` becomes `async` (returns `Promise<ReactNode>`), a thin composition like `EvaluationsSidebarScreen`: only when `searchParams` is present it awaits `fetchCoffees()` and passes `inventoryFacetOptions(result)` to `InventoryFacets` as `options`; the detail (no `searchParams`) sends no coffee read. Both route pages (`app/[locale]/@sidebar/manage/inventory/page.tsx` and `[ulid]/page.tsx`) are already async server components and render it as a JSX element, so they do not change.

### D5 — Texts

No new catalog key. `InventoryFilterTexts` gains `any`, `seeMore`, `seeLess` and `optionsUnavailable`, read by `inventoryFacetsTexts` from the `filters` catalog. The City label stays the key `offering-management.facetCity`; its values change to "Ciudad del tostador" (es), "Roastery city" (en) and "Ciutat del torrador" (ca), and the `city` chip follows. No other catalog value changes (only the inventory panel reads `facetCity`).

## Files

| File | Layer | Change |
|---|---|---|
| `src/shared/ui/FacetRadioList.tsx` | shared | `asOptions` added (D1) |
| `src/shared/ui/index.ts` | shared | `asOptions` export (D1) |
| `src/features/offering-facets/ui/OfferingFacetParts.tsx` | features | `asOptions` removed, imported from `@/shared/ui` (D1) |
| `src/features/offering-facets/ui/OfferingFacets.tsx` | features | import path (D1) |
| `src/features/inventory-facets/model/options.ts` | features | new (D2) |
| `src/features/inventory-facets/index.ts` | features | exports `inventoryFacetOptions`, `InventoryFacetOptions` (D2) |
| `src/features/inventory-facets/ui/InventoryFacetParts.tsx` | features | new (D3) |
| `src/features/inventory-facets/ui/InventoryFacets.tsx` | features | `options` prop, list facets (D3) |
| `src/features/inventory-facets/model/texts.ts` | features | four texts (D5) |
| `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.tsx` | pages | async, coffee read (D4) |
| `messages/{es,en,ca}/offering-management.json` | — | `facetCity` values (D5) |

## Risks / Trade-offs

- [The client panel pulling runtime code from `@/shared/api`; `InventoryResults.test.tsx` mocks that module with only `publicRequest` and `request`] → the panel and its parts import only types from `@/shared/api` and `../model/options`; the derivation runs only in the server screen, and tests pass options as literal objects.
- [A region in the address that does not belong to the chosen country (typed URL)] → Region shows no radio checked and the chip still shows it; the read carries it as before. Not a new state: the spec only governs the choice of a new country.
- [The sidebar screen awaits a network read on the list] → the read is cached (`REFERENCE_READ_INIT`), as for the offering and evaluation sidebars.
