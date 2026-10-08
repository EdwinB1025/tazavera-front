## Context

Fast-lane refactor from backlog R30 (with R19) and technical review §3.1 row R30. Product owner settled on 2026-10-08: the two reference reads (`GET /taxonomies`, `GET /coffees`) are cached on the server with a one-hour refresh, the provisional (baseline) panel and its requests run only when the provisional tab is shown, every public read keeps going through `publicRequest` (`src/shared/api/client.ts`), and any cache option travels in its `init`. This changes add-public-evaluations design D9, under which the page composed the baseline panel on every view and passed it down as the `provisional` slot.

The project does not enable Cache Components (`next.config.ts` sets no `cacheComponents`), so the caching model is the one of `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`. Both reads run only in Server Components.

## Goals / Non-Goals

**Goals:** the two reference reads come from Next.js's server Data Cache, refreshed at most every hour; a detail view on the Inventory data or Consensus tab sends no baseline request.

**Non-Goals:** caching any other read, cache tags or on-demand revalidation, `use cache` (it requires Cache Components), changes to the tab, detail or baseline widgets.

## API endpoints

| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/taxonomies` | none | no query | `TaxonomiesPayload` | any non-2xx or transport failure throws, as today |
| GET | `/coffees` | none | no query | `{ data: CoffeeSummary[] }` | any non-2xx or transport failure throws, as today |
| GET | `/evaluations?offering_id=…&evaluation_type=baseline&…` | none | unchanged | unchanged | unchanged; now sent only on the provisional tab |

Error presentation does not change: every caller maps a thrown read to the state it shows today. A failed read is not cached (Next.js stores only successful responses), so a failure is retried on the next render as today.

## Decisions

### D1 — `fetch`'s `next.revalidate` option, carried in `publicRequest`'s `init`

The reference reads pass `{ next: { revalidate: 3600 } }` as `publicRequest`'s `init`; `publicRequest` forwards it to `fetch(url, init)` unchanged. Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md`, "`options.next.revalidate`": "`number` - (in seconds) Specify the resource should have a cache lifetime of at most `n` seconds", and `caching-without-cache-components.md`, "Caching `fetch` requests": `fetch` requests are not cached by default and are opted in per request. The same doc notes that in development a request carrying `cache-control: no-cache` ignores the option, which only affects local hard refreshes.

Alternatives: `cache: 'force-cache'` caches without a refresh interval (fails the one-hour refresh); `unstable_cache` around the read functions would cache without touching `fetch`'s arguments but contradicts the settled "option in `init`"; route segment `revalidate`/`fetchCache` would cache every read of the route; `use cache` needs Cache Components, which the project does not enable.

### D2 — The one-hour value lives in `src/shared/api/client.ts`

`client.ts` exports one constant, `REFERENCE_READ_INIT`, typed `RequestInit` and equal to `{ next: { revalidate: 3600 } }`, with a comment naming the one-hour refresh (backlog R30). `src/shared/api/coffees.ts` imports it from its sibling `./client`; `src/shared/api/index.ts` exports it for `src/entities/taxonomy/api/taxonomies.ts`, which imports it from `@/shared/api`. No other module repeats the value.

### D3 — The detail screen composes the baseline panel only for the provisional tab (replaces add-public-evaluations D9's "every view")

`OfferingDetailScreen` computes the tab once with `toDetailTab(tab)` and passes it to `OfferingDetail` as today. When that tab is `provisional`, the `provisional` slot is the `Suspense`-wrapped `EvaluationSheetBaseline`, exactly as today. On any other tab the slot is `<EvaluationSheetSkeleton />`, the panel's existing loading state, and no baseline element is created, so its `/evaluations` and `/taxonomies` requests are never made. The baseline texts are built only for the provisional tab.

What users see does not change: the inactive panel is not shown; when the visitor selects the provisional tab, the tabs push `?tab=provisional`, the server renders the page with the provisional tab and the panel's loading state (two placeholder cards) shows inside the panel until the baseline arrives, as the spec's "Loading the panel" scenario states. The widgets keep the `provisional: ReactNode` slot unchanged.

## Files

| File | Layer | Change |
|---|---|---|
| `src/shared/api/client.ts` | shared | add `REFERENCE_READ_INIT` (D2) |
| `src/shared/api/index.ts` | shared | export `REFERENCE_READ_INIT` |
| `src/shared/api/coffees.ts` | shared | `publicRequest("/coffees", REFERENCE_READ_INIT)` and its comment |
| `src/entities/taxonomy/api/taxonomies.ts` | entities | `publicRequest("/taxonomies", REFERENCE_READ_INIT)` and its comment |
| `src/pages/offering-detail/ui/OfferingDetailScreen.tsx` | pages | baseline panel only for the provisional tab (D3) |

No type is added beyond the `RequestInit`-typed constant; no generated type is touched.

## Risks / Trade-offs

- [Exact-argument assertions] `qa/src/entities/taxonomy/api/taxonomies.test.ts:55` and `qa/src/shared/api/coffees.test.ts:29` assert `fetch` was called with the URL alone. With D1, `fetch` receives `(url, REFERENCE_READ_INIT)` and both assertions fail. A refactor never changes assertions, so this is open for Product owner (proposal.md, Propose status); the build stops at task 1.2 and reports it.
- [Static routes] If a route that reads the reference data is prerendered, a numeric `revalidate` lowers its revalidation interval to one hour (fetch.md, "Good to know"). Mitigation: task 2.1 compares the build's route table with `origin/qa`; a route that changes from dynamic to static or vice versa is reported, not fixed.
- [Stale data] Taxonomy or coffee catalog changes in the API reach the front within one hour. Accepted by Product owner.
