# Test reduction — pass 1 result

- **Date:** 2026-10-07 (scheduled run for the Product owner decision of 2026-10-08).
- **Branch:** `claude/test-reduction-apply`, from `origin/develop` at `d0124cb`.
- **Plan applied:** `docs/testing/test-reduction-plan.md` on `claude/test-reduction-plan` (measured on `8803904`), sections 3.1 and 3.2.
- **Guard decision applied:** `theme-tokens.test.ts` is now 4 general tests: dark-theme completeness, contrast pairs, typography roles, radius and focus. Each test loops over every item and fails with the list of offending items. All 697 items that are not pins are still asserted. Its 10 design-value pins moved to QA.
- **QA export:** the moved cases are on branch `claude/test-reduction-qa`, under `qa-suite/<original path>`. That is 109 files and 570 cases. All of them pass when put back at their original path on `d0124cb`.

## Totals

| | Files | Cases | Vitest duration |
|---|---|---|---|
| Before (`d0124cb`) | 161 | 2,246 | 99.0 s |
| After (pass 1) | 144 | 937 | 83.5 s |

The 1,309 cases that left the repository break down as follows:
- 570 moved to QA;
- 693 are `theme-tokens` items that are now checked inside the 4 guard tests;
- 45 were deleted;
- 1 was merged (`sort-control` into `Select.test.tsx`).

## Per capability (files touched in pass 1)

| Capability | Files before | Cases before | Files after | Cases after |
|---|---|---|---|---|
| theming (incl. theme-tokens guard) | 2 | 722 | 2 | 12 |
| base-controls | 2 | 45 | 2 | 25 |
| app-shell | 12 | 126 | 10 | 71 |
| auth | 7 | 92 | 7 | 45 |
| user-account | 15 | 124 | 11 | 61 |
| content-structure | 4 | 46 | 4 | 35 |
| feedback | 5 | 131 | 5 | 77 |
| form-fields | 10 | 177 | 10 | 92 |
| filtering | 19 | 168 | 16 | 63 |
| landing | 9 | 57 | 6 | 27 |
| offering-catalog | 11 | 85 | 10 | 47 |
| evaluations | 13 | 115 | 11 | 70 |
| offering-management | 7 | 79 | 5 | 33 |
| **Touched** | **116** | **1,967** | **99** | **658** |
| Untouched (KEEP, other guards, excluded) | 45 | 279 | 45 | 279 |

## Excluded from pass 1 (reduce in pass 2)

These files are modified by in-flight branches: `feature/refine-list-pagination`, `feature/add-coffeeshop-location`, `feature/add-evaluation-facets`, and the `claude/*` branches committed after 2026-10-07T21:00Z. Together they hold 208 cases.

| File | Cases | Plan action |
|---|---|---|
| `app/[locale]/@sidebar/route-files.test.tsx` | 5 | KEEP-TRIM |
| `proxy.test.ts` | 16 | KEEP-TRIM |
| `src/entities/contact/ui/ContactFields.test.tsx` | 18 | KEEP-TRIM |
| `src/entities/evaluation/api/user-evaluations.test.ts` | 12 | KEEP-TRIM |
| `src/features/offering-management/ui/ManagementSidebarEntries.test.tsx` | 2 | MERGE INTO ManageOfferingsSidebarEntries |
| `src/pages/evaluations-list/ui/EvaluationsList.test.tsx` | 9 | KEEP-TRIM |
| `src/pages/home/ui/HomeScreen.test.tsx` | 9 | KEEP-TRIM |
| `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx` | 26 | KEEP-TRIM |
| `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.test.tsx` | 3 | KEEP (merge target) |
| `src/pages/new-offering/ui/NewOfferingSidebarEntries.test.tsx` | 3 | KEEP-TRIM |
| `src/pages/offerings/ui/OfferingsScreen.test.tsx` | 5 | KEEP-TRIM |
| `src/shared/lib/filter-query/filter-query.test.ts` | 11 | MOVE-QA |
| `src/shared/ui/Pagination.test.tsx` | 7 | KEEP-TRIM |
| `src/shared/ui/icons.test.ts` | 13 | guard: reduce to 1 test |
| `src/shared/ui/index.test.tsx` | 32 | MOVE-QA |
| `src/widgets/offering-list/api/offerings.test.ts` | 7 | KEEP-TRIM |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | 19 | KEEP-TRIM |
| `src/widgets/offering-list/ui/FilteredOfferingsResults.test.tsx` | 9 | not in plan (same folder as excluded OfferingList tests) |
| `src/pages/offerings/ui/OfferingsToolbarScreen.test.tsx` | 2 | not in plan (split from excluded OfferingsScreen) |

