Type: Refactor (fast lane)

# Proposal

## Why

Six public reads build the API URL by hand from `NEXT_PUBLIC_API_URL` and call `fetch` directly, beside the shared request client that already offers `publicRequest(path, init?)` (backlog R24, technical review §3.1). Routing them through `publicRequest` gives one seam for the base URL, the headers and caching, which the planned caching work (R30) needs, without changing behaviour.

## What Changes

- `src/shared/api/client.ts`: `publicRequest` calls `fetch(url)` with one argument when no `init` is given, and `fetch(url, init)` otherwise. The request sent is identical; no token, header, refresh or `401` handling changes, and the authenticated path (`request`) is not touched.
- `src/shared/api/coffees.ts`: `fetchCoffees` sends `GET /coffees` through `publicRequest`, imported from its sibling `./client` (never through `./index` or `@/shared/api`).
- `src/entities/evaluation/api/public-evaluations.ts`: `fetchEvaluations` and `fetchEvaluation` send their reads through `publicRequest` from `@/shared/api`.
- `src/entities/taxonomy/api/taxonomies.ts`: `fetchTaxonomies` sends `GET /taxonomies` through `publicRequest` from `@/shared/api`.
- `src/features/offering-facets/api/search-roasteries.ts`: `searchRoasteries` sends `GET /roasteries?name=…` through `publicRequest` from `@/shared/api`, passing its `{ signal }` options as `init` unchanged.
- `src/widgets/offering-list/api/offerings.ts`: `fetchOfferings` sends `GET /offerings?…` through `publicRequest` from `@/shared/api`.
- Each function keeps its path and query string, the request options it passes today, its status checks, its parsing and its result shape. What users see and the requests sent to the API do not change.

## Non-goals

- No change to `src/shared/api/client.ts` beyond `publicRequest`'s call shape: no token, header, refresh or `401` handling change, and the authenticated path is not touched.
- No unification of the reads' result shapes (R35) and no caching options (R30).
- No change to the other modules that read `NEXT_PUBLIC_API_URL` (the token and authorize requests, and the links built for the browser): they are not among the six public reads of R24.
- No new tests and no changed assertions. Only a mock of `@/shared/api` that lacks `publicRequest` and breaks may gain it, as an import change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: adds the structural property that every public read is sent through the shared public request client, the one place that builds the API URL, with the requests unchanged.

## Impact

- Code: `src/shared/api/client.ts`, `src/shared/api/coffees.ts`, `src/entities/evaluation/api/public-evaluations.ts`, `src/entities/taxonomy/api/taxonomies.ts`, `src/features/offering-facets/api/search-roasteries.ts`, `src/widgets/offering-list/api/offerings.ts`.
- Protecting tests: `src/shared/api/coffees.test.ts` and `qa/src/shared/api/coffees.test.ts`; `src/features/offering-facets/api/search-roasteries.test.ts` and its QA copy; `qa/src/entities/evaluation/api/public-evaluations.test.ts`; `qa/src/entities/taxonomy/api/taxonomies.test.ts`, `src/widgets/offering-list/api/offerings.test.ts` (its taxonomy cases) and `src/widgets/offering-list/lib/resolve-taxonomies.test.ts`; `src/widgets/offering-list/api/offerings.test.ts` and its QA copy. They stub `fetch` and `NEXT_PUBLIC_API_URL`; the URLs do not change.
- Risk: `publicRequest` builds the base from `NEXT_PUBLIC_API_URL ?? ""`. A protecting test that fails only because of an unset environment value is not changed: the build stops and reports it. The argument-list risk is settled by the call-shape decision below.
- APIs, dependencies: none.

## Propose status

- **Change-id:** route-public-reads-through-client
- **Date:** 2026-10-08
- **`openspec validate route-public-reads-through-client --strict`:** valid
- **Backlog entry resolved:** R24 — Route the public reads through `publicRequest`
- **Resolved:** no design.md: the backlog entry and the review row R24 settle every decision.
- **Resolved (2026-10-08, orchestrator's decision, option A):** `publicRequest` calls `fetch(url)` with one argument when no `init` is given, and `fetch(url, init)` otherwise. Reason: at task 1.1 the protecting read tests (`qa/src/shared/api/coffees.test.ts`, `src/widgets/offering-list/api/offerings.test.ts`, `qa/src/entities/evaluation/api/public-evaluations.test.ts`, `qa/src/entities/taxonomy/api/taxonomies.test.ts`, `qa/src/widgets/offering-list/api/offerings.test.ts`) assert `fetch` was called with the URL alone, and `publicRequest` passed a second `undefined` argument. `fetch(url)` and `fetch(url, undefined)` send the same request, so behaviour is kept and every assertion stays unchanged; only `publicRequest`'s call shape changes. `client.ts` leaves the non-goals and task 1.1 is added for it; the former tasks 1.1–1.4 become 1.2–1.5. Neither `client.test.ts` asserts a two-argument call for a request without `init`.
- **`openspec validate route-public-reads-through-client --strict` after the update:** valid
- **Open:** nothing.
