# Design

## Context

R24 routed every public read through `publicRequest` and R25 moved the account writes into `features/user-account/api`. The request functions of the `api` segments now live where they should, but report their outcome in seven shapes (inventory in D2): a `{ status: "found" | "not-found" | "failed" }` union, a rejection, an `{ ok, status }` pair, a raw `Response`, string outcomes, an `{ outcome }` or `{ kind }` union, and UI states (`{ state: "success" | "empty" | "error" }`, `ListState`) built inside the api segment.

## Goals / Non-Goals

**Goals:**
- One result type for every request function of an `api` segment, declared once in `src/shared/api`.
- Every outcome a consumer tells apart today kept: success, not-found, the `403` step-up or refusal, the `409` conflict, and the generic error.
- Identical requests and identical UI states for every status, transport failure and unreadable body.

**Non-Goals:**
- The request client, the token exchange and refresh, and the authorize flow (D6).
- New outcomes (R8's per-field `422`), new texts, the facets' `name[]` parameters and the contact and location creation leaving step-up (both land later on `develop`).

## Decisions

### D1. The result type

`src/shared/api/result.ts`, exported as types from `src/shared/api/index.ts`:

```ts
/** The failures a consumer tells apart besides the generic error. */
export type ApiFailureKind = "not-found" | "forbidden" | "conflict";

/**
 * What every request function of an `api` segment resolves to; it never
 * rejects. `K` names the failures the function reports besides `"error"`.
 */
export type ApiResult<T, K extends ApiFailureKind = never> =
  | { ok: true; data: T }
  | { ok: false; kind: K | "error" };
```

Rules every function follows:

- It never rejects: a transport failure, and a body that cannot be read where one is read today, is `{ ok: false, kind: "error" }`.
- It keeps its own success test (`response.ok`, `=== 200` or `=== 201`, exactly as today) and its own parsing and defaults (`?? []`, `?? {}`).
- `"forbidden"` is a `403`, `"conflict"` a `409`, `"not-found"` a `404` or, where today, a `200` without `data`. A function reports only the kinds its consumers tell apart today; every other status is `"error"`.
- A write with no data to return resolves `{ ok: true, data: null }` (`ApiResult<null, …>`).
- UI states (`loading`, `empty`, `ready`, `step-up`, `created`…) are built by the consumer in its `model` or `ui` segment, never in `api`.

The type is type-only: no runtime helper is added. Each module already holds its `try`/`catch` and status checks, and a type-only import keeps every existing `vi.mock("@/shared/api", …)` factory valid.

### D2. Inventory (before → after)

| Capability | File | Function | Before | After | Consumers |
|---|---|---|---|---|---|
| offering-catalog | `shared/api/coffees.ts` | `fetchCoffees` | `CoffeeSummary[]`, rejects on non-2xx or transport | `ApiResult<CoffeeSummary[]>` | `widgets/offering-list/ui/FilteredOfferingsFacets.tsx` (with `features/offering-facets/model/options.ts`), `pages/public-evaluations/ui/EvaluationsSidebar.tsx`, `pages/evaluations-list/ui/EvaluationsSidebarScreen.tsx` |
| offering-catalog | `entities/taxonomy/api/taxonomies.ts` | `fetchTaxonomies` | `TaxonomiesPayload`, rejects | `ApiResult<TaxonomiesPayload>` | `widgets/offering-list/ui/Offerings.tsx`, `FilteredOfferingsToolbar.tsx`, `FilteredOfferingsFacets.tsx` (with `options.ts`), `widgets/offering-detail/ui/OfferingDetail.tsx`, `widgets/evaluation-sheet/ui/EvaluationSheetView.tsx`, `EvaluationSheetBaseline.tsx`, `pages/evaluation-form/ui/EvaluationScreen.tsx`, `NewEvaluationScreen.tsx`, `pages/manage-offerings/ui/ManageOfferingsScreen.tsx` |
| offering-catalog | `entities/offering/api/offering.ts` | `fetchOffering` | `{ status: "found"; offering } \| { status: "not-found" } \| { status: "failed" }` | `ApiResult<OfferingDetail, "not-found">` | `OfferingDetail.tsx`, `NewEvaluationScreen.tsx`, `pages/evaluation-form/ui/EvaluationDetail.tsx`, `EvaluationSheetView.tsx`, `EvaluationsSidebar.tsx`, and through `entities/evaluation/lib/offerings.ts` (`OfferingReader`) `pages/evaluations-list/ui/EvaluationsList.tsx` and `widgets/public-evaluation-list/ui/PublicEvaluationList.tsx` |
| offering-catalog | `entities/coffeeshop/api/coffeeshop.ts` | `fetchCoffeeshop` | `{ status: "found"; coffeeshop } \| { status: "not-found" } \| { status: "failed" }` | `ApiResult<CoffeeshopDetail, "not-found">` | `widgets/coffeeshop-detail/ui/CoffeeshopDetail.tsx` |
| offering-catalog | `widgets/coffeeshop-list/api/coffeeshops.ts` | `fetchCoffeeshops` | `CoffeeshopsPayload`, rejects | `ApiResult<CoffeeshopsPayload>` | `widgets/coffeeshop-list/ui/Coffeeshops.tsx` |
| offering-catalog | `widgets/offering-list/api/offerings.ts` | `fetchOfferings`, `fetchVerifiedOfferings` | `OfferingsPayload`, rejects | `ApiResult<OfferingsPayload>` | `Offerings.tsx` (`fetchVerifiedOfferings`: its tests only) |
| offering-catalog | `entities/evaluation/api/public-evaluations.ts` | `fetchEvaluations`, `fetchEvaluation` | `EvaluationPage`, `EvaluationItem`, reject | `ApiResult<EvaluationPage>`, `ApiResult<EvaluationItem>` | `PublicEvaluationList.tsx`, `EvaluationSheetBaseline.tsx`, `EvaluationSheetView.tsx` |
| offering-catalog | `features/offering-facets/api/search-by-name.ts` (with `search-coffees.ts`, `search-roasteries.ts`) | `searchByName` | the `ComboboxSearch` sends and rejects on non-2xx | a module-private `readByName` returns `ApiResult<T[]>`; the `ComboboxSearch` keeps rejecting on failure (D3) | `features/offering-facets/ui/OfferingFacets.tsx` (unchanged) |
| evaluations | `entities/evaluation/api/user-evaluations.ts` | `listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | `EvaluationCallResult<T>` = `{ ok: true; status; data } \| { ok: false; status: number \| null }` | `EvaluationCallResult<T>` = `ApiResult<T, "forbidden" \| "not-found" \| "conflict">` | `pages/evaluation-form/model/use-evaluation-form.ts` (`403`, `409`), `EvaluationDetail.tsx` (`404`), `pages/evaluations-list/ui/DeleteEvaluationAction.tsx` (`403`), `EvaluationsList.tsx` |
| offering-management | `features/offering-management/api/management.ts` | `fetchOwnOfferings` | `{ state: "success"; data; meta } \| { state: "empty" } \| { state: "error" }` | `ApiResult<OwnOfferingsPage>` (`{ data, meta }`) | `features/offering-management/model/own-offerings.ts` (builds `success`/`empty`/`error`) |
| offering-management | same | `deleteOffering`, `deleteOfferings` | `"ok" \| "forbidden" \| "failed"` | `ApiResult<null, "forbidden">` | `model/delete-flow.ts` |
| offering-management | same | `createOfferings` | `{ outcome: "ok"; count } \| { outcome: "forbidden" } \| { outcome: "failed" }` | `ApiResult<number, "forbidden">` (the created count) | `model/create-flow.ts` |
| offering-management | same | `fetchMyLocations` | `{ state: "success"; data } \| { state: "error" }` | `ApiResult<LocationItem[]>` | `model/create-flow.ts` (builds `success`/`error`) |
| offering-management | same | `searchCoffeeInventory` | `CoffeeInventoryItem[]`, rejects on non-2xx | `ApiResult<CoffeeInventoryItem[]>` | `ui/InventoryField.tsx` (its `ComboboxSearch` rejects on failure, D3) |
| offering-management | `features/location-management/api/locations.ts` | `readOwnLocations` (with `fetchOwnLocations`) | `ListState` without `loading` (built in api); `fetchOwnLocations` a raw `Response` | `ApiResult<UserLocation[]>` (success on `200`); `fetchOwnLocations` module-private (D4) | `model/use-own-locations.ts` (builds `ready`/`error`) |
| offering-management | same | `createLocation` | raw `Response`; `submit-location.ts` maps `201`/`403`/other and catches | `ApiResult<null, "forbidden">` (success on `201`) | `model/submit-location.ts` |
| user-account | `features/user-account/api/account.ts` | `updateProfile`, `updatePassword`, `deactivateAccount`, `deleteAccount` | `"success" \| "stepUp" \| "error"` | `ApiResult<null, "forbidden">` (success on `200`) | `ui/ProfileForm.tsx`, `PasswordForm.tsx`, `DangerZone.tsx` |
| user-account | `features/user-account/api/register.ts` | `registerUser` | `"created" \| "error"` | `ApiResult<null>` (success on `201`) | `ui/RegisterForm.tsx` |
| user-account | `features/user-account/api/contacts.ts` | `readPrimaryContact` (with `fetchContact`) | `{ ok: false } \| { ok: true; primary }`; `fetchContact` a raw `Response` | `ApiResult<Contact \| undefined>` (success on `200`); `fetchContact` module-private (D4) | `ui/ContactSection.tsx` |
| user-account | same | `submitContact` (with `createContact`) | `{ kind: "created"; contact } \| { kind: "exists" } \| { kind: "stepUp" } \| { kind: "error" }`; `createContact` a raw `Response` | `ApiResult<Contact, "conflict" \| "forbidden">` (success on `201` with a readable `data`); `createContact` module-private (D4) | `model/use-contact-form.ts` |

How each consumer maps the result (unchanged states): `"not-found"` keeps today's not-found branch (`notFound()` in `NewEvaluationScreen` and the 404 page in `EvaluationDetail`) and every other failure keeps today's error branch. `"forbidden"` is the step-up notice in the account, contact, location and management flows and the "not yours" message in the evaluation flows; `"conflict"` is the contact "exists" path and the evaluation `409` messages and highlight. A consumer that caught a rejection (`try`/`catch`, `.catch(() => null)`, `.then(ok, () => null)`, `Promise.allSettled`) branches on `ok` instead; `offeringFacetOptions` takes the two `ApiResult`s instead of two `PromiseSettledResult`s.

### D3. The combobox searches

The shared Combobox's `ComboboxSearch` shows its failure row on a rejected search (`src/shared/ui/use-combobox-search.ts`), a contract of `shared/ui` that this change keeps. The read under each search returns an `ApiResult`; the function that adapts it to a `ComboboxSearch` (`searchByName`'s returned search, `InventoryField`'s `search`) throws on `ok: false`. An aborted search still resolves to nothing: the hook ignores any settlement once its signal is aborted.

### D4. The raw-`Response` functions

`fetchOwnLocations`, `fetchContact` and `createContact` become module-private send steps of their `api` modules: no consumer outside the module reads a `Response` any more. `createLocation` keeps its name and returns the `ApiResult`.

### D5. UI-state types

`OwnOfferingsResult` and `LocationsResult` were UI states declared in `api`. They move, with the same names and members, to `model/own-offerings.ts` and `model/create-flow.ts`, which build them from the `ApiResult`. `WriteOutcome` and `CreateOutcome` are removed; `src/features/offering-management/index.ts` re-exports the two moved types from their new files and drops the two removed ones (no other slice imports any of the four). `ListState` stays in `location-management/model/types.ts`.

### D6. Out of scope

`src/shared/api/client.ts` (the client itself), `src/shared/api/tokens.ts` (the OAuth token exchange and refresh, with their own `TokenGrantError`) and `src/features/auth/api/authorize.ts` (redirects and the callback) are session mechanics, not resource requests whose outcomes a screen shows; they keep their shapes.

### D7. Tests whose shape changes

Each listed test keeps its scenario and what it checks; only the mocked or asserted result shape changes (and a test title that names the old shape, such as "rejects", says "fails" instead).

- Task 1 (offering-catalog): `src/entities/offering/api/offering.test.ts` (asserted results); `src/widgets/offering-list/api/offerings.test.ts` (asserted payload under `data`, the non-2xx case resolves `{ ok: false, kind: "error" }`); `src/features/offering-facets/model/options.test.ts` (inputs as `ApiResult`s); `src/pages/evaluation-form/ui/EvaluationDetail.test.tsx`, `src/pages/evaluations-list/ui/EvaluationsList.test.tsx`, `src/widgets/public-evaluation-list/ui/PublicEvaluationList.test.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetView.test.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetBaseline.test.tsx` (mocked `fetchOffering`, `fetchEvaluation(s)` and `fetchTaxonomies` results).
- Task 2 (evaluations): `src/entities/evaluation/api/user-evaluations.test.ts` (asserted results); `EvaluationDetail.test.tsx`, `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`, `EvaluationsList.test.tsx`, `src/pages/evaluations-list/ui/DeleteEvaluationAction.test.tsx` (mocked results).
- Task 3 (offering-management): `src/features/offering-management/api/management.test.ts` (asserted result).
- Task 4 (user-account): none; the tests stub `fetch`.

No test is deleted and no test under `qa/` is edited; QA copies that mock or assert an old shape, or import a function made private (D4), go stale and are listed in the final report.

### D8. Commit plan

One task, and one implementation commit, per capability of D2, in the table's order. A consumer in another capability's folder rides with the commit of the module it consumes, because a module and its consumers only typecheck together; the commit scope is the module's capability. The type of D1 lands with task 1.

## Risks / Trade-offs

- A consumer's `try`/`catch` around a read also catches a failure of the code that follows it in the same block (for example a malformed page body reaching `loadEvaluationOfferings`). Consumers that hold such a block keep it and branch on `ok` inside it, so any such throw still ends in the same error state. Bodies are typed by the contract and parsed exactly as before.
- The task-1 commit is large (eight modules and their consumers); it is one capability by D8.
