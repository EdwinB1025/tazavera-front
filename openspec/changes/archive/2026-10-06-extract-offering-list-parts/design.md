# Design

## Context

See `proposal.md` — Why. The product decisions are settled in `docs/design/extract-offering-list-parts/design-summary.md` and the four decisions of `docs/design/extract-offering-list-parts/handoff.md` (D1–D4 below are cited by those names where they settle something). This document records the end states that follow from them. The constraints that shape the approach:

- The code being moved lives in `src/widgets/offering-list/` on `develop`: `fetchTaxonomies` and `TaxonomiesPayload` in `api/offerings.ts`, `buildTaxonomyLookup` with `TaxonomyLookup`/`TaxonomyLookupEntry` in `lib/resolve-taxonomies.ts`, and `OfferingPagination` in `ui/OfferingPagination.tsx`. Nothing outside the widget imports `OfferingPagination` (verified in code).
- FSD: a layer imports only from layers below, never between slices of one layer; slices are imported through their `index.ts`; `shared` is business-agnostic and `shared/api` holds the named API type aliases built on `schema.ts`. API types are imported only from `src/shared/api/`.
- `OfferingList` is a Server Component, so every prop `Pagination` receives must be serializable. The control reads no URL hook (`useRouter` only), so no `Suspense` boundary is needed (`node_modules/next/dist/docs/.../use-search-params.md`, the constraint that rules out the self-reading variant).
- The landing's paging behaviour (`openspec/specs/landing/spec.md`, "Paging", "Paging at the boundaries") stays satisfied unchanged.

## Goals / Non-Goals

**Goals:**

- The taxonomy read and lookup reusable by every consumer above `entities`, with the function bodies, signatures and error behaviour unchanged.
- One query-keeping, route-agnostic pagination in `shared/ui` that the landing and the four upcoming list hosts share.
- Every existing landing test kept — same cases and assertions, fixtures copied where a shared fixture cannot follow the moved block (handoff D4).

**Non-Goals:**

- No new endpoint, token, catalog key or contract operation; no visible change.
- No shared-card use is added, so the card field mapping rule is not applicable.
- No generalisation beyond the two settled prop shapes: nothing for sorting, page numbers or page-size selection.

## Decisions

### D1 — Taxonomy entity (`src/entities/taxonomy`)

The olfactory taxonomy is a business concept with its own data and rule (localized name by locale, data colour), so it is an entity slice, not `shared/api` (which stays business-agnostic and type-only). Every consumer sits above `entities`, so the slice is importable by all of them.

End state:

| File | Holds |
|---|---|
| `src/entities/taxonomy/api/taxonomies.ts` | `fetchTaxonomies()`, moved unchanged from `src/widgets/offering-list/api/offerings.ts` |
| `src/entities/taxonomy/model/lookup.ts` | `buildTaxonomyLookup(nodes, locale)` and the types `TaxonomyLookup`, `TaxonomyLookupEntry`, moved unchanged from `src/widgets/offering-list/lib/resolve-taxonomies.ts` |
| `src/entities/taxonomy/index.ts` | Public API: `fetchTaxonomies`, `buildTaxonomyLookup`, `TaxonomyLookup`, `TaxonomyLookupEntry` |

`model/`, not `lib/`, because the lookup is exported (the FSD skill keeps `lib/` for intra-slice helpers). The function bodies, signatures and error behaviour do not change.

Widget end state: `api/offerings.ts` keeps only `fetchVerifiedOfferings` and `VerifiedOfferingsPayload`; `lib/resolve-taxonomies.ts` keeps only `resolveTaxonomies` and imports `TaxonomyLookup` from `@/entities/taxonomy`; `ui/VerifiedOfferings.tsx` imports `fetchTaxonomies` and `buildTaxonomyLookup` from `@/entities/taxonomy`, with its fetch order, mapping and error result unchanged. `resolveTaxonomies` stays in the widget: it returns `ResolvedTaxonomyBadge`, a type of `entities/offering`, and one entity slice may not import another.

### D2 — `TaxonomiesPayload` lives in `src/shared/api` (handoff D3)

The named API type alias is exported from `src/shared/api/index.ts`, built on `operations["listOlfactoryTaxonomies"]` of the generated `schema.ts`, which stays byte-for-byte untouched. The entity imports it from `@/shared/api` and does not re-export it: API types are imported only from `src/shared/api/`. Any other consumer needing the type imports it from there as well. `VerifiedOfferingsPayload` in the widget is a prior deviation, not a precedent (it is not moved by this change).

Consequence over design-summary §11: this change does touch `src/shared/api/index.ts`, shared with `add-auth` (in Apply). Each change adds its own export lines and a resolution keeps both sides (see Risks).

### D3 — Pagination interface (settled Open 1, option b)

`src/shared/ui/Pagination.tsx` takes serializable props only, so a Server Component host can render it:

