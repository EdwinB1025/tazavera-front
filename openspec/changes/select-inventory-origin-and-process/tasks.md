No derived API types are needed beyond `InventoryFacetOptions` (design.md D2): the change reads no new API field (`ApiResult` and `CoffeeSummary` already exist in `@/shared/api`).

## 1. `asOptions` in `shared/ui` (design.md D1)

- [ ] 1.1 Move `asOptions` from `src/features/offering-facets/ui/OfferingFacetParts.tsx` to `src/shared/ui/FacetRadioList.tsx`, right after `FacetOption`, same name and body; export it from `src/shared/ui/index.ts` next to `FacetRadioList`; `OfferingFacetParts.tsx` and `OfferingFacets.tsx` import it from `@/shared/ui`. Verify: `npx vitest related` on every changed file passes with no assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Inventory options and texts (design.md D2, D5)

- [ ] 2.1 Add `src/features/inventory-facets/model/options.ts` with `InventoryFacetOptions` and `inventoryFacetOptions(coffees)` as design.md D2 states (`distinctCoffeeValues` from `@/shared/api`; every value `null` on a failed read); export both from `src/features/inventory-facets/index.ts`. `InventoryFilterTexts` gains `any`, `seeMore`, `seeLess` and `optionsUnavailable` from the `filters` catalog. Change `facetCity` in `messages/es/offering-management.json` to "Ciudad del tostador", in `messages/en/offering-management.json` to "Roastery city" and in `messages/ca/offering-management.json` to "Ciutat del torrador"; no other catalog change. Verify: `npx vitest related` on every changed file passes (a failure only on the label "City" of the inventory facets is expected here and fixed in 3.1, nowhere else); `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Inventory list facets and composition (spec "Inventory facets in the sidebar"; design.md D3, D4)

- [ ] 3.1 Add `src/features/inventory-facets/ui/InventoryFacetParts.tsx` with `InventoryListFacet` and `InventoryOriginFacets` (D3); `InventoryFacets.tsx` takes the required prop `options: InventoryFacetOptions` and renders Coffee name, `InventoryOriginFacets`, then Producer and City as `FacetTextField`. `ManageInventorySidebarScreen.tsx` becomes async and, only with `searchParams`, passes `inventoryFacetOptions(await fetchCoffees())` (D4). Client files import only types from `@/shared/api` and `../model/options`. Update existing tests, only as approved by the orchestrator:
  - `src/features/inventory-facets/ui/InventoryFacets.test.tsx`: add the options fixture `{ countries: ["Colombia", "Ethiopia"], regions: ["Huila", "Nariño", "Yirgacheffe"], regionsByCountry: { Colombia: ["Huila", "Nariño"], Ethiopia: ["Yirgacheffe"] }, processes: ["natural", "washed"] }` and pass it in `renderPanel`; in "Facets in order" the title's "six text facets" becomes "six facets", `getByRole("textbox", { name: "Country" | "Region" | "Process" })` becomes `getByRole("radiogroup", { name: … })`, `{ name: "City" }` becomes `{ name: "Roastery city" }`, `getAllByRole("textbox")).toHaveLength(5)` becomes `toHaveLength(2)`.
  - `src/pages/manage-inventory/ui/InventoryResults.test.tsx`: `page()` passes the same fixture; in "Commit a text facet: …" (title kept, see proposal.md Propose status) the typing lines become a click on `within(screen.getByRole("radiogroup", { name: "Region" })).getByRole("radio", { name: "Huila" })`, both URL assertions unchanged; `{ name: "City" }` becomes `{ name: "Roastery city" }`.
  - `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.test.tsx`: tests become `async` and render `{await ManageInventorySidebarScreen({ … })}` inside the same providers (precedent `src/pages/evaluation-form/ui/NewEvaluationScreen.test.tsx`); the list test's file adds a `vi.mock` of `fetchCoffees` returning `{ ok: true, data: [] }`; every assertion unchanged.
  Verify: `npx vitest related` on every changed file passes; `npx tsc --noEmit` and `npm run lint` report no errors; every unit within 80 lines, every file within 300.

## 4. New scenarios (spec "Inventory facets in the sidebar")

- [ ] 4.1 Five new tests in `src/features/inventory-facets/ui/InventoryFacets.test.tsx`, English only, with the fixture of 3.1 unless stated, each asserting `nav.push` (URL and `{ scroll: false }`) or the observable attribute with the fewest assertions:
  - "Choosing a country": with `process=washed`, clicking "Colombia" in the radiogroup "Country" pushes a URL with `process=washed` and `originCountry=Colombia`.
  - "Regions narrowed by the country": with `originCountry=Colombia&originRegion=Huila`, the radiogroup "Region" has the radios "Any", "Huila", "Nariño" only; clicking "Ethiopia" in "Country" pushes `/en/manage/inventory?originCountry=Ethiopia`.
  - "Choosing a process": with `originCountry=Colombia`, clicking "washed" in "Process" pushes a URL with `originCountry=Colombia` and `process=washed`.
  - "Roastery city label": typing "Barcelona" in the textbox "Roastery city" and pressing Enter pushes `/en/manage/inventory?city=Barcelona`.
  - "Coffee catalog fails": with every option `null`, the radios of "Country", "Region" and "Process" are disabled and "Options unavailable" shows; typing "Barcelona" in "Roastery city" and pressing Enter still pushes `city=Barcelona`.
  Verify: `npx vitest related src/features/inventory-facets/ui/InventoryFacets.tsx --run` passes; `npm run lint` reports no errors.

## 5. Full checks

- [ ] 5.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, the validation suite with five more tests than before, lint with 0 errors. Any failure is fixed in its own `fix(filtering): …` commit, never by changing an assertion or a QA test; a failing QA test is reported.

## Workflow follow-up

- Verify, then archive the change and remove the R89 section and its priority row from `docs/design/backlog.md`.
