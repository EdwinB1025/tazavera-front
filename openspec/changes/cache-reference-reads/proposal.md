Type: Refactor (fast lane)

# Proposal

## Why

The two reference reads, `GET /taxonomies` and `GET /coffees`, are sent uncached on every render, and the offering detail composes the provisional tab's baseline panel on every view, whatever the tab, so its `/evaluations` and `/taxonomies` requests run even on the Inventory data and Consensus tabs (backlog R30 with R19, technical review §3.1 row R30). Caching the reference data on the server with a one-hour refresh, and loading the baseline panel only when the provisional tab is shown, cuts a detail view from 3 requests to 1. Product owner approved both on 2026-10-08, including the change to add-public-evaluations design D9.

## What Changes

- `src/shared/api/client.ts`: one exported request option for the reference reads, a server cache refreshed every hour (3600 seconds), the only place the one-hour value lives.
- `src/shared/api/coffees.ts`: `fetchCoffees` passes that option to `publicRequest("/coffees", …)`.
- `src/entities/taxonomy/api/taxonomies.ts`: `fetchTaxonomies` passes that option to `publicRequest("/taxonomies", …)`.
- `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`: the baseline panel and its requests are composed only when the route's tab is `provisional`; on any other tab the provisional slot holds the panel's loading state, so nothing is requested for it.
- The requests' methods, paths and query strings do not change, and what users see on every tab does not change. The only request difference is fewer repeated reads: the reference data comes from the server cache within the hour, and the baseline is requested only on the provisional tab.

## Non-goals

- No caching of any other read (offerings, evaluations, roasteries, the authenticated reads), and no on-demand revalidation or cache tags.
- No change to the tab component, the detail widget or the baseline widget: only the page's composition changes.
- No change to `publicRequest`'s signature or to the authenticated `request` path.
- No new tests and no changed assertions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: the reference reads (taxonomies, coffees) are cached on the server with a one-hour refresh, and the provisional evaluation panel's data is requested only when the provisional tab is shown.

## Impact

- Code: `src/shared/api/client.ts`, `src/shared/api/index.ts`, `src/shared/api/coffees.ts`, `src/entities/taxonomy/api/taxonomies.ts`, `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`.
- Protecting tests: `qa/src/entities/taxonomy/api/taxonomies.test.ts`, `src/shared/api/coffees.test.ts`, `qa/src/shared/api/coffees.test.ts`, `src/shared/api/client.test.ts`, `qa/src/shared/api/client.test.ts`, `src/pages/offering-detail/ui/OfferingDetailScreen.test.tsx`, `qa/src/pages/offering-detail/ui/OfferingDetailScreen.test.tsx`, `qa/src/pages/offering-detail/ui/OfferingDetailScreen.pass2.test.tsx`, and the callers' tests that `vitest related` selects.
- Risk: `qa/src/entities/taxonomy/api/taxonomies.test.ts:55` and `qa/src/shared/api/coffees.test.ts:29` assert that `fetch` was called with the URL alone. The cache option travels in `publicRequest`'s `init` (Product owner's decision), so `fetch` receives a second argument and those two assertions fail. Refactor changes never change assertions, so the build stops at the first task that adds the option and reports it (see Propose status).
- APIs, dependencies: none.

## Propose status

- **Change-id:** cache-reference-reads
- **Date:** 2026-10-08
- **`openspec validate cache-reference-reads --strict`:** valid
- **Backlog entries resolved:** R30 — Cache the reference reads (with R19); R19 — The provisional evaluation loads on every offering-detail request
- **Resolved:** the caching mechanism (`fetch`'s `next.revalidate` option, 3600 seconds, carried in `publicRequest`'s `init`; design.md D1), where the one-hour value lives (design.md D2) and how the detail screen loads the baseline only for the provisional tab (design.md D3).
- **Open (Product owner):** the two exact-argument assertions named under Impact → Risk conflict with the settled decision that the cache option travels in `publicRequest`'s `init`. Options: (a) allow the build to update those two assertions to expect the URL plus the cache option, as part of tasks 1.2 and 1.3; (b) cache without changing `fetch`'s arguments (for example `unstable_cache` around the two reads, which overrides the "option in `init`" decision); (c) keep the change to R19 only. Tasks 1.2 and 1.3 cannot complete until this is decided.