| Prop | Type | Notes |
|---|---|---|
| `currentPage` | `number` | The host normalises the API's optional `meta.current_page` (today `?? 1`) |
| `lastPage` | `number` | The host normalises `meta.last_page` (today `?? currentPage`) |
| `path` | `string` | The list's address without its query, e.g. `/es` or `/es/offerings` |
| `query` | `Record<string, string \| string[] \| undefined>` | Optional, default empty; Next's `searchParams` shape. Every key is kept, `page` is replaced |
| `texts` | `{ previousLabel: string; nextLabel: string }` | From the host's catalog, as props |

Exported types: `PaginationProps` and `PaginationTexts`. Rejected: host-built `previousHref`/`nextHref` (each of the four hosts would repeat the query logic) and self-read `usePathname`/`useSearchParams` (needs a `Suspense` boundary in prerendered routes and is harder to test).

### D4 — Address building and boundary states

- Previous pushes `path` with the query and `page = currentPage − 1`; Next pushes it with `page = currentPage + 1`. `page` takes the place of an existing `page` key in place, or is appended last; repeated keys keep all their values. The resulting query is exactly what `URLSearchParams` produces; tests assert it as built. With an empty `query` the landing's addresses are exactly `/{locale}?page=n`, as today.
- Previous is disabled when `currentPage === 1`, Next when `currentPage === lastPage`. A disabled `Button` rejects activation.

### D5 — Client boundary, list states and texts (handoff D2)

`Pagination` is a Client Component (`"use client"`, `useRouter`), as `OfferingPagination` is. The paging actions render only below a successfully loaded, non-empty list; loading, empty and error belong to the host, exactly as the landing does today (`OfferingList` renders the pagination only in its success branch). The labels come from the host's catalog through `texts`; no new catalog keys. Accessible names are the visible labels; no icon.

### D6 — Layout (unchanged from `add-landing` D14)

The root classes are exactly `flex flex-wrap justify-center gap-4`: flex, wrapping, centred on the main axis, 1rem between the buttons in both directions. No padding, margin, border or radius on the root; the host places it (`OfferingList` keeps `flex flex-col gap-8`, so 2rem below the grid). Two `Button`s with `variant="primary"` and `size="base"`; rest, hover and focus come from `Button`, and the disabled state is `Button`'s (50% opacity, not-allowed cursor).

### D7 — API endpoints consumed, and how errors reach the user

**`GET {NEXT_PUBLIC_API_URL}/taxonomies`** — the olfactory taxonomy tree, consumed exactly as today.

| | |
|---|---|
| Method and path | `GET /taxonomies` (`operations["listOlfactoryTaxonomies"]`) |
| Auth | None; the contract attaches no security scheme; plain `fetch` with no credential header |
| Request | No parameters, no body |
| Response `200` | `{ data: TaxonomyNode[] }` — per node `ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `children` |
| Errors | Transport failure or any non-2xx status; the read throws |
| Presented to the user | Unchanged: the host maps the failure — the landing into its one error state with the retry action, whose label and message come from its catalog |

`GET /offerings` (`listOfferings`) is consumed exactly as today by `fetchVerifiedOfferings`, which this change does not alter; its error presentation is likewise unchanged. No API error body or status reaches the presentation.

### D8 — Files created or modified

Tests live beside the file they test.

**Created**

| Path | FSD layer | Holds |
|---|---|---|
| `src/entities/taxonomy/index.ts` | entities | Public API of the slice (D1) |
| `src/entities/taxonomy/api/taxonomies.ts` | entities | `fetchTaxonomies()` (moved) |
| `src/entities/taxonomy/api/taxonomies.test.ts` | entities | The moved fetch cases (D9) |
| `src/entities/taxonomy/model/lookup.ts` | entities | `buildTaxonomyLookup` and its types (moved) |
| `src/entities/taxonomy/model/lookup.test.ts` | entities | The moved lookup cases (D9) |
| `src/shared/ui/Pagination.tsx` | shared | `Pagination` (moved and generalised, D3–D6) |
| `src/shared/ui/Pagination.test.tsx` | shared | The moved, adapted and new cases (D9) |

**Modified**

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/api/index.ts` | shared | Export `TaxonomiesPayload` (D2) |
| `src/shared/ui/index.ts` | shared | Export `Pagination`, `PaginationProps`, `PaginationTexts` |
| `src/shared/ui/index.test.tsx` | shared | One smoke render of `Pagination` through `@/shared/ui`; every other case stays (handoff D4) |
| `src/widgets/offering-list/api/offerings.ts` | widgets | `fetchTaxonomies` and `TaxonomiesPayload` leave |
| `src/widgets/offering-list/api/offerings.test.ts` | widgets | The `fetchTaxonomies` cases leave |
| `src/widgets/offering-list/lib/resolve-taxonomies.ts` | widgets | `buildTaxonomyLookup` and its types leave; `TaxonomyLookup` from `@/entities/taxonomy` |
| `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` | widgets | The `buildTaxonomyLookup` cases leave; the `resolveTaxonomies` cases stay |
| `src/widgets/offering-list/ui/VerifiedOfferings.tsx` | widgets | Imports `fetchTaxonomies` and `buildTaxonomyLookup` from `@/entities/taxonomy` |
| `src/widgets/offering-list/ui/OfferingList.tsx` | widgets | Renders `Pagination` with `path="/{locale}"`, no `query`, `meta`-normalised pages (D3) |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | widgets | Gains one landing-address case (D9) |
| `src/widgets/offering-list/index.ts` | widgets | Drops `OfferingPagination`, `OfferingPaginationProps`, `OfferingPaginationTexts` |
| `src/pages/home/ui/ExploreButton.test.tsx` | pages | Its comment names `Pagination.test.tsx` instead of the deleted file (handoff D4) |

