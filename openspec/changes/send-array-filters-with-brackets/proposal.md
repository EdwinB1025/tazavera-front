Type: Refactor (fast lane)

# Proposal

## Why

The design lead's review on the real API (AUT finding, maximum priority) found that choosing any taste note in the offerings sidebar shows "No se pudieron cargar las ofertas". `fetchOfferings` (`src/widgets/offering-list/api/offerings.ts`) sends each taste note as a plain repeated key (`cataRef=<ulid>`); the Laravel API answers `422` "The cata ref field must be an array", because PHP reads an array only from `cataRef[]=a&cataRef[]=b` (a repeated plain key keeps only the last value).

Product owner settled the fix on 2026-10-08 (option a): the API's Scribe docs now name every array query parameter of `GET /offerings` with brackets (`cataRef[]`, `fragranceCata[]`, `aromaCata[]`, `flavorCata[]`, `aftertasteCata[]`, `mouthfeelCata[]`; tazavera-api `74407b3`). The front's `contracts/openapi.yaml` and the generated `src/shared/api/schema.ts` are refreshed by Product owner afterwards, in a follow-up; this change does not touch them.

## What Changes

- The offerings request sends every array filter of `GET /offerings` as `name[]=value`, one pair per value, in the same order, through the query building `fetchOfferings` already does. Single-valued keys are sent as before.
- The browser URL of the offerings pages (the front's own query, e.g. `?cataRef=...`) does not change; only the request to the API does.
- The spec deltas state the bracketed form of the request (`filtering`: Offering filter state in the URL; `offering-catalog`: Catalog query pass-through).

## Non-goals

- No edit to `contracts/openapi.yaml` or `src/shared/api/schema.ts`.
- No change to the other requests that build a query: `GET /evaluations` (`src/entities/evaluation/api/public-evaluations.ts`), `GET /coffeeshops` (`src/widgets/coffeeshop-list/api/coffeeshops.ts`) and the name searches (`src/features/offering-facets/api/search-by-name.ts`) send only single values, and their contract parameters are not arrays.
- No change to the facets, the URL writes or the allow-list of `buildOfferingsQuery`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: the offering list request carries the taste notes as `cataRef[]`, one pair per chosen note.
- `offering-catalog`: the catalog pass-through sends the array parameters of `GET /offerings` with brackets.

## Impact

- Code: `src/widgets/offering-list/api/offerings.ts`.
- Tests: `src/widgets/offering-list/api/offerings.test.ts` (one new test; the existing pass-through assertion that expects the plain `cataRef=` form is updated). The QA copy `qa/src/widgets/offering-list/api/offerings.test.ts` still expects the old form and is reported as stale; it is not edited.
- Follow-up: Product owner refreshes `contracts/openapi.yaml` and regenerates `src/shared/api/schema.ts`. After the regeneration, the `listOfferings` query names of the contract become `cataRef[]` etc., which the front's own URL keys (`cataRef`) and the allow-list in `src/widgets/offering-list/lib/query.ts` do not mirror; that follow-up decides how they map.
- APIs, dependencies: none.

## Propose status

- **Change-id:** send-array-filters-with-brackets
- **Date:** 2026-10-08
- **`openspec validate send-array-filters-with-brackets --strict`:** valid
- **Backlog entry resolved:** none (AUT review finding).
- **Resolved:** the array parameters of `GET /offerings` are the six named by Product owner (the six `string[]` query parameters of `listOfferings` in the current contract); brackets are added in `fetchOfferings`, which percent-encodes them like every other key (`cataRef%5B%5D=`), a form PHP reads as `cataRef[]` (design.md D1, D2). Every other request was checked and left unchanged (proposal.md — Non-goals).
- **Open:** nothing.
