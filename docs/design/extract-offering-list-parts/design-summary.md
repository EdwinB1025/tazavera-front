Status: draft — pending Product owner review

# Design summary — extract-offering-list-parts

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Drafted by the design lead on 2026-10-06. Anything not settled by a source is listed under "Open".

- Change-id: `extract-offering-list-parts` (renamed from `extract-taxonomy-and-pagination`; Open 2).
- Capability: `content-structure`. `openspec/config.yaml` lists "pagination" under it, and the pagination requirement is the only observable rule this change adds (§5). The taxonomy move has no observable behaviour and no capability spec of its own: it is code placement only (review log B1). The commits use the `content-structure` scope (AGENTS.md: the scope is the change's capability, even for files of another capability).
- Branch and folder: `feature/extract-offering-list-parts`, `openspec/changes/extract-offering-list-parts/`, `docs/design/extract-offering-list-parts/`.
- Depends on: `add-landing` (merged; owner of the code being moved).
- Consumed by:
  - `add-specialist-evaluations` (descriptor options from `GET /taxonomies`; the list's pagination), Open 13 a);
  - `add-offering-catalog` (the catalog list's pagination with its query; taxonomy lookup for the detail page), its Open 1;
  - `add-offering-management` (the "My offerings" pagination), its Open 3;
  - `add-filter-controls` (taxonomy options for the taste-note facet; pagination that keeps the filter query, its §9);
  - `add-evaluation-scales` does not consume it: its chip group receives rows already built.
- Backlog: no committed entry names it (`docs/backlog.md` holds R1–R4). The orchestrator's notes name a pending entry for this refactor; if Product owner adds one, the architect records its id in `## Propose status`.
- Decisions log: no entry names it. The 2026-10-06 coverage entry (`GET /coffees`, `GET /roasteries`) does not touch these files.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| `add-specialist-evaluations/design-summary.md` (worktree `tazavera-front-evaluations`), Open 13, answered a) | A refactor change first moves the taxonomy read and lookup to `entities/taxonomy` and makes the pagination route-agnostic in `shared/ui`. |
| Orchestrator's task (2026-10-06) | Move `fetchTaxonomies` and `buildTaxonomyLookup` to `entities/taxonomy` (or `shared/api` if FSD requires it); make `OfferingPagination` route-agnostic in `shared/ui`; no visible change to the landing. |
| AGENTS.md "Architecture" and `.opencode/skills/fsd-architecture/SKILL.md` | A layer imports only from layers below. Slices of one layer never import each other. Business concepts go in `entities`; business-agnostic code goes in `shared`. Requests specific to a slice go in its `api/` segment, business logic in `model/`. Slices are imported through their `index.ts`. |
| `.claude/CLAUDE.md` §2 | Public endpoints are fetched on the server with plain `fetch`. Texts reach components as props. |
| `src/widgets/offering-list/*` on `develop` | The current code. `OfferingList` is a Server Component that renders the client `OfferingPagination`. `OfferingPagination` pushes `/${locale}?page=n` through `useRouter` and disables Previous and Next at the boundaries. Its root is `flex flex-wrap justify-center gap-4`. |
| `openspec/specs/landing/spec.md` "Verified offerings list" (Paging, Paging at the boundaries) | The landing's paging behaviour, which stays unchanged. |
| `add-offering-catalog/design-summary.md` line 63 and `add-filter-controls/design-summary.md` line 164 | A host with filters needs Previous and Next to replace only `page` and keep every other query parameter. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` lines 82–88 and 180–184 | `useSearchParams` in a prerendered route needs a `Suspense` boundary, or the production build fails. |

## 1. Scope

**In:**
- A new entity slice `src/entities/taxonomy` holding the taxonomy read and the lookup.
- A new generic `Pagination` in `src/shared/ui`, replacing `OfferingPagination`.
- The landing rewired to both, with every landing test kept (moved where its subject moved).

**Out (non-goals):**
- `resolveTaxonomies` stays in the widget. It returns `ResolvedTaxonomyBadge`, a type of `entities/offering`, and `entities/taxonomy` may not import another entity slice (FSD). It is offering-specific mapping, so it remains the widget's.
- No `categories` filtering and no row building for descriptors: those belong to `add-specialist-evaluations`.
- No change to `fetchVerifiedOfferings`, the offering grid, the skeleton, `RetryButton` or `OfferingCard`.
- No new catalog text, token or contract operation. No visible change.

## 2. Taxonomy entity (`src/entities/taxonomy`)

**Placement (FSD).** `entities/taxonomy`, not `shared/api`:
- The olfactory taxonomy is a business concept with its own data and rule (localized name by locale, data colour). The skill places that in `entities` (step 4 of "Where does it go?").
- `shared` must be business-agnostic, and `shared/api` holds only the named type aliases built on `schema.ts` (skill, "Naming").
- Every consumer sits above `entities`: the `offering-list` widget, the evaluation and offering pages, and the filter `features`. So the slice is importable from all of them.
- `TaxonomyNode` stays in `src/shared/api/index.ts` (AGENTS.md: API types are imported only from `src/shared/api/`). The entity imports it from there.

**End state:**

| File | Holds |
|---|---|
| `src/entities/taxonomy/api/taxonomies.ts` | `fetchTaxonomies()` and the `TaxonomiesPayload` type, moved unchanged from `src/widgets/offering-list/api/offerings.ts`: plain `fetch` of `${NEXT_PUBLIC_API_URL}/taxonomies`, throwing on a non-2xx status or a transport failure |
| `src/entities/taxonomy/model/lookup.ts` | `buildTaxonomyLookup(nodes, locale)` and the types `TaxonomyLookup` and `TaxonomyLookupEntry`, moved unchanged from `src/widgets/offering-list/lib/resolve-taxonomies.ts` |
| `src/entities/taxonomy/index.ts` | Public API: `fetchTaxonomies`, `buildTaxonomyLookup`, and the types `TaxonomiesPayload`, `TaxonomyLookup` and `TaxonomyLookupEntry` |

- `model/`, not `lib/`, because the skill keeps `lib/` for helpers used only inside the slice, and the lookup is exported.
- The function bodies, signatures and error behaviour do not change.

**Widget after the move:**
- `src/widgets/offering-list/api/offerings.ts` keeps only `fetchVerifiedOfferings` and `VerifiedOfferingsPayload`.
- `src/widgets/offering-list/lib/resolve-taxonomies.ts` keeps only `resolveTaxonomies`. It imports `TaxonomyLookup` from `@/entities/taxonomy`.
- `src/widgets/offering-list/ui/VerifiedOfferings.tsx` imports `fetchTaxonomies` and `buildTaxonomyLookup` from `@/entities/taxonomy`. Its fetch order, mapping and error result do not change.

## 3. Pagination (`Pagination`, `src/shared/ui/Pagination.tsx`)

**Props.** The interface is Open 1; this is the recommended shape (option b).

| Prop | Type | Notes |
|---|---|---|
| `currentPage` | `number` | The host normalises the API's optional `meta.current_page` (today `?? 1`) |
| `lastPage` | `number` | The host normalises `meta.last_page` (today `?? currentPage`) |
| `path` | `string` | The address of the list without its query, for example `/es` or `/es/offerings` |
| `query` | `Record<string, string \| string[] \| undefined>` | Optional; default empty. The current query in Next's `searchParams` shape. Every key is kept; `page` is replaced |
| `texts` | `{ previousLabel: string; nextLabel: string }` | From the host's catalog, as props |

- Every prop can be serialized, because `OfferingList`, its first host, is a Server Component and cannot pass a function to a Client Component.
- Exported types: `PaginationProps` and `PaginationTexts`.

**Behaviour.**
- Previous pushes `path` with the query and `page = currentPage − 1`; Next pushes it with `page = currentPage + 1`. `page` takes the place of an existing `page` key, or is appended last; repeated keys keep all their values.
- With an empty `query`, the landing's addresses are exactly `/{locale}?page=n`, as today.
- Previous is disabled when `currentPage === 1`. Next is disabled when `currentPage === lastPage`. A disabled `Button` rejects activation.
- It is a Client Component (`"use client"`, `useRouter`), as `OfferingPagination` is. It reads no URL hook, so no `Suspense` boundary is needed.

**Components and states.**
- Two `Button`s, `variant="primary"`, `size="base"`, labelled by `texts`, as today.
- States: rest, hover and focus come from `Button`; disabled at the boundaries (50% opacity, not-allowed cursor, `Button`'s disabled state).
- Accessible names: the visible labels. No icon.

**Layout and spacing (criterion A).** Unchanged from `OfferingPagination` (`add-landing` design.md D14):
- root: flex, wrapping, centred on the main axis, 1rem between the buttons in both directions;
- no padding, margin, border or radius on the root. The host places it: `OfferingList` keeps it 2rem below the grid (`flex flex-col gap-8`);
- buttons: `Button` geometry (40px high, 16px horizontal padding, `rounded-pill`).

**Landing after the move.**
- `src/widgets/offering-list/ui/OfferingList.tsx` renders `Pagination` with `path="/{locale}"`, no `query`, and `currentPage` and `lastPage` normalised from `meta` with the current fallbacks.
- `OfferingListTexts` uses `PaginationTexts` in place of `OfferingPaginationTexts`. The keys are the same, so `HomeScreen.tsx` does not change.
- `OfferingPagination.tsx` and its test file are removed. `src/widgets/offering-list/index.ts` stops exporting `OfferingPagination`, `OfferingPaginationProps` and `OfferingPaginationTexts`. Nothing outside the widget imports them (searched by the design lead; `ExploreButton.test.tsx` names it only in a comment).

## 4. Files touched

| File | Layer | Change |
|---|---|---|
| `src/entities/taxonomy/index.ts` | entities | New |
| `src/entities/taxonomy/api/taxonomies.ts` and `taxonomies.test.ts` | entities | New (moved code and tests) |
| `src/entities/taxonomy/model/lookup.ts` and `lookup.test.ts` | entities | New (moved code and tests) |
| `src/shared/ui/Pagination.tsx` and `Pagination.test.tsx` | shared | New (moved and generalised) |
| `src/shared/ui/index.ts` and `index.test.tsx` | shared | Export `Pagination` and its types; smoke render |
| `src/widgets/offering-list/api/offerings.ts` and `offerings.test.ts` | widgets | `fetchTaxonomies` and its cases leave |
| `src/widgets/offering-list/lib/resolve-taxonomies.ts` and its test | widgets | `buildTaxonomyLookup` and its cases leave; imports from `@/entities/taxonomy` |
| `src/widgets/offering-list/ui/VerifiedOfferings.tsx` | widgets | Imports from `@/entities/taxonomy` |
| `src/widgets/offering-list/ui/OfferingList.tsx` and `OfferingList.test.tsx` | widgets | Renders `Pagination`; gains the landing address cases |
| `src/widgets/offering-list/ui/OfferingPagination.tsx` and its test | widgets | Removed (cases moved, §6) |
| `src/widgets/offering-list/index.ts` | widgets | Drops the `OfferingPagination` exports |

## 5. Spec delta

ADDED requirement in `content-structure`, "Pagination":
- a paged list offers Previous and Next, driven by its current and last page;
- activating one opens the preceding or following page at the list's own address, keeping every other query parameter;
- Previous is unavailable on the first page, and Next on the last;
- the two actions sit centred below the list, 1rem apart, and wrap.

Scenarios:
- "Next and Previous";
- "Other query parameters kept";
- "Boundaries".

The landing spec does not change: its "Paging" scenarios still hold.

## 6. Tests

No test is removed or weakened. Tests move with their subject (the skill: tests live next to the file they test).

**Moved unchanged** (same cases and assertions, new import path):
- the `fetchTaxonomies (design.md D4)` block of `src/widgets/offering-list/api/offerings.test.ts` (from line 93) moves to `src/entities/taxonomy/api/taxonomies.test.ts`;
- the `buildTaxonomyLookup (design.md D5)` block of `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` (from line 57) moves to `src/entities/taxonomy/model/lookup.test.ts`. The `resolveTaxonomies` cases stay, importing `buildTaxonomyLookup` from `@/entities/taxonomy`.

**Moved and adapted:** the five `OfferingPagination.test.tsx` cases move to `src/shared/ui/Pagination.test.tsx`, rewritten for the new props with the same expectations:
- Previous with `path="/es"`, current 2 of 5, pushes `/es?page=1`;
- Next with `path="/ca"`, current 2 of 5, pushes `/ca?page=3`;
- Previous is disabled on page 1 and its click pushes nothing;
- Next is disabled on the last page and its click pushes nothing;
- the root has `flex`, `flex-wrap`, `justify-center` and `gap-4`.

**New in `Pagination.test.tsx`:**
- with `query={{ roasteryName: "Nómada", page: "2" }}` and `path="/es/offerings"`, Next pushes `/es/offerings?roasteryName=N%C3%B3mada&page=3`. `page` is replaced in place; the exact encoding is whatever `URLSearchParams` produces, asserted as built.
- a repeated key (`{ process: ["washed", "natural"] }`) keeps both values.

**New in `OfferingList.test.tsx`** (keeps the landing's address covered at the host):
- with `locale="es"` and `meta` page 1 of 2, Next pushes `/es?page=2`. The router mock already exists in that file.

**Must keep passing unchanged:**
- `OfferingList.test.tsx` (every case, including the success, boundary, empty, error and retry cases);
- `OfferingSkeletonCard.test.tsx`;
- `src/widgets/offering-list/api/offerings.test.ts` (its `fetchVerifiedOfferings` cases);
- `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` (its `resolveTaxonomies` cases);
- `src/pages/home/ui/HomeScreen.test.tsx`, `HomeHero.test.tsx` and both `ExploreButton.test.tsx`;
- `src/entities/offering/ui/OfferingCard.test.tsx`;
- `src/shared/ui/index.test.tsx`;
- the guards, in particular `client-boundary.test.ts` (`Pagination.tsx` must start with `"use client"`), `color-guard`, `focus-guard`, `xss-guard`, and `catalog-guard`.

**Verification.**
- `npm run test:run`, `npm run lint` and `npx tsc --noEmit` pass.
- The landing `/es` captured at 375px and 1280px matches the captures from before the change. This is the visual review of section 2; it needs the local read mock, because the local database has no offerings.

## 7. Contrast

Not applicable. No colour, token or surface changes, so no pair is measured or registered (criterion D). The pagination buttons' boundary is `fix-button-boundaries`' subject.

## 8. Responsive behaviour

Unchanged. The two buttons sit on one row and wrap only if the container is narrower than both. At 375px they fit side by side (two buttons with short labels plus a 1rem gap, within 343px of content). That width is **unverified** for the longest catalog label.

## 9. Texts

No new keys. The landing keeps `paginationPreviousLabel` and `paginationNextLabel` from its catalog area. Later hosts pass their own labels.

## 10. Contract

- `listOlfactoryTaxonomies` (`GET /taxonomies`, public): request and error handling unchanged. Any failure throws, and the landing maps it to its one error state (landing spec "Error and retry").
- `listOfferings`: unchanged. The `page` query of the front's own URL is passed through as today.

## 11. Order and dependencies

- It goes before the propose of `add-specialist-evaluations` (its Open 13 a), `add-offering-catalog` and `add-offering-management`, which all reuse `Pagination` and, where they need it, `entities/taxonomy`. `add-filter-controls` depends on `add-offering-catalog`, so it follows.
- Shared files:
  - `src/shared/ui/index.ts` and `index.test.tsx` are also edited by `refactor-badge-geometry` and `add-evaluation-scales`. Each change adds its own export lines, so a textual conflict is possible in the same block, and the resolution keeps both sides.
  - `add-auth` (in Apply) edits `src/shared/api/index.ts`. This change does not touch that file.
  - None of these overlaps was simulated with `git merge-tree`, because these branches do not exist yet.
- It does not touch `globals.css` or `Button.tsx`, so it can run in parallel with `fix-button-boundaries`.

## 12. Visual reference

No visible change, so no MVC capture applies. The reference is the landing `/es` on `develop` (hero, offerings grid, pagination) at 375px and 1280px, captured before the change with the read mock. The after captures must match.

## Open

1. **Pagination interface.**
   - Question: how does the shared pagination learn its address?
   - Options:
     - a) The host passes `previousHref` and `nextHref`. The component is the simplest, but each host builds the query itself: catalog, management, evaluations and filters would each repeat it, or need a helper.
     - b) The host passes `path` and `query`, and the component replaces `page` (§3). Query handling is written and tested once. The props can be serialized, so a Server Component host such as `OfferingList` can render it.
     - c) The component reads `usePathname()` and `useSearchParams()` itself. It needs no route props, but the docs require a `Suspense` boundary in prerendered routes, and it is harder to test.
   - Recommendation: b). It keeps the landing's addresses exactly and serves the query-keeping hosts (`add-offering-catalog` line 63, `add-filter-controls` line 164). Sources: the Next.js docs cited in §0, and `OfferingList` being a Server Component (verified in code).
   - Blocks propose: yes. It is a shared component's interface, used by four later changes.
2. **One change or two.**
   - Question: `openspec/config.yaml` says "A change is described by one verb and one object … If it needs 'and', split it". This change-id has "and".
   - Options:
     - a) Keep one change, as Product owner named it in the evaluations summary's Open 13 a).
     - b) Split it into `extract-taxonomy-entity` and `extract-pagination` (`content-structure`).
   - Recommendation: a). Both halves free the same widget for the same consumers, and they touch the same files (`OfferingList`, `VerifiedOfferings`, the widget `index.ts`), so two branches would conflict on them. The taxonomy half alone has no observable behaviour, so it could carry no spec delta, and whether `openspec validate --strict` accepts a change with none is **unverified**. b) follows the config rule literally.
   - Blocks propose: yes, because it fixes the branch and folder names.

Settled by the orchestrator, 2026-10-06 (Product owner may reopen them):
- Open 1: b). Verified constraint: `OfferingList` is a Server Component, so the props must be serializable; it keeps the landing's addresses and serves the query-keeping hosts.
- Open 2: a), one change, renamed `extract-offering-list-parts` (one verb, one object) so it meets the `config.yaml` rule without a split. Both halves free the same widget and touch the same files.

## Review log

- **2026-10-06, design lead (draft).** Generated from the evaluations summary (Open 13 a), the catalog, management and filter-controls summaries, the code under `src/widgets/offering-list/`, the landing and content-structure specs, `config.yaml`, the FSD skill and the local Next.js docs.
  - B1 (semantic): the capability. `config.yaml` places pagination in `content-structure`, while the taxonomy move changes no behaviour and needs no capability of its own. Settled as `content-structure`.
  - B2 (code, verified constraint): `resolveTaxonomies` stays in the widget, because an entity slice cannot import `entities/offering` (AGENTS.md: no imports between slices of one layer).
  - B3 (code, verified constraint): `entities/taxonomy` rather than `shared/api`. `shared` is business-agnostic, and `shared/api` holds only the type aliases (FSD skill).
  - B4: `model/` rather than `lib/` for the exported lookup (FSD skill, "Segments inside a slice").
  - B5: the five `OfferingPagination` cases are moved and adapted, never dropped, and a host-level case keeps `/{locale}?page=n` covered in `OfferingList.test.tsx`.

## Propose status

- Change-id: `extract-offering-list-parts`. Date: 2026-10-06. Branch `feature/extract-offering-list-parts`.
- `openspec validate extract-offering-list-parts --strict`: passed ("Change 'extract-offering-list-parts' is valid").
- Artifacts: `openspec/changes/extract-offering-list-parts/` — proposal.md, `specs/content-structure/spec.md` (one ADDED requirement, "Pagination", four scenarios), design.md (D1–D9), tasks.md (4 groups, 8 tasks).
- Resolved:
  - Open 1 (Pagination interface): b) — the host passes `path` and `query` and the control replaces only `page`; recorded as design.md D3 (interface) and D4 (address building).
  - Open 2 (one change or two): a) one change, named `extract-offering-list-parts`; recorded in proposal.md (scope and non-goals).
  - Handoff D1: the requirement is phrased as the pagination control's contract inside the current `content-structure` Purpose; the Purpose is not amended.
  - Handoff D2: one scenario added — "Paging only with a successful list" (the paging actions render only below a successful, non-empty list; the host owns loading, empty and error).
  - Handoff D3: `TaxonomiesPayload` is exported from `src/shared/api/index.ts` and the entity imports it from there (design.md D2). Consequences over this file, reported not edited: §2 sends the type to `entities/taxonomy/api/taxonomies.ts` and §11 says the change does not touch `src/shared/api/index.ts`; D3 supersedes both — the type lives in `shared/api`, and the file is now shared with `add-auth` (each change adds its own export lines).
  - Handoff D4: the wording fixes are applied in the artifacts — "same cases and assertions, fixtures copied"; `src/shared/ui/index.test.tsx` gains one smoke render and its other cases stay; `OfferingList.test.tsx` gains exactly one case; the `ExploreButton.test.tsx` comment is updated to name `Pagination.test.tsx` (design.md D8/D9, tasks 2.1, 3.1, 3.3).
- Backlog: no entry in `docs/backlog.md` (R1–R4) names this change; it resolves none.
- Remains open: nothing. The 375px width for the longest catalog label stays unverified here and is checked by the task 4.1 visual comparison (design.md Risks).
