Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT finding (2026-10-09, maximum priority). `fetchTaxonomies()` reads `GET /taxonomies` from the server cache refreshed every hour (`REFERENCE_READ_INIT`, R30 `cache-reference-reads`). After the API database was reseeded, the taxonomy ULIDs changed but the cached `/taxonomies` kept the old ones for up to an hour: every consensus and sensory reference of the offerings and evaluations failed the lookup, so the flavor wheel rendered empty, the consensus axes showed no notes and the offering cards showed no taste notes. Product owner decided: when the cache does not hold what the data needs, it must update itself automatically.

This changes R30's caching behaviour by Product owner's decision; Product owner types AUT corrections as fast-lane refactors. The normal read, its one-hour value and the coffee catalog read do not change.

## What Changes

- `src/entities/taxonomy/model/refs.ts`: one pure helper that collects every `ref` of a taxonomy reference tree, children included.
- `src/entities/taxonomy/api/taxonomies.ts`: one function beside `fetchTaxonomies`, reusing it and returning the same `ApiResult`, that takes the references a screen is about to resolve, reads the cached taxonomies and, when any reference is missing from them, reads `GET /taxonomies` once more bypassing the cache and returns that fresh result. At most one extra request per call; references still missing after the fresh read are dropped as today.
- The slice's public index exports both.
- The offering cards (`src/widgets/offering-list/ui/Offerings.tsx`), the offering detail (`src/widgets/offering-detail/ui/OfferingDetail.tsx`) and the evaluation sheet (`src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx`, `EvaluationSheetBaseline.tsx`) call the new function with the references of the data they already hold. The baseline panel reads its evaluation before the taxonomies, since the taxonomy read now depends on it.
- The forms and facets that only list taxonomy options keep `fetchTaxonomies` (`FilteredOfferingsToolbar`, `FilteredOfferingsFacets`, `NewEvaluationScreen`), as do the screens whose references are loaded in the browser, not on the server (`EvaluationScreen`, `ManageOfferingsScreen`).
- `REFERENCE_READ_INIT` and its one-hour value stay; `/coffees` does not change.

## Non-goals

- No change to the coffee catalog read, to the other public reads or to `publicRequest`.
- No cache tags, on-demand revalidation or route handler.
- No new dependency, token or text.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: a cached taxonomy read that lacks a reference the shown data needs is replaced by a fresh read before rendering.

## Impact

- Code: `src/entities/taxonomy/model/refs.ts`, `src/entities/taxonomy/api/taxonomies.ts`, `src/entities/taxonomy/index.ts`, `src/widgets/offering-list/ui/Offerings.tsx`, `src/widgets/offering-detail/ui/OfferingDetail.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetBaseline.tsx`.
- Tests: one new test file for the new function, three cases (Product owner's list); the callers' tests are updated only where their mocks of `@/entities/taxonomy` break.
- APIs, dependencies: none.

## Propose status

- **Change-id:** refresh-stale-taxonomies
- **Date:** 2026-10-09
- **`openspec validate refresh-stale-taxonomies --strict`:** valid
- **Backlog entries resolved:** none (Product owner's AUT finding).
- **Resolved:** the bypass mechanism is `fetch`'s `cache: "no-store"` option, carried in `publicRequest`'s `init` (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md`, "`options.cache`": "`no-store`: Next.js fetches the resource from the remote server on every request"). The fresh read cannot also replace the cached entry from a Server Component render in this Next.js version: a `no-store` (or `no-cache`) fetch is never written to the data cache (`node_modules/next/dist/server/lib/patch-fetch.js` sets its revalidate to 0), and the documented ways to expire a cached entry, `revalidateTag` and `updateTag`, can only be called in Server Functions and Route Handlers (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`, `updateTag.md`). So a miss bypasses the cache for that render only, as Product owner's fallback allows; the cached entry refreshes at the end of its hour as before.
- **Resolved (build's choice, flagged):** when the fresh read fails, the function returns the cached result, so a transient failure keeps today's rendering (refs dropped) instead of turning the page into its error state.
- **Open:** none.
