# Proposal

## Why

The verified-offerings widget owns two pieces that every upcoming list screen needs: the olfactory taxonomy read and lookup, and a Previous/Next pagination hardwired to the landing's `/{locale}?page=n` addresses. `add-specialist-evaluations`, `add-offering-catalog`, `add-offering-management` and `add-filter-controls` would each copy them. This change extracts both from the widget so those consumers reuse them, with no visible change to the landing.

## What Changes

- A new entity slice `src/entities/taxonomy` takes the taxonomy read (`fetchTaxonomies`) and the lookup builder (`buildTaxonomyLookup`) out of `src/widgets/offering-list`, unchanged in behaviour. The named payload type `TaxonomiesPayload` is exported from `src/shared/api` (D3).
- A generic `Pagination` in `src/shared/ui` replaces `OfferingPagination`: the host passes the list's address (`path`) and its current `query`, and the control replaces only `page`, keeping every other query parameter (Open 1, option b). It renders Previous and Next only as part of a successful, non-empty list, whose loading, empty and error states belong to the host (D2).
- The landing is rewired to both. Every landing test is kept: same cases and assertions, fixtures copied where a shared fixture cannot follow the moved block (D4).
- **BREAKING** for the widget's own public API only: `src/widgets/offering-list/index.ts` stops exporting `OfferingPagination`, `OfferingPaginationProps` and `OfferingPaginationTexts`; nothing outside the widget imports them today.

## Out of scope (non-goals)

- `resolveTaxonomies` stays in the widget: it maps offering references onto `ResolvedTaxonomyBadge`, a type of `entities/offering`, and one entity slice may not import another. No taxonomy code moves anywhere else.
- No `categories` filtering and no descriptor row building: those belong to `add-specialist-evaluations`.
- No change to `fetchVerifiedOfferings`, the offering grid, the skeleton, `RetryButton` or `OfferingCard`.
- No new catalog text, token or contract operation, and no visible change to the landing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: one ADDED requirement, "Pagination" — the paging control's contract (its two actions, address handling, boundary states and placement). The capability already lists pagination among its content containers (D1: no change to the Purpose).

## Impact

- **Code** (FSD layers): new `src/entities/taxonomy` (`api/taxonomies.ts`, `model/lookup.ts`, `index.ts`); new `src/shared/ui/Pagination.tsx` and its test; `src/shared/ui/index.ts` exports it; `src/shared/api/index.ts` exports `TaxonomiesPayload`; `src/widgets/offering-list` loses `OfferingPagination` and the moved taxonomy code and is rewired to the new slices. `ExploreButton.test.tsx`'s comment is updated to name `Pagination.test.tsx` (D4).
- **Tests**: the `fetchTaxonomies` and `buildTaxonomyLookup` blocks move to the entity (same cases and assertions, fixtures copied); the five `OfferingPagination` cases move to `Pagination.test.tsx` adapted to the new props; two query-handling cases are added there; `OfferingList.test.tsx` gains one landing-address case; `src/shared/ui/index.test.tsx` gains one smoke render. No test is removed or weakened.
- **Dependencies, contract, texts**: none added, none changed. `GET /taxonomies` and `GET /offerings` are consumed exactly as today.
- **Consumers unblocked**: `add-specialist-evaluations`, `add-offering-catalog`, `add-offering-management`, and (through the catalog) `add-filter-controls`.
