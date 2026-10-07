# Proposal

## Why

A signed-in coffeeshop cannot manage its offerings on the web: no screen lists its own offerings, creates them from its coffee inventory and locations, or deletes them, while the API already exposes every one of those operations (`contracts/openapi.yaml`). The user menu's "Manage offerings" entry already points at the list route (`UserMenu.tsx:115-117`) and lands on nothing. The approved design summary (`docs/design/add-offering-management/design-summary.md`, approved 2026-10-06) settles the two screens and their behaviour, and its remaining open points are answered (decisions log, "add-offering-management: puntos del explore"). This change delivers the management area those answers describe.

## What Changes

- **My offerings** at `/{locale}/manage/offerings`: the coffeeshop's own offerings as offering cards with pagination, selection, deleting one and deleting several. The grid beside the sidebar holds one column below `lg` (1024px), two from `lg` and three from `2xl` (1536px) — a grid constant of this change (explore answer Q2), beside the landing grid.
- **New offering** at `/{locale}/manage/offerings/new`: one offering per chosen location from one coffee-inventory item, chosen in a search-as-you-type list over `GET /coffeeInventory?coffeeName=`. Once an item is chosen, its `roastLot` and `productionDate` show as the field's help (explore answer Q1, summary Open 23 c).
- **Sidebar entry** "Manage offerings" on both routes, addressing the list and marked current on both (review round 1), through the `@sidebar` parallel-route slot and the link form of the sidebar menu button (both built by `add-sidebar-slot`).
- **Access gate** on both routes: a loading presentation, a signed-out message with a "Sign in" button in place of the form (create route) and in place of the list (list route), with the "New offering" link hidden from an anonymous visitor (explore answer Q4); the 404 page for a signed-in user with another role.
- **One alert region per error surface**: the reactive step-up text and its "Confirm your identity" action render inside the existing error slot without a `role` of their own (explore answer Q5) — the confirmation dialog's error slot on deletes, the form's error area on creates.
- **Selection covers the current page only** and clears on a page change and after a delete (explore answer Q6).
- **The own list is fetched on the client through `publicRequest`** (explore answer B7): its filter value is the session `ulid`, which only the browser holds. This is the second accepted exception to server-loading public endpoints.
- New message area `offering-management` (`messages/{locale}/offering-management.json`, es / en / ca); the card texts and the pagination labels reuse the existing `landing` keys.
- `Trash2` and `List` join the shared icon entry point (`src/shared/ui/icons.ts`); no new dependency.

## Capabilities

### New Capabilities

- `offering-management`: the coffeeshop's management area — the own-offerings list with its selection and the deletion of one or several offerings, and the creation of offerings from one coffee-inventory item across the coffeeshop's locations, with the area's access gate and sidebar entry.

### Modified Capabilities

None. The shared pieces this change consumes arrive with their own changes and their own deltas: the offering card's `actions` slot (`replace-offering-card-session`, capability `landing`), the search-as-you-type combobox with its input variant pass-through (`add-facet-controls`, capability `filtering`), the `@sidebar` slot and the sidebar menu button's link form with its hover and focus fixes (`add-sidebar-slot`, capability `app-shell`), and the confirmation dialog (`add-evaluation-scales`, capability `feedback`).

## Out of Scope

- Editing an offering: the contract exposes no update operation.
- Managing locations or inventory: both are read-only here.
- Filter controls on the own-offerings list: the offering filters belong to `add-offering-facets` on the public catalog list; the own list has none.
- The public catalog and the offering detail page (`add-offering-catalog`).
- The step-up mechanism itself (`add-auth`).
- `listCoffees` and `listRoasteries`: not consumed here since the single inventory combobox replaced the roaster and coffee selects and the inventory radio group (summary Open 8).
- A shared grid for every offering grid beside the sidebar: this change uses its own constant (explore answer Q2); the catalog's grid beside the sidebar stays `add-offering-catalog`'s decision.
- Client-side validation of an empty location set: the contract does not mark `locations` as required, so the API answers and the generic error shows (summary Open 22, option a).

## Impact

- Code (created): the route files `app/[locale]/manage/offerings/page.tsx`, `app/[locale]/manage/offerings/new/page.tsx` and the two matching `@sidebar` slot pages under `app/[locale]/@sidebar/manage/offerings/`; the screens `src/pages/manage-offerings/` and `src/pages/new-offering/`; the client pieces `src/features/offering-management/`; the catalogs `messages/es/offering-management.json`, `messages/en/offering-management.json`, `messages/ca/offering-management.json`. Code (modified): `src/shared/ui/icons.ts` (three icons) and `src/shared/api/index.ts` (derived type aliases). No generated type is edited or redefined.
- API: consumes `listOfferings` (own list, filtered by `coffeeshopUlid`), `deleteAnOffering`, `deleteMultipleOfferings`, `listMyLocations`, `listCoffeeInventory`, `createOfferings` and `listOlfactoryTaxonomies`. No contract change; the six contract/API mismatches recorded in design.md are reported to Product owner and the front follows the contract.
- Dependencies: the apply waits for `add-evaluation-scales`, `replace-offering-card-session`, `add-sidebar-slot` and `add-facet-controls` merged into `develop` (tasks.md states it). None of them blocks this propose. No dependency is added to `package.json`.
- Browser calls need the API's CORS for the front origin (decisions log, "CORS de la API para el navegador"); until the API ships it, real-browser verification cannot run.