## Deviations and judgement calls

- **`icons.test.ts`:** the decision reduces it to 1 test, but three in-flight branches modify it. It stays unchanged until pass 2.
- **`OfferingFacets.test.tsx`:** the plan's two sections disagree. §3.2 lists 7 kept cases and §3.1 says 6. The 7 cases of §3.2 were kept.
- **`OfferingsSidebarScreen.test.tsx`:** this is the plan's renamed `OfferingsSidebar.test.tsx`. It keeps the anonymous row, as the plan says.
- **`AccountSection.test.tsx`:** the plan gives counts but does not name the deleted case. The deleted case is "shows the heading alone when there is no description", because the kept header-band case asserts the same thing.
- **Folds into kept cases:**
  - Button: border, compact size, compact icon-only, disabled activation, busy no-hover.
  - Link: the protocol-relative URL rejection.
  - Logo: the dark hex values.
  - theme.test: the unknown-theme cookie.
- **Deleted duplicates with assertions that no kept test makes any more:**
  - ExternalLink: the link's class list.
  - RegisterSuccessPanel: the heading's `tabindex="-1"` and the Sign in button's `bg-action-primary`.

  Neither is the only test of a spec scenario.
- **Scenarios whose only test was not kept:** none.

## Pass 2

- **Date:** 2026-10-08 (scheduled run).
- **Branch:** `claude/test-reduction-apply2`, from `origin/develop` at `85cd8f1` (`f35b6b3` plus a docs-only commit). Every change of the delivery is merged.
- **Scope:** the 19 files excluded from pass 1, and every test file added or grown since pass 1 (`3f6b3772`) by add-coffeeshop-location, add-evaluation-facets, refine-list-pagination, add-coffeeshop-directory, add-public-evaluations, add-not-found-page, extract-filtered-offerings and extract-clear-filters-button. That is 76 files and 568 cases.
- **Rule applied:** one focused test per scenario of `openspec/specs/`, plus the guards and the reproducing tests of unplanned fixes. Nothing was deleted: every case that left the repository is on `claude/test-reduction-qa2`, under `qa-suite/<original path>`. That is 50 files and 243 cases, and all of them pass when put back at their original path on `85cd8f1`.
- **Guards:** all kept, and no new ones. `icons.test.ts` is now 1 general test: only `@/shared/ui/icons` imports lucide-react, and every icon the app uses is exported. It loops over every item and lists the offenders. Its 3 BeanMark render cases (design-value pins) moved to QA. `leaflet-guard.test.ts` is unchanged.

### Totals

| | Files | Cases | Vitest duration |
|---|---|---|---|
| Before (`85cd8f1`) | 195 | 1,241 | 87.4 s |
| After (pass 2) | 181 | 986 | 85.6 s |

The 255 cases that left break down as follows:
- 243 moved to QA;
- 12 `icons` items are now checked inside the 1 guard test.

### Per capability (in-scope files)

| Capability | Files before | Cases before | Files after | Cases after |
|---|---|---|---|---|
| app-shell | 7 | 67 | 6 | 53 |
| base-controls (icons guard, shared/ui index) | 2 | 50 | 1 | 1 |
| content-structure | 1 | 26 | 1 | 15 |
| evaluations | 13 | 81 | 9 | 44 |
| filtering | 8 | 80 | 7 | 29 |
| landing | 3 | 29 | 3 | 17 |
| offering-catalog | 26 | 102 | 23 | 83 |
| offering-management | 15 | 110 | 11 | 63 |
| user-account | 1 | 23 | 1 | 8 |
| **In scope** | **76** | **568** | **62** | **313** |
| Out of scope (unchanged) | 119 | 673 | 119 | 673 |

### Scenario coverage