**Removed**

| Path | FSD layer | Why |
|---|---|---|
| `src/widgets/offering-list/ui/OfferingPagination.tsx` | widgets | Replaced by `Pagination` |
| `src/widgets/offering-list/ui/OfferingPagination.test.tsx` | widgets | Its cases move to `Pagination.test.tsx` (D9) |

`src/shared/api/schema.ts` and `contracts/openapi.yaml` stay untouched.

### D9 — Tests (handoff D4 wording)

No test is removed or weakened; tests move with their subject.

- **Same cases and assertions, fixtures copied:** the `fetchTaxonomies` block of `offerings.test.ts` moves to `src/entities/taxonomy/api/taxonomies.test.ts`, and the `buildTaxonomyLookup` block of `resolve-taxonomies.test.ts` moves to `src/entities/taxonomy/model/lookup.test.ts`. The `TREE` and fetch fixtures are shared with cases that stay, so they are copied, not moved. The `resolveTaxonomies` cases stay, importing `buildTaxonomyLookup` from `@/entities/taxonomy`.
- **Moved and adapted:** the five `OfferingPagination.test.tsx` cases become `src/shared/ui/Pagination.test.tsx` cases with the same expectations, rewritten for the props of D3: Previous at page 2 of 5 with `path="/es"` pushes `/es?page=1`; Next at 2 of 5 with `path="/ca"` pushes `/ca?page=3`; Previous disabled on page 1 pushes nothing; Next disabled on the last page pushes nothing; the root carries `flex`, `flex-wrap`, `justify-center`, `gap-4`.
- **New in `Pagination.test.tsx`:** with `query={{ roasteryName: "Nómada", page: "2" }}` and `path="/es/offerings"`, Next pushes `/es/offerings?roasteryName=N%C3%B3mada&page=3` (`page` replaced in place; encoding asserted as `URLSearchParams` builds it); a repeated key (`{ process: ["washed", "natural"] }`) keeps both values.
- **New in `OfferingList.test.tsx`:** exactly one case — `locale="es"` with `meta` page 1 of 2, Next pushes `/es?page=2` (the router mock already exists in that file).
- **New in `index.test.tsx`:** exactly one smoke render of `Pagination` through `@/shared/ui`; its other cases stay unchanged.
- Every other existing test must keep passing unchanged, in particular `OfferingList.test.tsx` (success, boundary, empty, error and retry), `OfferingSkeletonCard.test.tsx`, `HomeScreen.test.tsx`, `HomeHero.test.tsx`, both `ExploreButton.test.tsx`, `OfferingCard.test.tsx`, and the guards (`client-boundary` — `Pagination.tsx` must start with `"use client"` — `color-guard`, `focus-guard`, `xss-guard`, `catalog-guard`, `radius-guard`).
- Verification: `npm run test:run`, `npm run lint` and `npx tsc --noEmit` pass, and the landing `/es` captures at 375px and 1280px match the pre-change captures (the visual review of design-summary §2, with the local read mock).

## Risks / Trade-offs

- **Shared files with parallel changes** — `src/shared/ui/index.ts` and `index.test.tsx` (also edited by `refactor-badge-geometry` and `add-evaluation-scales`) and now `src/shared/api/index.ts` with `add-auth` (D2's consequence over design-summary §11). → Each change adds its own export lines and its own smoke render; a textual conflict in the same block resolves by keeping both sides. None of the overlaps was simulated with `git merge-tree`, because those branches do not exist yet.
- **375px is unverified for the longest catalog label** (design-summary §8). → The two buttons fit at 375px with short labels; the visual capture at 375px in the verification step is where a too-long label would surface.
- **The landing's `/{locale}?page=n` addresses depend on the empty-query path of D4.** → The host-level case in `OfferingList.test.tsx` pins the exact address, in addition to the `Pagination.test.tsx` cases.
- **One change carries two extractions** (settled Open 2, option a: renamed `extract-offering-list-parts`). → Both halves free the same widget for the same consumers and touch the same files, so one branch avoids self-conflicts; the spec delta covers only the pagination half, since the move has no observable behaviour.

## Migration Plan

No data and no behaviour to migrate. Rollback is reverting the change: the widget restores its own copies and `src/shared/ui/Pagination.tsx`, `src/entities/taxonomy` and the one `TaxonomiesPayload` export line disappear together. No route, catalog or contract is involved.

## Open Questions

None.
