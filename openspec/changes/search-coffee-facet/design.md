# Design

## Context

Backlog R46 (production AUT finding 14) and Product owner's decision of 2026-10-08: the offerings Coffee facet works like the Roastery facet. Today `OfferingFacets.tsx` renders Coffee as a `FacetTextField type="search"` and Roastery as the shared `Combobox` in search mode with `searchRoasteries` (`api/search-roasteries.ts`). The shared `Combobox` and its hook `useComboboxSearch` (`src/shared/ui`) already hold the whole search-as-you-type behaviour: 2 characters, 300 ms, the older request aborted, the state rows and the polite status. The result row layout (name on line 1, `detail` on line 2) is the add-filter-controls design summary's Open 16.

## Goals / Non-Goals

**Goals:** the Coffee facet uses the same combobox and mechanism as Roastery, over `GET /coffees?name=`, with the Open 16 coffee row.

**Non-Goals:** no change to the shared combobox, its hook or texts, the Roastery behaviour, the chips, "Clear all", the URL rules, the API or the contract.

## API

| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/coffees?name={term}` (`listCoffees`) | none (public) | `name`: the trimmed typed text, partial match, at most 150 characters (the combobox's `maxLength`) | 200 `{ data: CoffeeSummary[] }`; the row reads `name`, `country`, `region`, `process`, `variety` | any non-2xx or transport failure throws; the combobox shows its "Results could not be loaded" row. An abort is ignored by the hook. |

`GET /roasteries?name=` is unchanged. Types: `CoffeeSummary` and `RoasterySummary` from `@/shared/api` (generated); `ComboboxOption` and `ComboboxSearch` from `@/shared/ui`. No new type.

## Decisions

### D1. One request helper for the two name searches

New `src/features/offering-facets/api/search-by-name.ts` (features layer, `offering-facets` slice, `api` segment) exports `searchByName<T>(path, toOptions)`, which returns a `ComboboxSearch`: it calls `publicRequest(`${path}?name=${encodeURIComponent(term)}`, { signal })`, throws on a non-2xx status, reads `payload.data ?? []` and returns `toOptions(rows)`. `search-roasteries.ts` becomes `searchByName<RoasterySummary>("/roasteries", …)` with its current row mapping, so the roastery request (URL, `{ signal }`, no credential header) and its options are unchanged; its existing tests protect it. Alternative rejected: a copy of the roastery function for coffees, which would duplicate the request, status and parsing lines.

### D2. Coffee search read

New `src/features/offering-facets/api/search-coffees.ts` exports `searchCoffees = searchByName<CoffeeSummary>("/coffees", …)`. Each coffee maps to `{ value: name, label: name, detail }` where `detail` is `[country, region, process, variety]` without null or empty parts, joined with " · " (Open 16); when no part is left, the option has no `detail`, so the combobox omits line 2. A missing `name` reads as `""`, as in the roastery mapping. The " · " join already exists in `offering-management/ui/InventoryField.tsx`, but a feature cannot import another feature; it is a one-line expression, so it is written in place.

### D3. Same-name coffees

The combobox keys and selects rows by `value`, and `coffeeName` carries only the name, so two coffees with the same name would give two rows with the same key that write the same value. `searchCoffees` keeps the first coffee of each name, in the API's order, with that coffee's origin line. Open for Product owner's confirmation (proposal.md, Propose status); it does not block the build.

### D4. Facet wiring and texts

In `src/features/offering-facets/ui/OfferingFacets.tsx`, row 1 becomes the same block as Roastery: `<div className="px-3"><Combobox label={texts.coffeeName} variant="inverse" search={searchCoffees} value={asComboboxValue(values.coffeeName)} onChange={(option) => navigate({ coffeeName: option?.value })} texts={comboboxTexts} maxLength={150} placeholder={texts.coffeeNamePlaceholder} /></div>`. Clearing gives `option` `null`, so `coffeeName` is `undefined` and `navigate` removes the key, as for Roastery. The label ("Coffee" / "Café" / "Cafè"), the placeholder ("Search coffee" / "Buscar café" / "Cerca un cafè") and the state rows (`searching`, `noOptionMatches`, `searchFailed`, `optionCount`) already exist in es, en and ca and are the ones Roastery uses; no catalog key is added. The placeholder is kept from the current field (Roastery has none); open for Product owner's confirmation. `FacetTextField` stays imported for City. Semantic tokens, the focus ring and the icons come from the shared combobox unchanged; no class, token or icon is added.

## Risks / Trade-offs

- A QA test asserting the old Coffee `searchbox` would fail; none was found (`qa/src/features/offering-facets/ui/OfferingFacets.test.tsx` does not query Coffee). If one fails, the build reports it and does not edit it.
- `GET /coffees?name=` is now also called from the browser, like `/roasteries` (Open 16's accepted exception for public endpoints). The server-cached `fetchCoffees` for the facet options is unchanged.