- **Audited:** the 203 scenarios that tonight's changes added or changed in `openspec/specs/` (app-shell 9, content-structure 13, evaluations 35, filtering 40, landing 2, offering-catalog 67, offering-management 37). Each was matched to one test in the repository. The old scenarios cited by the plan's coverage map keep their cited test or an equivalent case.
- **No scenario lost its only test** in this pass.
- **Reproducing tests of unplanned fixes kept:**
  - `LocationsMap` reduced-motion panning (`be9f6738`);
  - `EvaluationFacets` scroll anchoring (`437ed1a1`);
  - `EvaluationsList` previous height (`437ed1a1`);
  - `evaluation-facets/model/query` invalid score range (`160242e7`);
  - `VerifiedOfferings` six per page (`65ca95a8`).
- **Partly covered:** a kept test asserts only part of the THEN for these scenarios.
  - offering-catalog:
    - Catalog without fixed keys unchanged;
    - An offering without evaluations;
    - Paging only with a successful list;
    - Coffee shop filter cannot be replaced;
    - Filters apply inside the tab;
    - Offerings tab States.
  - evaluations and filtering:
    - Request failure (facet values kept);
    - Applying a facet value;
    - Removing one chip;
    - Facets on a small screen;
    - A specialist sees the facets (position);
    - Distinct sorted options;
    - Back restores the previous filters;
    - Mobile overlay;
    - Loading keeps the facets;
    - List error keeps the facets;
    - Small viewport;
    - Trigger opens the sidebar.
  - offering-management:
    - Cancelling (nothing sent);
    - The creation is rejected or fails (API message not rendered);
    - Texts follow the locale (locations: heading only).

### Uncovered scenarios (findings, no test written)

| Capability | Requirement | Scenario |
|---|---|---|
| content-structure | Pagination page numbers | Fits a narrow viewport (visual check only, refine-list-pagination task 5.2) |
| evaluations | Read-only evaluation view | Retrying after a failure (Retry is shown, never activated) |
| filtering | Evaluation facet options | Status options (order Any, Open, Closed) |
| filtering | Coffee shop filter toolbar | Toolbar wraps on a small viewport |
| offering-catalog | Filtered offerings scoped by a host | Scoped list fails |
| offering-catalog | Coffee shop directory page | Retry reloads |
| offering-catalog | Directory map view | Failed tiles |
| offering-catalog | Directory texts and metadata | Localized texts (only the catalog-guard key parity) |
| offering-management | Localized location texts | Response messages not shown |

### Judgement calls

- **Plan actions:** the plan's actions were applied to the 19 excluded files.
  - `filter-query.test.ts`, `index.test.tsx` and `OfferingsToolbarScreen.test.tsx` moved whole to QA. The scenarios behind their newer cases are covered elsewhere (`EvaluationFacets`, `ClearFiltersButton`).
  - `ManagementSidebarEntries.test.tsx` was merged into `ManageOfferingsSidebarEntries.test.tsx`.
  - `FilteredOfferingsResults` took over the plan's kept OfferingsScreen cases.
- **`app/[locale]/[...rest]/page.test.tsx`:** moved to QA. "Unknown route stays not found" stays covered by `app/[locale]/default.test.tsx`, as the plan's coverage map says.
- **`fetchVerifiedOfferings`:** its test moved to QA. The function is no longer called in `src/`; the landing goes through `fetchOfferings`. It is dead code and a backlog candidate.
- **No repo test any more:**
  - that a card's "Show on map" action writes `view=map&focus=…` (`ShowOnMapButton`). Focus from a card is covered by `LocationsMap`, given the address.
  - that the sort survives Next on the directory list.
- **Collision with pass 1 on the QA branch:** three twins would collide with pass-1 twins of the same path, so they carry a `.pass2` suffix. They are `OfferingDetailScreen`, `DetailTabs` and `OfferingDetailContent`.
- **Commit scope of `icons.test.ts` and `index.test.tsx`:** they have no capability of their own, so they were committed under `base-controls` (the shared UI segment).
- **Duplicates left in place:**
  - `HomeScreen` and `AboutContent` both keep a "pads every section" case.
  - `submit-location` and `geocoding/index` both keep a lookup case.
  - Product owner may drop one of each.
